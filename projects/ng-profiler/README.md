# @codezetta/ng-profiler

A tiny in-app profiler overlay for Angular that works in both zoned and zoneless applications. It helps developers quickly see approximate render counts and frame timings without leaving the app.

## 🎯 Purpose

Show an overlay inside the Angular app (top-right corner) that displays:

- Last tick/frame duration (ms) and average duration
- Top 10 components/elements by render count (approximate)
- Heatmap outlines on DOM nodes that render too often (green → yellow → red)
- Auto-detect Zone.js and adapt measurement accordingly

## ✨ Features

### Overlay Component
- Toggle with hotkey (default `Ctrl+Shift+P`)
- Shows last/average tick time with color-coded warnings
- List of top 10 elements/components by render count
- Snapshot button → downloads JSON with current stats
- Reset button to clear all statistics

### Heatmap
- Adds `data-ng-profiler="low|medium|high"` attribute to DOM elements
- CSS outlines with severity indicators:
  - 🟢 Green: Low render count (6-20)
  - 🟡 Yellow: Medium render count (21-50)
  - 🔴 Red: High render count (50+)

### Measurement
- **Zoned apps**: Patches `ApplicationRef.tick()` to measure each change detection cycle
- **Zoneless apps**: Uses `requestAnimationFrame` deltas + `PerformanceObserver('longtask')`

### Dev-only
- Disabled automatically in production unless forced
- Configurable thresholds and behavior

## 🚀 Installation

```bash
npm install @codezetta/ng-profiler
```

## 📦 Setup

### Option 1: NgModule Approach (Traditional)

#### 1. Import the Module

```typescript
import { NgProfilerModule } from '@codezetta/ng-profiler';

@NgModule({
  imports: [
    NgProfilerModule.forRoot({
      // Optional configuration
      enableInProduction: false,
      hotkey: 'Ctrl+Shift+P',
      position: 'top-right',
      renderCountThreshold: 10,
      frameDurationThreshold: 16.67,
      enableHeatmap: true,
      enableMeasurement: true
    })
  ]
})
export class AppModule { }
```

#### 2. Add the Overlay Component

Add the overlay component to your app component template:

```html
<!-- app.component.html -->
<codezetta-ng-profiler-overlay></codezetta-ng-profiler-overlay>
```

#### 3. Initialize the Profiler

```typescript
import { NgProfilerService } from '@codezetta/ng-profiler';

@Component({...})
export class AppComponent implements OnInit {
  constructor(private profilerService: NgProfilerService) {}

  ngOnInit() {
    this.profilerService.initialize();
  }
}
```

### Option 2: Standalone Components (Modern Angular)

#### 1. Configure Providers

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideNgProfiler } from '@codezetta/ng-profiler';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    ...provideNgProfiler({
      enableInProduction: false,
      hotkey: 'Ctrl+Shift+P',
      position: 'top-right',
      enableHeatmap: true,
      enableMeasurement: true
    })
  ]
};
```

#### 2. Import Components in Your App

```typescript
// app.component.ts
import { Component, OnInit } from '@angular/core';
import { NgProfilerOverlayComponent, NgProfilerDirective } from '@codezetta/ng-profiler';
import { NgProfilerService } from '@codezetta/ng-profiler';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NgProfilerOverlayComponent,
    NgProfilerDirective
  ],
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

### 4. Track Components (Both Approaches)

Add the directive to components you want to track:

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

### 5. Include CSS (Optional)

For heatmap styles, include the CSS in your global styles:

```typescript
// angular.json
{
  "styles": [
    "node_modules/@codezetta/ng-profiler/styles/ng-profiler.css"
  ]
}
```

Or import in your global styles:

```css
/* styles.css */
@import '@codezetta/ng-profiler/styles/ng-profiler.css';
```

## ⚙️ Configuration

```typescript
interface NgProfilerConfig {
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
```

## 🎮 Usage

### Toggle Overlay
- Press `Ctrl+Shift+P` (or your configured hotkey)
- Click the close button (✕) in the overlay
- Press `Escape` key

### Export Statistics
Click the 📊 button in the overlay to download a JSON file with current statistics.

### Reset Statistics
Click the 🔄 button in the overlay to clear all collected data.

## 🔍 How It Works

### Zone Detection
The profiler automatically detects if Zone.js is present and adapts its measurement strategy:

- **Zoned**: Patches `ApplicationRef.tick()` to measure change detection cycles
- **Zoneless**: Uses `requestAnimationFrame` timing and `PerformanceObserver` for long tasks

### Render Counting
The `codezettaNgProfiler` directive uses `ngDoCheck` and `ngAfterViewChecked` to increment render counts for tracked components.

### Heatmap Generation
Components with high render counts get `data-ng-profiler` attributes that trigger CSS outlines:
- Low: Green outline
- Medium: Yellow outline  
- High: Red outline with pulsing animation

## 📊 Performance Impact

The profiler is designed to have minimal performance impact:
- Measurements are batched and averaged
- Heatmap updates are throttled
- All profiling is disabled in production by default
- Memory usage is limited with configurable history size

## 🛠️ Development

### Building the Library

```bash
ng build ng-profiler
```

### Running Tests

```bash
ng test ng-profiler
```

### Publishing

```bash
npm publish --access public
```

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
