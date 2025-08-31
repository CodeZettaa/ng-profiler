import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgProfilerOverlayComponent,
  NgProfilerDirective,
} from '../../../ng-profiler/src/lib/ng-profiler';
import { NgProfilerService } from '../../../ng-profiler/src/lib/services/ng-profiler.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NgProfilerOverlayComponent, NgProfilerDirective],
  template: `
    <div class="demo-container">
      <h1>NgProfiler Demo</h1>

      <div class="demo-section">
        <h2>Performance Test Components</h2>

        <div class="test-components">
          <!-- Component with high render count -->
          <div
            codezettaNgProfiler="high-render-component"
            class="test-component high-render"
            (click)="triggerHighRender()"
          >
            <h3>High Render Component</h3>
            <p>Click to trigger many renders</p>
            <p>Render count: {{ highRenderCount() }}</p>
          </div>

          <!-- Component with medium render count -->
          <div
            codezettaNgProfiler="medium-render-component"
            class="test-component medium-render"
            (click)="triggerMediumRender()"
          >
            <h3>Medium Render Component</h3>
            <p>Click to trigger some renders</p>
            <p>Render count: {{ mediumRenderCount() }}</p>
          </div>

          <!-- Component with low render count -->
          <div
            codezettaNgProfiler="low-render-component"
            class="test-component low-render"
            (click)="triggerLowRender()"
          >
            <h3>Low Render Component</h3>
            <p>Click to trigger few renders</p>
            <p>Render count: {{ lowRenderCount() }}</p>
          </div>
        </div>

        <div class="instructions">
          <h3>Instructions:</h3>
          <ul>
            <li>Press <kbd>Ctrl+Shift+P</kbd> to toggle the profiler overlay</li>
            <li>Click on components to trigger renders and see the heatmap</li>
            <li>Watch the frame timing and render counts in the overlay</li>
            <li>Use the export button to download statistics</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Profiler Overlay -->
    <codezetta-ng-profiler-overlay></codezetta-ng-profiler-overlay>
  `,
  styles: [
    `
      .demo-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      h1 {
        text-align: center;
        color: #333;
        margin-bottom: 40px;
      }

      .demo-section {
        background: #f5f5f5;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
      }

      h2 {
        color: #555;
        margin-bottom: 20px;
      }

      .test-components {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }

      .test-component {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: all 0.2s ease;
        border: 2px solid transparent;
      }

      .test-component:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .test-component h3 {
        margin: 0 0 10px 0;
        color: #333;
      }

      .test-component p {
        margin: 5px 0;
        color: #666;
      }

      .high-render {
        border-color: #f44336;
      }

      .medium-render {
        border-color: #ff9800;
      }

      .low-render {
        border-color: #4caf50;
      }

      .instructions {
        background: white;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #2196f3;
      }

      .instructions h3 {
        margin: 0 0 15px 0;
        color: #333;
      }

      .instructions ul {
        margin: 0;
        padding-left: 20px;
      }

      .instructions li {
        margin: 8px 0;
        color: #555;
      }

      kbd {
        background: #f1f1f1;
        border: 1px solid #ccc;
        border-radius: 3px;
        padding: 2px 6px;
        font-family: monospace;
        font-size: 12px;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  highRenderCount = signal(0);
  mediumRenderCount = signal(0);
  lowRenderCount = signal(0);

  constructor(private profilerService: NgProfilerService) {}

  ngOnInit() {
    this.profilerService.initialize();
  }

  triggerHighRender() {
    // Trigger many renders
    for (let i = 0; i < 100; i++) {
      setTimeout(() => {
        this.highRenderCount.update((count) => count + 1);
      }, i * 10);
    }
  }

  triggerMediumRender() {
    // Trigger some renders
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        this.mediumRenderCount.update((count) => count + 1);
      }, i * 20);
    }
  }

  triggerLowRender() {
    // Trigger few renders
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.lowRenderCount.update((count) => count + 1);
      }, i * 50);
    }
  }
}
