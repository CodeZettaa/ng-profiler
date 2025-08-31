import { Injectable, Inject, ApplicationRef } from '@angular/core';
import { ProfilerStore } from './profiler-store.service';
import { NgProfilerConfig, NG_PROFILER_CONFIG } from '../models/ng-profiler-config';

@Injectable({
  providedIn: 'root',
})
export class NgProfilerService {
  private isEnabled = false;
  private isZoned = false;
  private originalTick: any;
  private frameStartTime = 0;
  private longTaskObserver: PerformanceObserver | null = null;
  private animationFrameId: number | null = null;

  constructor(
    private appRef: ApplicationRef,
    private profilerStore: ProfilerStore,
    @Inject(NG_PROFILER_CONFIG) private config: NgProfilerConfig
  ) {
    this.detectZone();
    this.setupHotkey();
  }

  /**
   * Initialize the profiler
   */
  initialize(): void {
    console.log('NgProfiler: Initializing profiler...');
    console.log('NgProfiler: shouldEnable() =', this.shouldEnable());
    console.log('NgProfiler: isProduction() =', this.isProduction());
    console.log('NgProfiler: isZoned =', this.isZoned);

    if (!this.shouldEnable()) {
      console.log('NgProfiler: Profiler disabled');
      return;
    }

    console.log('NgProfiler: Profiler enabled');
    this.isEnabled = true;

    if (this.isZoned) {
      console.log('NgProfiler: Setting up zoned measurement');
      this.patchApplicationRef();
    } else {
      console.log('NgProfiler: Setting up zoneless measurement');
      this.setupZonelessMeasurement();
    }
  }

  /**
   * Check if profiler should be enabled
   */
  private shouldEnable(): boolean {
    if (this.config.enableInProduction) {
      return true;
    }

    // Disable in production unless forced
    return !this.isProduction();
  }

  /**
   * Check if running in production
   */
  private isProduction(): boolean {
    return (
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1' &&
      window.location.protocol !== 'file:'
    );
  }

  /**
   * Detect if Zone.js is present
   */
  private detectZone(): void {
    this.isZoned = typeof (window as any).Zone !== 'undefined' && (window as any).Zone.current;
  }

  /**
   * Patch ApplicationRef.tick() for zoned applications
   */
  private patchApplicationRef(): void {
    if (this.originalTick) {
      return; // Already patched
    }

    this.originalTick = this.appRef.tick;

    this.appRef.tick = () => {
      const startTime = performance.now();

      try {
        const result = this.originalTick.call(this.appRef);
        const endTime = performance.now();
        const duration = endTime - startTime;

        if (this.isEnabled) {
          this.profilerStore.addFrameMeasurement(duration);
        }
        return result;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        if (this.isEnabled) {
          this.profilerStore.addFrameMeasurement(duration);
        }
        throw error;
      }
    };
  }

  /**
   * Setup measurement for zoneless applications
   */
  private setupZonelessMeasurement(): void {
    // Use requestAnimationFrame to measure frame timing
    const measureFrame = () => {
      const currentTime = performance.now();

      if (this.frameStartTime > 0 && this.isEnabled) {
        const frameDuration = currentTime - this.frameStartTime;
        this.profilerStore.addFrameMeasurement(frameDuration);
      }

      this.frameStartTime = currentTime;
      this.animationFrameId = requestAnimationFrame(measureFrame);
    };

    this.animationFrameId = requestAnimationFrame(measureFrame);

    // Setup PerformanceObserver for long tasks
    if ('PerformanceObserver' in window) {
      try {
        this.longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'longtask' && this.isEnabled) {
              const duration = entry.duration;
              this.profilerStore.addFrameMeasurement(duration);
            }
          }
        });

        this.longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        console.warn('NgProfiler: PerformanceObserver not supported');
      }
    }
  }

  /**
   * Setup hotkey listener
   */
  private setupHotkey(): void {
    const hotkey = this.config.hotkey || 'Ctrl+Shift+P';

    document.addEventListener('keydown', (event) => {
      const isCtrl = event.ctrlKey || event.metaKey;
      const isShift = event.shiftKey;
      const isP = event.key === 'p' || event.key === 'P';

      if (isCtrl && isShift && isP) {
        event.preventDefault();
        console.log('NgProfiler: Hotkey detected, toggling overlay');
        this.toggleOverlay();
      }
    });
  }

  /**
   * Toggle overlay visibility
   */
  toggleOverlay(): void {
    // This will be handled by the overlay component
    console.log('NgProfiler: Dispatching toggle event');
    const event = new CustomEvent('ng-profiler-toggle');
    document.dispatchEvent(event);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.originalTick && this.appRef.tick !== this.originalTick) {
      this.appRef.tick = this.originalTick;
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.longTaskObserver) {
      this.longTaskObserver.disconnect();
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): NgProfilerConfig {
    return { ...this.config };
  }

  /**
   * Check if profiler is enabled
   */
  isProfilerEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Check if running in zoned mode
   */
  isZonedMode(): boolean {
    return this.isZoned;
  }

  /**
   * Pause profiling temporarily
   */
  pauseProfiling(): void {
    this.isEnabled = false;

    // Also stop any ongoing measurements
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.longTaskObserver) {
      this.longTaskObserver.disconnect();
    }
  }

  /**
   * Resume profiling
   */
  resumeProfiling(): void {
    if (this.shouldEnable()) {
      this.isEnabled = true;

      // Restart measurements if they were stopped
      if (!this.isZoned && !this.animationFrameId) {
        this.setupZonelessMeasurement();
      }
    }
  }
}
