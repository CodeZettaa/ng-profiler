# @codezetta/ng-profiler - Usage Examples

This document provides comprehensive examples for using the ng-profiler library with both NgModule and standalone component approaches.

## 🏗️ NgModule Approach (Traditional)

### Basic Setup

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgProfilerModule } from '@codezetta/ng-profiler';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NgProfilerModule.forRoot({
      enableInProduction: false,
      position: 'top-right',
      enableHeatmap: true
    })
  ],
  bootstrap: [AppComponent]
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
    <div class="app-container">
      <h1>My Angular App</h1>
      
      <!-- Track this component -->
      <div codezettaNgProfiler="app-container">
        <p>This component will be tracked for renders</p>
      </div>
      
      <!-- Profiler overlay -->
      <codezetta-ng-profiler-overlay></codezetta-ng-profiler-overlay>
    </div>
  `
})
export class AppComponent implements OnInit {
  constructor(private profilerService: NgProfilerService) {}

  ngOnInit() {
    this.profilerService.initialize();
  }
}
```

### Feature Module Example

```typescript
// feature.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgProfilerDirective } from '@codezetta/ng-profiler';
import { FeatureComponent } from './feature.component';

@NgModule({
  declarations: [FeatureComponent],
  imports: [
    CommonModule,
    NgProfilerDirective // Import the directive
  ]
})
export class FeatureModule { }
```

```typescript
// feature.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-feature',
  template: `
    <div codezettaNgProfiler="feature-component">
      <h2>Feature Component</h2>
      <p>This component is being profiled</p>
    </div>
  `
})
export class FeatureComponent {}
```

## 🚀 Standalone Components Approach (Modern)

### Basic Setup

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideNgProfiler } from '@codezetta/ng-profiler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    ...provideNgProfiler({
      enableInProduction: false,
      position: 'top-right',
      enableHeatmap: true,
      enableMeasurement: true
    })
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
    <div class="app-container">
      <h1>My Angular App</h1>
      
      <!-- Track this component -->
      <div codezettaNgProfiler="app-container">
        <p>This component will be tracked for renders</p>
      </div>
      
      <!-- Profiler overlay -->
      <codezetta-ng-profiler-overlay></codezetta-ng-profiler-overlay>
    </div>
  `
})
export class AppComponent implements OnInit {
  constructor(private profilerService: NgProfilerService) {}

  ngOnInit() {
    this.profilerService.initialize();
  }
}
```

### Standalone Feature Component

```typescript
// feature.component.ts
import { Component } from '@angular/core';
import { NgProfilerDirective } from '@codezetta/ng-profiler';

@Component({
  selector: 'app-feature',
  standalone: true,
  imports: [NgProfilerDirective],
  template: `
    <div codezettaNgProfiler="feature-component">
      <h2>Feature Component</h2>
      <p>This component is being profiled</p>
    </div>
  `
})
export class FeatureComponent {}
```

### Lazy Loaded Standalone Component

```typescript
// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'feature',
    loadComponent: () => import('./feature.component').then(m => m.FeatureComponent)
  }
];
```

## 🔧 Advanced Configuration Examples

### Custom Configuration

```typescript
// NgModule approach
NgProfilerModule.forRoot({
  enableInProduction: true, // Enable in production
  hotkey: 'Ctrl+Alt+P', // Custom hotkey
  position: 'bottom-left', // Different position
  renderCountThreshold: 5, // Lower threshold
  frameDurationThreshold: 20, // Higher frame threshold
  enableHeatmap: true,
  enableMeasurement: true
})

// Standalone approach
provideNgProfiler({
  enableInProduction: true,
  hotkey: 'Ctrl+Alt+P',
  position: 'bottom-left',
  renderCountThreshold: 5,
  frameDurationThreshold: 20,
  enableHeatmap: true,
  enableMeasurement: true
})
```

### Environment-Specific Configuration

```typescript
// profiler.config.ts
import { NgProfilerConfig } from '@codezetta/ng-profiler';

export function getProfilerConfig(): NgProfilerConfig {
  const isProduction = environment.production;
  
  return {
    enableInProduction: false, // Always false for safety
    position: 'top-right',
    enableHeatmap: !isProduction,
    enableMeasurement: !isProduction,
    renderCountThreshold: isProduction ? 20 : 10,
    frameDurationThreshold: isProduction ? 33.33 : 16.67
  };
}

// app.config.ts
import { getProfilerConfig } from './profiler.config';

export const appConfig: ApplicationConfig = {
  providers: [
    ...provideNgProfiler(getProfilerConfig())
  ]
};
```

## 📊 Performance Monitoring Examples

### Custom Component Tracking

