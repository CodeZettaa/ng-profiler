# @codezetta/ng-profiler Usage Guide

## Quick Start

### 1. Installation

```bash
npm install @codezetta/ng-profiler
```

### 2. Setup Options

#### Option A: NgModule Approach (Traditional)

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { NgProfilerModule } from '@codezetta/ng-profiler';

@NgModule({
  imports: [
    NgProfilerModule.forRoot()
  ]
})
export class AppModule { }
```

```typescript
// app.component.ts
import { Component, OnInit } from '@angular/core';
import { NgProfilerService } from '@codezetta/ng-profiler';

@Component({
  selector: 'app-root',
  template: `
    <div>Your app content</div>
    <codezetta-ng-profiler-overlay></codezetta-ng-profiler-overlay>
  `
})
export class AppComponent implements OnInit {
  constructor(private profilerService: NgProfilerService) {}

  ngOnInit() {
    this.profilerService.initialize();
  }
}
```

#### Option B: Standalone Components (Modern Angular)

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideNgProfiler } from '@codezetta/ng-profiler';

export const appConfig: ApplicationConfig = {
  providers: [
    ...provideNgProfiler()
  ]
};
```

```typescript
// app.component.ts
import { Component, OnInit } from '@angular/core';
import { NgProfilerOverlayComponent, NgProfilerDirective } from '@codezetta/ng-profiler';
import { NgProfilerService } from '@codezetta/ng-profiler';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgProfilerOverlayComponent, NgProfilerDirective],
  template: `
    <div>Your app content</div>
    <codezetta-ng-profiler-overlay></codezetta-ng-profiler-overlay>
  `
})
export class AppComponent implements OnInit {
  constructor(private profilerService: NgProfilerService) {}

  ngOnInit() {
    this.profilerService.initialize();
  }
}
```

### 3. Track Components

```html
<!-- Track with default name -->
<div codezettaNgProfiler>
  <!-- Your component content -->
</div>

<!-- Track with custom name -->
<div codezettaNgProfiler="my-custom-component">
  <!-- Your component content -->
</div>
```

### 4. Include CSS (Optional)

```css
/* styles.css */
@import '@codezetta/ng-profiler/styles/ng-profiler.css';
```

## Configuration Options

```typescript
// NgModule approach
NgProfilerModule.forRoot({
  enableInProduction: false,
  hotkey: 'Ctrl+Shift+P',
  position: 'top-right',
  renderCountThreshold: 10,
  frameDurationThreshold: 16.67,
  enableHeatmap: true,
  enableMeasurement: true
})

// Standalone approach
provideNgProfiler({
  enableInProduction: false,
  hotkey: 'Ctrl+Shift+P',
  position: 'top-right',
  renderCountThreshold: 10,
  frameDurationThreshold: 16.67,
  enableHeatmap: true,
  enableMeasurement: true
})
```

## Features

### 🔥 Heatmap Visualization

Components with high render counts get visual indicators:

- 🟢 **Green**: Low render count (6-20)
- 🟡 **Yellow**: Medium render count (21-50)  
- 🔴 **Red**: High render count (50+)

### 📊 Performance Metrics

The overlay shows:
- Last frame duration
- Average frame duration
- Total frames measured
- Top 10 components by render count

### 🎯 Zone.js Detection

Automatically detects and adapts to:
- **Zoned apps**: Patches `ApplicationRef.tick()`
- **Zoneless apps**: Uses `requestAnimationFrame` + `PerformanceObserver`

### ⌨️ Hotkey Support

- Toggle overlay: `Ctrl+Shift+P` (configurable)
- Close overlay: `Escape` key

## Advanced Usage

### Custom Component Tracking

```typescript
// Track specific components programmatically
import { ProfilerStore } from '@codezetta/ng-profiler';

@Component({...})
export class MyComponent {
  constructor(private profilerStore: ProfilerStore) {}

  expensiveOperation() {
    // Your expensive operation
    this.profilerStore.incrementRenderCount('expensive-operation');
  }
}
```

### Export Statistics

```typescript
import { ProfilerStore } from '@codezetta/ng-profiler';

@Component({...})
export class MyComponent {
  constructor(private profilerStore: ProfilerStore) {}

  exportStats() {
    const stats = this.profilerStore.exportStats();
    console.log('Profiler stats:', stats);
  }
}
```

### Reset Statistics

```typescript
import { ProfilerStore } from '@codezetta/ng-profiler';

@Component({...})
export class MyComponent {
  constructor(private profilerStore: ProfilerStore) {}

  resetStats() {
    this.profilerStore.reset();
  }
}
```

## Standalone Component Usage

### Importing Individual Components

```typescript
import { 
  NgProfilerOverlayComponent, 
  NgProfilerDirective 
} from '@codezetta/ng-profiler';

@Component({
  standalone: true,
  imports: [NgProfilerOverlayComponent, NgProfilerDirective],
  // ...
})
```

### Using with Other Standalone Components

```typescript
// my-feature.component.ts
import { Component } from '@angular/core';
import { NgProfilerDirective } from '@codezetta/ng-profiler';

@Component({
  selector: 'app-my-feature',
  standalone: true,
  imports: [NgProfilerDirective],
  template: `
    <div codezettaNgProfiler="my-feature">
      <!-- Feature content -->
    </div>
  `
})
export class MyFeatureComponent {}
```

### Lazy Loading with Standalone Components

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { NgProfilerOverlayComponent } from '@codezetta/ng-profiler';

export const routes: Routes = [
  {
    path: 'feature',
    loadComponent: () => import('./feature.component').then(m => m.FeatureComponent),
    children: [
      {
        path: '',
        component: NgProfilerOverlayComponent
      }
    ]
  }
];
```

## Troubleshooting

### Profiler Not Showing

1. Check if you're in production mode (disabled by default)
2. Ensure `profilerService.initialize()` is called
3. Verify the overlay component is in your template
4. For standalone: ensure providers are configured in `app.config.ts`

### Heatmap Not Working

1. Include the CSS file: `@import '@codezetta/ng-profiler/styles/ng-profiler.css';`
2. Check if `enableHeatmap: true` in configuration
3. Ensure components have the `codezettaNgProfiler` directive

### Performance Issues

1. The profiler is designed for development only
2. Disable in production unless explicitly needed
3. Use `enableInProduction: false` (default)

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support  
- Safari: Full support
- IE: Not supported (requires Angular 20+)

## Performance Impact

The profiler is optimized for minimal impact:
- Measurements are batched
- Memory usage is limited
- All profiling disabled in production by default
- Heatmap updates are throttled
