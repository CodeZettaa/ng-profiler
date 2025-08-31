import { Directive, ElementRef, OnInit, OnDestroy, DoCheck, AfterViewChecked, Input } from '@angular/core';
import { ProfilerStore } from '../services/profiler-store.service';

@Directive({
  selector: '[codezettaNgProfiler]',
  standalone: true
})
export class NgProfilerDirective implements OnInit, OnDestroy, DoCheck, AfterViewChecked {
  @Input('codezettaNgProfiler') componentName?: string;
  
  private renderCount = 0;
  private elementName: string;
  private isDestroyed = false;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private profilerStore: ProfilerStore
  ) {
    this.elementName = this.getComponentName();
  }

  ngOnInit(): void {
    this.updateHeatmapAttribute();
  }

  ngDoCheck(): void {
    if (!this.isDestroyed) {
      this.renderCount++;
      this.profilerStore.incrementRenderCount(this.elementName, this.elementRef.nativeElement);
      this.updateHeatmapAttribute();
    }
  }

  ngAfterViewChecked(): void {
    // Additional render tracking if needed
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
  }

  /**
   * Get component name for tracking
   */
  private getComponentName(): string {
    if (this.componentName) {
      return this.componentName;
    }

    const element = this.elementRef.nativeElement;
    
    // Try to get component name from various sources
    if (element.tagName) {
      return element.tagName.toLowerCase();
    }
    
    if (element.className) {
      return element.className.split(' ')[0];
    }
    
    return 'unknown-component';
  }

  /**
   * Update heatmap attribute based on render count
   */
  private updateHeatmapAttribute(): void {
    const element = this.elementRef.nativeElement;
    const severity = this.getSeverityLevel();
    
    if (severity) {
      element.setAttribute('data-ng-profiler', severity);
    } else {
      element.removeAttribute('data-ng-profiler');
    }
  }

  /**
   * Get severity level based on render count
   */
  private getSeverityLevel(): 'low' | 'medium' | 'high' | null {
    if (this.renderCount <= 5) return null; // No heatmap for low counts
    if (this.renderCount <= 20) return 'low';
    if (this.renderCount <= 50) return 'medium';
    return 'high';
  }

  /**
   * Get current render count
   */
  getRenderCount(): number {
    return this.renderCount;
  }
}
