import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ProfilerStore } from '../services/profiler-store.service';
import { NgProfilerService } from '../services/ng-profiler.service';
import {
  ProfilerStats,
  ComponentRenderStats,
  PerformanceRecommendation,
} from '../models/ng-profiler-config';

@Component({
  selector: 'codezetta-ng-profiler-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="ng-profiler-overlay"
      [class.visible]="isVisible"
      [class.top-left]="position === 'top-left'"
      [class.top-right]="position === 'top-right'"
      [class.bottom-left]="position === 'bottom-left'"
      [class.bottom-right]="position === 'bottom-right'"
      (click)="$event.stopPropagation()"
    >
      <div class="ng-profiler-header">
        <h3>Angular Profiler</h3>
        <div class="ng-profiler-controls">
          <button
            class="ng-profiler-btn ng-profiler-btn-small"
            (click)="resetStats()"
            title="Reset Statistics"
          >
            🔄
          </button>
          <button
            class="ng-profiler-btn ng-profiler-btn-small"
            (click)="exportStats()"
            title="Export JSON Statistics"
          >
            📊
          </button>
          <button
            class="ng-profiler-btn ng-profiler-btn-small"
            (click)="exportPDF()"
            title="Export PDF Report"
          >
            📄
          </button>
          <button
            class="ng-profiler-btn ng-profiler-btn-small"
            (click)="toggleVisibility()"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      <div class="ng-profiler-content">
        <!-- Frame Statistics -->
        <div class="ng-profiler-section">
          <h4>Frame Performance</h4>
          <div class="ng-profiler-stats">
            <div class="ng-profiler-stat">
              <span class="ng-profiler-label">Last Frame:</span>
              <span
                class="ng-profiler-value"
                [class.warning]="stats.lastFrameDuration > 16.67"
                [class.error]="stats.lastFrameDuration > 33.33"
              >
                {{ stats.lastFrameDuration.toFixed(2) }}ms
              </span>
            </div>
            <div class="ng-profiler-stat">
              <span class="ng-profiler-label">Average:</span>
              <span
                class="ng-profiler-value"
                [class.warning]="stats.averageFrameDuration > 16.67"
                [class.error]="stats.averageFrameDuration > 33.33"
              >
                {{ stats.averageFrameDuration.toFixed(2) }}ms
              </span>
            </div>
            <div class="ng-profiler-stat">
              <span class="ng-profiler-label">Frames:</span>
              <span class="ng-profiler-value">{{ stats.frameCount }}</span>
            </div>
          </div>
        </div>

        <!-- Top Components -->
        <div class="ng-profiler-section">
          <h4>Top Components by Render Count</h4>
          <div class="ng-profiler-components">
            <div
              *ngFor="let component of stats.topComponents; trackBy: trackByComponent"
              class="ng-profiler-component"
              [class.severity-low]="component.severity === 'low'"
              [class.severity-medium]="component.severity === 'medium'"
              [class.severity-high]="component.severity === 'high'"
            >
              <span class="ng-profiler-component-name">{{ component.name }}</span>
              <span class="ng-profiler-component-count">{{ component.renderCount }}</span>
            </div>
            <div *ngIf="stats.topComponents.length === 0" class="ng-profiler-empty">
              No components tracked yet
            </div>
          </div>
        </div>

        <!-- Mode Indicator -->
        <div class="ng-profiler-section">
          <div class="ng-profiler-mode">
            <span class="ng-profiler-label">Mode:</span>
            <span class="ng-profiler-value">
              {{ profilerService.isZonedMode() ? 'Zoned' : 'Zoneless' }}
            </span>
          </div>
        </div>

        <!-- Performance Recommendations -->
        <div
          class="ng-profiler-section"
          *ngIf="stats.recommendations && stats.recommendations.length > 0"
        >
          <h4>Performance Recommendations</h4>
          <div class="ng-profiler-recommendations">
            <div
              *ngFor="let rec of stats.recommendations.slice(0, 3); trackBy: trackByRecommendation"
              class="ng-profiler-recommendation"
              [class.severity-critical]="rec.severity === 'critical'"
              [class.severity-high]="rec.severity === 'high'"
              [class.severity-medium]="rec.severity === 'medium'"
              [class.severity-low]="rec.severity === 'low'"
            >
              <div class="ng-profiler-recommendation-header">
                <span class="ng-profiler-recommendation-title">{{ rec.title }}</span>
                <span class="ng-profiler-recommendation-severity">{{
                  rec.severity.toUpperCase()
                }}</span>
              </div>
              <div class="ng-profiler-recommendation-description">{{ rec.description }}</div>
              <div class="ng-profiler-recommendation-impact">
                <strong>Impact:</strong> {{ rec.impact }}
              </div>
            </div>
            <div
              *ngIf="stats.recommendations && stats.recommendations.length > 3"
              class="ng-profiler-more-recommendations"
            >
              <button
                class="ng-profiler-btn ng-profiler-btn-small"
                (click)="showAllRecommendations()"
              >
                Show All ({{ stats.recommendations.length }})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .ng-profiler-overlay {
        position: fixed;
        z-index: 9999;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        border-radius: 8px;
        padding: 16px;
        min-width: 300px;
        max-width: 400px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.4;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transform: translateY(-100%);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        pointer-events: none;
      }

      .ng-profiler-overlay.visible {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
        pointer-events: all;
      }

      .ng-profiler-overlay.top-right {
        top: 20px;
        right: 20px;
      }

      .ng-profiler-overlay.top-left {
        top: 20px;
        left: 20px;
      }

      .ng-profiler-overlay.bottom-right {
        bottom: 20px;
        right: 20px;
      }

      .ng-profiler-overlay.bottom-left {
        bottom: 20px;
        left: 20px;
      }

      .ng-profiler-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      }

      .ng-profiler-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #fff;
      }

      .ng-profiler-controls {
        display: flex;
        gap: 4px;
      }

      .ng-profiler-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 12px;
        padding: 4px 8px;
      }

      .ng-profiler-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .ng-profiler-btn-small {
        padding: 2px 6px;
        font-size: 10px;
      }

      .ng-profiler-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .ng-profiler-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .ng-profiler-section h4 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: #fff;
      }

      .ng-profiler-stats {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .ng-profiler-stat {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .ng-profiler-label {
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
      }

      .ng-profiler-value {
        font-weight: 600;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 12px;
      }

      .ng-profiler-value.warning {
        color: #ffd700;
      }

      .ng-profiler-value.error {
        color: #ff6b6b;
      }

      .ng-profiler-components {
        display: flex;
        flex-direction: column;
        gap: 4px;
        max-height: 200px;
        overflow-y: auto;
      }

      .ng-profiler-component {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 8px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.05);
        border-left: 3px solid transparent;
      }

      .ng-profiler-component.severity-low {
        border-left-color: #4caf50;
      }

      .ng-profiler-component.severity-medium {
        border-left-color: #ff9800;
      }

      .ng-profiler-component.severity-high {
        border-left-color: #f44336;
      }

      .ng-profiler-component-name {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.9);
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .ng-profiler-component-count {
        font-weight: 600;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 12px;
        color: #fff;
        margin-left: 8px;
      }

      .ng-profiler-empty {
        color: rgba(255, 255, 255, 0.5);
        font-style: italic;
        text-align: center;
        padding: 8px;
      }

      .ng-profiler-mode {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
      }

      /* Scrollbar styling */
      .ng-profiler-components::-webkit-scrollbar {
        width: 4px;
      }

      .ng-profiler-components::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
      }

      .ng-profiler-components::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 2px;
      }

      .ng-profiler-components::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.5);
      }

      /* Recommendations Styles */
      .ng-profiler-recommendations {
        max-height: 200px;
        overflow-y: auto;
      }

      .ng-profiler-recommendation {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 8px;
        border-left: 4px solid rgba(255, 255, 255, 0.3);
      }

      .ng-profiler-recommendation.severity-critical {
        border-left-color: #dc3545;
        background: rgba(220, 53, 69, 0.1);
      }

      .ng-profiler-recommendation.severity-high {
        border-left-color: #fd7e14;
        background: rgba(253, 126, 20, 0.1);
      }

      .ng-profiler-recommendation.severity-medium {
        border-left-color: #ffc107;
        background: rgba(255, 193, 7, 0.1);
      }

      .ng-profiler-recommendation.severity-low {
        border-left-color: #28a745;
        background: rgba(40, 167, 69, 0.1);
      }

      .ng-profiler-recommendation-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .ng-profiler-recommendation-title {
        font-weight: 600;
        font-size: 13px;
        color: #fff;
      }

      .ng-profiler-recommendation-severity {
        font-size: 10px;
        font-weight: bold;
        padding: 2px 6px;
        border-radius: 3px;
        text-transform: uppercase;
      }

      .ng-profiler-recommendation.severity-critical .ng-profiler-recommendation-severity {
        background: #dc3545;
        color: white;
      }

      .ng-profiler-recommendation.severity-high .ng-profiler-recommendation-severity {
        background: #fd7e14;
        color: white;
      }

      .ng-profiler-recommendation.severity-medium .ng-profiler-recommendation-severity {
        background: #ffc107;
        color: black;
      }

      .ng-profiler-recommendation.severity-low .ng-profiler-recommendation-severity {
        background: #28a745;
        color: white;
      }

      .ng-profiler-recommendation-description {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 8px;
        line-height: 1.4;
      }

      .ng-profiler-recommendation-impact {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.7);
        font-style: italic;
      }

      .ng-profiler-more-recommendations {
        text-align: center;
        margin-top: 8px;
      }
    `,
  ],
})
export class NgProfilerOverlayComponent implements OnInit, OnDestroy {
  isVisible = true; // Show by default in development
  stats: ProfilerStats = {
    lastFrameDuration: 0,
    averageFrameDuration: 0,
    frameCount: 0,
    topComponents: [],
    lastMeasurement: Date.now(),
  };

  private subscription: Subscription | null = null;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'top-right';

  constructor(private profilerStore: ProfilerStore, public profilerService: NgProfilerService) {
    this.position = this.profilerService.getConfig().position || 'top-right';
  }

  ngOnInit(): void {
    console.log('NgProfiler: Overlay component initialized, isVisible:', this.isVisible);

    this.subscription = this.profilerStore.stats$.subscribe((stats) => {
      this.stats = stats;
    });

    // Listen for toggle events
    document.addEventListener('ng-profiler-toggle', () => {
      console.log('NgProfiler: Toggle event received, toggling visibility');
      this.toggleVisibility();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isVisible) {
      this.isVisible = false;
    }
  }

  toggleVisibility(): void {
    this.isVisible = !this.isVisible;
    console.log('NgProfiler: Overlay visibility toggled to:', this.isVisible);

    // Force change detection and DOM update
    setTimeout(() => {
      const overlay = document.querySelector('.ng-profiler-overlay');
      if (overlay) {
        // Manually update classes to ensure they're correct
        if (this.isVisible) {
          overlay.classList.add('visible');
        } else {
          overlay.classList.remove('visible');
        }

        console.log('NgProfiler: Overlay classes after manual update:', overlay.className);
        console.log(
          'NgProfiler: Overlay computed style visibility:',
          getComputedStyle(overlay).visibility
        );
        console.log(
          'NgProfiler: Overlay computed style opacity:',
          getComputedStyle(overlay).opacity
        );
        console.log(
          'NgProfiler: Overlay computed style transform:',
          getComputedStyle(overlay).transform
        );
      }
    }, 50);
  }

  resetStats(): void {
    this.profilerStore.reset();
  }

  exportStats(): void {
    console.log('NgProfiler: Export button clicked');

    try {
      // Take a snapshot of stats BEFORE starting the export process
      const statsSnapshot = this.profilerStore.exportStats();
      console.log('NgProfiler: Stats snapshot taken before JSON export');

      // Temporarily pause profiling to avoid counting export renders
      this.profilerService.pauseProfiling();
      this.profilerStore.pauseRenderCounting();
      console.log('NgProfiler: Profiling paused during JSON export');

      // Use the snapshot data instead of calling exportStats again
      const blob = new Blob([statsSnapshot], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `ng-profiler-stats-${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, '-')}.json`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('NgProfiler: Export completed successfully');
    } catch (error) {
      console.error('NgProfiler: Export failed:', error);
    } finally {
      // Always resume profiling, even if export failed
      this.profilerService.resumeProfiling();
      this.profilerStore.resumeRenderCounting();
      console.log('NgProfiler: Profiling resumed after JSON export');
    }
  }

  async exportPDF(): Promise<void> {
    try {
      // Take a snapshot of stats BEFORE starting ANY export process
      const statsSnapshot = this.profilerStore.exportStats();
      const statsData = JSON.parse(statsSnapshot);

      // Completely disable the profiler during export
      this.profilerService.pauseProfiling();
      this.profilerStore.pauseRenderCounting();

      // Wait for any pending operations to complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Force garbage collection if available
      if ((window as any).gc) {
        (window as any).gc();
      }

      // Dynamically import jsPDF only (no html2canvas to avoid DOM manipulation)
      let jsPDF: any;
      try {
        jsPDF = await import('jspdf').then((m) => m.default);
      } catch (importError) {
        console.error('NgProfiler: jspdf not available:', importError);
        alert('PDF export requires jspdf package. Please install it with: npm install jspdf');
        return;
      }

      // Create PDF directly from data (no DOM manipulation)
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Helper function to check if we need a new page
      const checkNewPage = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Helper function to add text with word wrapping
      const addWrappedText = (text: string, fontSize: number, y: number, isBold = false) => {
        pdf.setFontSize(fontSize);
        if (isBold) pdf.setFont('helvetica', 'bold');
        else pdf.setFont('helvetica', 'normal');

        const lines = pdf.splitTextToSize(text, contentWidth);

        // Check if we need a new page for this text
        const textHeight = lines.length * fontSize * 0.4;
        checkNewPage(textHeight);

        pdf.text(lines, margin, yPosition);
        yPosition += textHeight;
        return yPosition;
      };

      // Helper function to add a section
      const addSection = (title: string) => {
        checkNewPage(50); // Space for title + spacing
        yPosition = addWrappedText(title, 16, yPosition, true);
        yPosition += 20; // Increased spacing after section title
        return yPosition;
      };

      // Title
      yPosition = addWrappedText('Angular Profiler Report', 24, yPosition, true);
      yPosition = addWrappedText(`Generated on ${new Date().toLocaleString()}`, 12, yPosition);
      yPosition += 20;

      // Performance Score and Health
      if (statsData.performanceSummary) {
        yPosition = addSection('Performance Health Score');
        const score = statsData.performanceSummary.score;
        const health = statsData.performanceSummary.health;
        const healthColor =
          health === 'excellent'
            ? [40, 167, 69]
            : health === 'good'
            ? [0, 122, 204]
            : health === 'fair'
            ? [255, 193, 7]
            : health === 'poor'
            ? [255, 152, 0]
            : [220, 53, 69];

        // Score circle
        const centerX = pageWidth / 2;
        const centerY = yPosition + 20;
        const radius = 30;
        pdf.setFillColor(healthColor[0], healthColor[1], healthColor[2]);
        pdf.circle(centerX, centerY, radius, 'F');
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255, 255, 255);
        pdf.text(score.toString(), centerX - 10, centerY + 6);

        // Health label - Fixed positioning and visibility
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(healthColor[0], healthColor[1], healthColor[2]);
        pdf.text(health.toUpperCase(), centerX - 30, centerY + 40);

        // Status indicators - Fixed layout and values
        const statusY = yPosition + 70;
        const statusItems = [
          {
            label: 'Performance Acceptable',
            value: statsData.performanceSummary.acceptable ? 'YES' : 'NO',
            color: statsData.performanceSummary.acceptable ? [40, 167, 69] : [220, 53, 69],
          },
          {
            label: 'Critical Issues',
            value: statsData.performanceSummary.criticalIssues.toString(),
            color: [220, 53, 69],
          },
          {
            label: 'Warnings',
            value: statsData.performanceSummary.warnings.toString(),
            color: [255, 193, 7],
          },
        ];

        statusItems.forEach((item, index) => {
          const x = margin + index * (contentWidth / 3);

          // Draw background box for better visibility - Increased height for text
          pdf.setFillColor(248, 249, 250);
          pdf.rect(x - 5, statusY - 5, contentWidth / 3 - 10, 35, 'F');
          pdf.setDrawColor(221, 221, 221);
          pdf.rect(x - 5, statusY - 5, contentWidth / 3 - 10, 35);

          // Value (YES/NO or number) - Fixed positioning
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(item.color[0], item.color[1], item.color[2]);
          pdf.text(item.value, x + 8, statusY + 8);

          // Label - Fixed positioning and size - Moved down to fit in box
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(102, 102, 102);
          pdf.text(item.label, x + 8, statusY + 25);
        });
        yPosition += 90;
      }

      // Add more spacing between Performance Health Score and Performance Metrics to prevent overlap
      yPosition += 20;

      // Performance Metrics
      yPosition = addSection('Performance Metrics');

      // // Add minimal spacing after section title
      // yPosition += 5;

      const metrics = [
        { label: 'Last Frame', value: `${statsData.lastFrameDuration.toFixed(2)}ms` },
        { label: 'Average Frame', value: `${statsData.averageFrameDuration.toFixed(2)}ms` },
        { label: 'Total Frames', value: statsData.frameCount.toString() },
      ];

      // Check if we need a new page for metrics
      checkNewPage(50);

      metrics.forEach((metric, index) => {
        const x = margin + index * (contentWidth / 3);
        const boxY = yPosition;

        // Draw box with better styling
        pdf.setFillColor(248, 249, 250);
        pdf.rect(x, boxY, contentWidth / 3 - 5, 35, 'F');
        pdf.setDrawColor(0, 122, 204);
        pdf.setLineWidth(0.5);
        pdf.rect(x, boxY, contentWidth / 3 - 5, 35);

        // Add value text
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 122, 204);
        pdf.text(metric.value, x + 5, boxY + 15);

        // Add label text - Fixed size and positioning
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(102, 102, 102);
        pdf.text(metric.label, x + 5, boxY + 28);
      });

      yPosition += 45;

      // Top Components
      yPosition = addSection('Top Components by Render Count');

      if (statsData.topComponents.length > 0) {
        // Check space for table
        const tableHeight = 12 + statsData.topComponents.length * 12;
        checkNewPage(tableHeight);

        // Table header
        const colWidth = contentWidth / 3;
        const headerY = yPosition;

        pdf.setFillColor(0, 122, 204);
        pdf.rect(margin, headerY, colWidth, 12, 'F');
        pdf.rect(margin + colWidth, headerY, colWidth, 12, 'F');
        pdf.rect(margin + 2 * colWidth, headerY, colWidth, 12, 'F');

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255, 255, 255);
        pdf.text('Component', margin + 3, headerY + 8);
        pdf.text('Render Count', margin + colWidth + 3, headerY + 8);
        pdf.text('Severity', margin + 2 * colWidth + 3, headerY + 8);

        yPosition += 14;

        // Table rows
        statsData.topComponents.forEach((comp: any, index: number) => {
          const rowY = yPosition;
          const bgColor = index % 2 === 0 ? [248, 249, 250] : [255, 255, 255];

          pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
          pdf.rect(margin, rowY, colWidth, 12, 'F');
          pdf.rect(margin + colWidth, rowY, colWidth, 12, 'F');
          pdf.rect(margin + 2 * colWidth, rowY, colWidth, 12, 'F');

          pdf.setDrawColor(221, 221, 221);
          pdf.setLineWidth(0.3);
          pdf.rect(margin, rowY, colWidth, 12);
          pdf.rect(margin + colWidth, rowY, colWidth, 12);
          pdf.rect(margin + 2 * colWidth, rowY, colWidth, 12);

          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(0, 0, 0);

          // Truncate component name if too long
          const componentName =
            comp.name.length > 15 ? comp.name.substring(0, 12) + '...' : comp.name;
          pdf.text(componentName, margin + 3, rowY + 8);
          pdf.text(comp.renderCount.toString(), margin + colWidth + 3, rowY + 8);

          // Severity badge
          const severityColor =
            comp.severity === 'high'
              ? [220, 53, 69]
              : comp.severity === 'medium'
              ? [255, 193, 7]
              : [40, 167, 69];
          pdf.setFillColor(severityColor[0], severityColor[1], severityColor[2]);
          pdf.roundedRect(margin + 2 * colWidth + 3, rowY + 3, 25, 6, 2, 2, 'F');
          pdf.setTextColor(
            comp.severity === 'high' ? 255 : 0,
            comp.severity === 'high' ? 255 : 0,
            comp.severity === 'high' ? 255 : 0
          );
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.text(comp.severity.toUpperCase(), margin + 2 * colWidth + 5, rowY + 7);

          yPosition += 14;
        });
      } else {
        yPosition = addWrappedText('No components tracked yet', 12, yPosition);
      }

      yPosition += 15;

      // All Recommendations Summary - Always show this section
      yPosition = addSection('Performance Recommendations Summary');

      // Show total recommendations count
      const totalRecs = statsData.recommendations ? statsData.recommendations.length : 0;
      const criticalRecs = statsData.recommendations
        ? statsData.recommendations.filter((r: any) => r.severity === 'critical').length
        : 0;
      const highRecs = statsData.recommendations
        ? statsData.recommendations.filter((r: any) => r.severity === 'high').length
        : 0;
      const mediumRecs = statsData.recommendations
        ? statsData.recommendations.filter((r: any) => r.severity === 'medium').length
        : 0;

      yPosition = addWrappedText(`Total Recommendations: ${totalRecs}`, 12, yPosition);
      yPosition = addWrappedText(
        `Critical: ${criticalRecs} | High: ${highRecs} | Medium: ${mediumRecs}`,
        10,
        yPosition
      );

      // Add a note if no recommendations
      if (totalRecs === 0) {
        yPosition = addWrappedText(
          'No performance issues detected. Your application is performing well!',
          10,
          yPosition
        );
      }

      yPosition += 10;

      // Critical Recommendations - Always show this section
      yPosition = addSection('Critical Performance Issues');

      if (statsData.criticalRecommendations && statsData.criticalRecommendations.length > 0) {
        statsData.criticalRecommendations.forEach((rec: any, index: number) => {
          if (index < 5) {
            // Show top 5 critical issues
            // Check space for this recommendation
            checkNewPage(50);

            // Recommendation header with severity badge
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(220, 53, 69); // Red for critical

            // Draw severity badge
            const badgeX = margin;
            const badgeY = yPosition - 2;
            pdf.setFillColor(220, 53, 69);
            pdf.roundedRect(badgeX, badgeY, 25, 8, 2, 2, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.text('CRITICAL', badgeX + 2, badgeY + 5);

            // Title
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(220, 53, 69);
            yPosition = addWrappedText(`${rec.title}`, 12, yPosition);

            // Description
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(0, 0, 0);
            yPosition = addWrappedText(rec.description, 10, yPosition);

            // Impact
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'italic');
            pdf.setTextColor(102, 102, 102);
            yPosition = addWrappedText(`Impact: ${rec.impact}`, 9, yPosition);

            // Suggestions (show first 2)
            if (rec.suggestions && rec.suggestions.length > 0) {
              pdf.setFontSize(9);
              pdf.setFont('helvetica', 'normal');
              pdf.setTextColor(0, 0, 0);
              yPosition = addWrappedText('Suggestions:', 9, yPosition);

              rec.suggestions.slice(0, 2).forEach((suggestion: string) => {
                yPosition = addWrappedText(`• ${suggestion}`, 8, yPosition);
              });
            }

            yPosition += 8;
          }
        });
      } else {
        yPosition = addWrappedText('No critical performance issues detected.', 10, yPosition);
      }
      yPosition += 10;

      // Recommendations by Category - Always show this section
      yPosition = addSection('Detailed Recommendations by Category');

      if (statsData.recommendationsByCategory) {
        const categories = ['performance', 'rendering', 'memory', 'best-practice'];
        let hasAnyRecommendations = false;

        categories.forEach((category) => {
          const categoryRecs = statsData.recommendationsByCategory[category];
          if (categoryRecs && categoryRecs.length > 0) {
            hasAnyRecommendations = true;
            const categoryTitle =
              category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
            yPosition = addSection(`${categoryTitle} Recommendations`);

            categoryRecs.slice(0, 3).forEach((rec: any) => {
              // Show top 3 per category
              // Check space for this recommendation
              checkNewPage(40);

              // Recommendation title with severity color
              pdf.setFontSize(11);
              pdf.setFont('helvetica', 'bold');
              const severityColor =
                rec.severity === 'critical'
                  ? [220, 53, 69]
                  : rec.severity === 'high'
                  ? [255, 152, 0]
                  : rec.severity === 'medium'
                  ? [255, 193, 7]
                  : [40, 167, 69];
              pdf.setTextColor(severityColor[0], severityColor[1], severityColor[2]);
              yPosition = addWrappedText(`• ${rec.title}`, 11, yPosition);

              // Description
              pdf.setFontSize(9);
              pdf.setFont('helvetica', 'normal');
              pdf.setTextColor(0, 0, 0);
              yPosition = addWrappedText(rec.description, 9, yPosition);

              // Impact
              pdf.setFontSize(8);
              pdf.setFont('helvetica', 'italic');
              pdf.setTextColor(102, 102, 102);
              yPosition = addWrappedText(`Impact: ${rec.impact}`, 8, yPosition);

              yPosition += 5;
            });
            yPosition += 8;
          }
        });

        if (!hasAnyRecommendations) {
          yPosition = addWrappedText(
            'No specific recommendations in any category. Your application is performing well across all areas.',
            10,
            yPosition
          );
        }
      } else {
        yPosition = addWrappedText('No categorized recommendations available.', 10, yPosition);
      }

      // Application Mode
      yPosition = addSection('Application Mode');
      const modeText = this.profilerService.isZonedMode()
        ? 'Zoned (with Zone.js)'
        : 'Zoneless (without Zone.js)';
      yPosition = addWrappedText(`Mode: ${modeText}`, 12, yPosition);

      yPosition += 20;

      // Performance Thresholds
      if (statsData.performanceThresholds) {
        yPosition = addSection('Performance Standards');
        const thresholds = [
          {
            label: 'Target Frame Time (60fps)',
            value: `${statsData.performanceThresholds.targetFrameTime}ms`,
          },
          {
            label: 'Acceptable Frame Time (30fps)',
            value: `${statsData.performanceThresholds.acceptableFrameTime}ms`,
          },
          {
            label: 'Critical Frame Time',
            value: `${statsData.performanceThresholds.criticalFrameTime}ms`,
          },
        ];

        thresholds.forEach((threshold) => {
          yPosition = addWrappedText(`${threshold.label}: ${threshold.value}`, 10, yPosition);
        });
        yPosition += 10;
      }

      // Footer
      yPosition = addWrappedText('Generated by @codezetta/ng-profiler', 10, yPosition);
      yPosition = addWrappedText(
        'For more information, visit: https://github.com/codezetta/ng-profiler',
        10,
        yPosition
      );

      // Save PDF
      const filename = `ng-profiler-report-${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, '-')}.pdf`;

      pdf.save(filename);
    } catch (error) {
      console.error('NgProfiler: PDF export failed:', error);
      alert('PDF export failed. Please install jspdf and html2canvas packages in your project.');
    } finally {
      // Always resume profiling, even if export failed
      this.profilerService.resumeProfiling();
      this.profilerStore.resumeRenderCounting();
    }
  }

  trackByComponent(index: number, component: ComponentRenderStats): string {
    return component.name;
  }

  trackByRecommendation(index: number, recommendation: PerformanceRecommendation): string {
    return recommendation.id;
  }

  showAllRecommendations(): void {
    // This could open a modal or expand the recommendations section
    // For now, just a placeholder for future implementation
  }
}
