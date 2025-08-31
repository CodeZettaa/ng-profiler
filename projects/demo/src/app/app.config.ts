import { ApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNgProfiler } from '../../../ng-profiler/src/lib/providers/ng-profiler.providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    provideZonelessChangeDetection(),
    ...provideNgProfiler({
      enableInProduction: true, // Enable for demo
      position: 'top-right',
      enableHeatmap: true,
      enableMeasurement: true,
    }),
  ],
};
