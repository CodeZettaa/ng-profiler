import { InjectionToken } from '@angular/core';

export interface NgProfilerConfig {
  /** Enable profiler in production (default: false) */
  enableInProduction?: boolean;

  /** Hotkey to toggle overlay (default: 'Ctrl+Shift+P') */
  hotkey?: string;

  /** Position of overlay (default: 'top-right') */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  /** Threshold for render count warnings (default: 10) */
  renderCountThreshold?: number;

  /** Threshold for frame duration warnings in ms (default: 16.67) */
  frameDurationThreshold?: number;

  /** Enable heatmap outlines (default: true) */
  enableHeatmap?: boolean;

  /** Enable performance measurement (default: true) */
  enableMeasurement?: boolean;
}

export const NG_PROFILER_CONFIG = new InjectionToken<NgProfilerConfig>('NgProfilerConfig');

export interface ProfilerStats {
  /** Last tick/frame duration in ms */
  lastFrameDuration: number;

  /** Average frame duration in ms */
  averageFrameDuration: number;

  /** Total number of frames measured */
  frameCount: number;

  /** Top components by render count */
  topComponents: ComponentRenderStats[];

  /** Timestamp of last measurement */
  lastMeasurement: number;

  /** Performance recommendations */
  recommendations?: PerformanceRecommendation[];
}

export interface ComponentRenderStats {
  /** Component name or element tag */
  name: string;

  /** Number of renders */
  renderCount: number;

  /** Severity level */
  severity: 'low' | 'medium' | 'high';

  /** Element reference for heatmap */
  element?: HTMLElement;
}

export interface FrameMeasurement {
  duration: number;
  timestamp: number;
}

export interface PerformanceRecommendation {
  id: string;
  type: 'warning' | 'error' | 'info' | 'optimization';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'memory' | 'rendering' | 'best-practice';
  suggestions: string[];
  impact: string;
  priority: number;
}

// Zone.js type declaration
declare global {
  interface Window {
    Zone?: any;
  }
}
