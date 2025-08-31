import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgProfilerOverlayComponent } from './components/ng-profiler-overlay.component';
import { NgProfilerDirective } from './directives/ng-profiler.directive';
import { NgProfilerService } from './services/ng-profiler.service';
import { ProfilerStore } from './services/profiler-store.service';
import { NgProfilerConfig, NG_PROFILER_CONFIG } from './models/ng-profiler-config';

@NgModule({
  imports: [
    CommonModule,
    NgProfilerOverlayComponent,
    NgProfilerDirective
  ],
  exports: [
    NgProfilerOverlayComponent,
    NgProfilerDirective
  ]
})
export class NgProfilerModule {
  static forRoot(config?: NgProfilerConfig): ModuleWithProviders<NgProfilerModule> {
    return {
      ngModule: NgProfilerModule,
      providers: [
        ProfilerStore,
        NgProfilerService,
        {
          provide: NG_PROFILER_CONFIG,
          useValue: config || {}
        }
      ]
    };
  }
}