```typescript
// expensive.component.ts
import { Component, OnInit } from '@angular/core';
import { ProfilerStore } from '@codezetta/ng-profiler';

@Component({
  selector: 'app-expensive',
  template: `<div>Expensive Component</div>`
})
export class ExpensiveComponent implements OnInit {
  constructor(private profilerStore: ProfilerStore) {}

  ngOnInit() {
    // Track expensive initialization
    this.profilerStore.incrementRenderCount('expensive-init');
  }

  performExpensiveOperation() {
    // Track expensive operations
    this.profilerStore.incrementRenderCount('expensive-operation');
    
    // Your expensive operation here
    this.heavyCalculation();
  }

  private heavyCalculation() {
    // Simulate expensive work
    for (let i = 0; i < 1000000; i++) {
      Math.random();
    }
  }
}
```

### Export Statistics Programmatically

```typescript
// analytics.component.ts
import { Component } from '@angular/core';
import { ProfilerStore } from '@codezetta/ng-profiler';

@Component({
  selector: 'app-analytics',
  template: `
    <button (click)="exportStats()">Export Performance Data</button>
    <button (click)="resetStats()">Reset Statistics</button>
  `
})
export class AnalyticsComponent {
  constructor(private profilerStore: ProfilerStore) {}

  exportStats() {
    const stats = this.profilerStore.exportStats();
    
    // Send to analytics service
    this.analyticsService.trackPerformance(stats);
    
    // Or download as file
    this.downloadStats(stats);
  }

  resetStats() {
    this.profilerStore.reset();
  }

  private downloadStats(stats: string) {
    const blob = new Blob([stats], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-stats-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
```

## 🎯 Real-World Usage Patterns

### E-commerce Application

```typescript
// product-list.component.ts
import { Component } from '@angular/core';
import { NgProfilerDirective } from '@codezetta/ng-profiler';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [NgProfilerDirective],
  template: `
    <div codezettaNgProfiler="product-list">
      <div 
        *ngFor="let product of products; trackBy: trackByProduct"
        codezettaNgProfiler="product-item"
        class="product-item"
      >
        <h3>{{ product.name }}</h3>
        <p>{{ product.price | currency }}</p>
      </div>
    </div>
  `
})
export class ProductListComponent {
  products = [/* product data */];
  
  trackByProduct(index: number, product: any) {
    return product.id;
  }
}
```

### Dashboard Application

```typescript
// dashboard.component.ts
import { Component } from '@angular/core';
import { NgProfilerDirective } from '@codezetta/ng-profiler';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgProfilerDirective],
  template: `
    <div class="dashboard">
      <div codezettaNgProfiler="dashboard-container">
        <div codezettaNgProfiler="chart-widget" class="widget">
          <app-chart [data]="chartData"></app-chart>
        </div>
        
        <div codezettaNgProfiler="table-widget" class="widget">
          <app-data-table [data]="tableData"></app-data-table>
        </div>
        
        <div codezettaNgProfiler="metrics-widget" class="widget">
          <app-metrics [metrics]="metrics"></app-metrics>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  chartData = [/* chart data */];
  tableData = [/* table data */];
  metrics = [/* metrics data */];
}
```

## 🔍 Troubleshooting Examples

### Profiler Not Initializing

```typescript
// app.component.ts
import { Component, OnInit } from '@angular/core';
import { NgProfilerService } from '@codezetta/ng-profiler';

@Component({
  selector: 'app-root',
  template: `<div>App Content</div>`
})
export class AppComponent implements OnInit {
  constructor(private profilerService: NgProfilerService) {}

  ngOnInit() {
    // Check if profiler is enabled
    console.log('Profiler enabled:', this.profilerService.isProfilerEnabled());
    
    // Initialize profiler
    this.profilerService.initialize();
    
    // Check again after initialization
    console.log('Profiler enabled after init:', this.profilerService.isProfilerEnabled());
  }
}
```

### Custom Heatmap Styling

```css
/* custom-profiler.css */
[data-ng-profiler="high"] {
  outline: 3px solid #ff0000 !important;
  outline-offset: 3px !important;
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.5) !important;
}

[data-ng-profiler="medium"] {
  outline: 2px solid #ffa500 !important;
  outline-offset: 2px !important;
}

[data-ng-profiler="low"] {
  outline: 1px solid #00ff00 !important;
  outline-offset: 1px !important;
}
```

## 🚀 Migration Examples

### From NgModule to Standalone

**Before (NgModule):**
```typescript
// app.module.ts
@NgModule({
  imports: [NgProfilerModule.forRoot()]
})
export class AppModule {}

// app.component.ts
@Component({
  template: `<codezetta-ng-profiler-overlay></codezetta-ng-profiler-overlay>`
})
export class AppComponent {}
```

**After (Standalone):**
```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [...provideNgProfiler()]
};

// app.component.ts
@Component({
  standalone: true,
  imports: [NgProfilerOverlayComponent],
  template: `<codezetta-ng-profiler-overlay></codezetta-ng-profiler-overlay>`
})
export class AppComponent {}
```

These examples demonstrate the flexibility and power of the ng-profiler library in both traditional and modern Angular applications!
