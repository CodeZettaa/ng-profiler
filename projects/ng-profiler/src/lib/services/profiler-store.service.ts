import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  ProfilerStats,
  ComponentRenderStats,
  FrameMeasurement,
  PerformanceRecommendation,
} from '../models/ng-profiler-config';
import { RecommendationService } from './recommendation.service';

@Injectable({
  providedIn: 'root',
})
export class ProfilerStore {
  private renderCounts = new Map<string, number>();
  private elementMap = new Map<string, HTMLElement>();
  private frameMeasurements: FrameMeasurement[] = [];
  private maxFrameHistory = 100;
  private isPaused = false;

  constructor(private recommendationService: RecommendationService) {}

  private statsSubject = new BehaviorSubject<ProfilerStats>({
    lastFrameDuration: 0,
    averageFrameDuration: 0,
    frameCount: 0,
    topComponents: [],
    lastMeasurement: Date.now(),
  });

  public stats$: Observable<ProfilerStats> = this.statsSubject.asObservable();

  /**
   * Increment render count for a component
   */
  incrementRenderCount(name: string, element?: HTMLElement): void {
    if (this.isPaused) {
      return; // Don't count renders when paused
    }

    const currentCount = this.renderCounts.get(name) || 0;
    const newCount = currentCount + 1;
    this.renderCounts.set(name, newCount);

    if (element) {
      this.elementMap.set(name, element);
    }

    this.updateStats();
  }

  /**
   * Add frame measurement
   */
  addFrameMeasurement(duration: number): void {
    if (this.isPaused) {
      return; // Don't add frame measurements when paused
    }

    const measurement: FrameMeasurement = {
      duration,
      timestamp: Date.now(),
    };

    this.frameMeasurements.push(measurement);

    // Keep only the last N measurements
    if (this.frameMeasurements.length > this.maxFrameHistory) {
      this.frameMeasurements.shift();
    }

    this.updateStats();
  }

  /**
   * Get severity level based on render count
   */
  private getSeverity(renderCount: number): 'low' | 'medium' | 'high' {
    if (renderCount <= 5) return 'low';
    if (renderCount <= 20) return 'medium';
    return 'high';
  }

  /**
   * Update statistics
   */
  private updateStats(): void {
    const currentStats = this.statsSubject.value;

    // Calculate frame statistics
    const lastFrame = this.frameMeasurements[this.frameMeasurements.length - 1];
    const lastFrameDuration = lastFrame ? lastFrame.duration : 0;

    const averageFrameDuration =
      this.frameMeasurements.length > 0
        ? this.frameMeasurements.reduce((sum, m) => sum + m.duration, 0) /
          this.frameMeasurements.length
        : 0;

    // Get top components by render count
    const topComponents: ComponentRenderStats[] = Array.from(this.renderCounts.entries())
      .map(([name, count]) => ({
        name,
        renderCount: count,
        severity: this.getSeverity(count),
        element: this.elementMap.get(name),
      }))
      .sort((a, b) => b.renderCount - a.renderCount)
      .slice(0, 10);

    const newStats: ProfilerStats = {
      lastFrameDuration,
      averageFrameDuration,
      frameCount: this.frameMeasurements.length,
      topComponents,
      lastMeasurement: Date.now(),
    };

    // Add recommendations after creating the stats object
    newStats.recommendations = this.recommendationService.analyzePerformance(newStats);

    this.statsSubject.next(newStats);
  }

  /**
   * Reset all statistics
   */
  reset(): void {
    this.renderCounts.clear();
    this.elementMap.clear();
    this.frameMeasurements = [];
    this.updateStats();
  }

  /**
   * Export current statistics as JSON
   */
  exportStats(): string {
    const stats = this.statsSubject.value;

    // Create a clean version of topComponents without circular references
    const cleanTopComponents = stats.topComponents.map((component) => ({
      name: component.name,
      renderCount: component.renderCount,
      severity: component.severity,
      // Remove the element property to avoid circular references
    }));

    // Get performance summary and analysis
    const performanceSummary = this.recommendationService.getPerformanceSummary(stats);
    const criticalRecommendations = this.recommendationService.getCriticalRecommendations(stats);
    const recommendationsByCategory = {
      performance: this.recommendationService.getRecommendationsByCategory('performance', stats),
      rendering: this.recommendationService.getRecommendationsByCategory('rendering', stats),
      memory: this.recommendationService.getRecommendationsByCategory('memory', stats),
      'best-practice': this.recommendationService.getRecommendationsByCategory('best-practice', stats)
    };

    const exportData = {
      // Basic stats
      lastFrameDuration: stats.lastFrameDuration,
      averageFrameDuration: stats.averageFrameDuration,
      frameCount: stats.frameCount,
      topComponents: cleanTopComponents,
      lastMeasurement: stats.lastMeasurement,
      renderCounts: Object.fromEntries(this.renderCounts),
      frameMeasurements: this.frameMeasurements,
      
      // Enhanced performance analysis
      performanceSummary: {
        score: performanceSummary.score,
        health: performanceSummary.health,
        acceptable: performanceSummary.acceptable,
        criticalIssues: performanceSummary.criticalIssues,
        warnings: performanceSummary.warnings,
        isPerformanceAcceptable: this.recommendationService.isPerformanceAcceptable(stats)
      },
      
      // Comprehensive recommendations
      recommendations: stats.recommendations,
      criticalRecommendations: criticalRecommendations,
      recommendationsByCategory: recommendationsByCategory,
      
      // Performance thresholds and standards
      performanceThresholds: {
        targetFrameTime: 16.67, // 60fps
        acceptableFrameTime: 33.33, // 30fps
        criticalFrameTime: 50,
        excellentScore: 90,
        goodScore: 75,
        fairScore: 60,
        poorScore: 40
      },
      
      // Export metadata
      exportTimestamp: new Date().toISOString(),
      profilerVersion: '1.0.0',
      exportFormat: 'enhanced-json'
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Get current render count for a component
   */
  getRenderCount(name: string): number {
    return this.renderCounts.get(name) || 0;
  }

  /**
   * Get all render counts
   */
  getAllRenderCounts(): Map<string, number> {
    return new Map(this.renderCounts);
  }

  /**
   * Pause render counting
   */
  pauseRenderCounting(): void {
    this.isPaused = true;
  }

  /**
   * Resume render counting
   */
  resumeRenderCounting(): void {
    this.isPaused = false;
  }
}
