import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgZone } from '@angular/core';
import { NgProfilerModule } from './ng-profiler.module';
import { NgProfilerService } from './services/ng-profiler.service';
import { ProfilerStore } from './services/profiler-store.service';

describe('NgProfiler', () => {
  let service: NgProfilerService;
  let store: ProfilerStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgProfilerModule.forRoot()],
      providers: [
        NgZone
      ]
    });
    service = TestBed.inject(NgProfilerService);
    store = TestBed.inject(ProfilerStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have profiler store', () => {
    expect(store).toBeTruthy();
  });

  it('should detect zone mode', () => {
    expect(typeof service.isZonedMode()).toBe('boolean');
  });
});
