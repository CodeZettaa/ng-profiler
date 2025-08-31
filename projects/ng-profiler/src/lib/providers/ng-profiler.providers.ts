import { Provider } from '@angular/core';
import { ProfilerStore } from '../services/profiler-store.service';
import { NgProfilerService } from '../services/ng-profiler.service';
import { NgProfilerConfig, NG_PROFILER_CONFIG } from '../models/ng-profiler-config';

/**
 * Provides the NgProfiler services for standalone components
 * @param config Optional configuration for the profiler
 * @returns Array of providers for dependency injection
 */
export function provideNgProfiler(config?: NgProfilerConfig): Provider[] {
  return [
    ProfilerStore,
    NgProfilerService,
    {
      provide: NG_PROFILER_CONFIG,
      useValue: config || {},
    },
  ];
}
