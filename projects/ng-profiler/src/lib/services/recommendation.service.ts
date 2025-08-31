import { Injectable } from '@angular/core';
import {
  ProfilerStats,
  ComponentRenderStats,
  PerformanceRecommendation,
} from '../models/ng-profiler-config';

@Injectable({
  providedIn: 'root',
})
export class RecommendationService {
  /**
   * Analyze performance data and generate recommendations
   */
  analyzePerformance(stats: ProfilerStats): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = [];

    // Frame performance analysis
    this.analyzeFramePerformance(stats, recommendations);

    // Component render analysis
    this.analyzeComponentRenders(stats, recommendations);

    // Memory analysis (if available)
    this.analyzeMemoryUsage(stats, recommendations);

    // Best practices analysis
    this.analyzeBestPractices(stats, recommendations);

    // Sort by priority (highest first)
    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Analyze frame performance issues
   */
  private analyzeFramePerformance(
    stats: ProfilerStats,
    recommendations: PerformanceRecommendation[]
  ): void {
    // Critical frame time issues
    if (stats.lastFrameDuration > 50) {
      recommendations.push({
        id: 'critical-frame-time',
        type: 'error',
        title: 'Critical Frame Time Detected',
        description: `Last frame took ${stats.lastFrameDuration.toFixed(
          2
        )}ms, which is significantly above the 16.67ms target for 60fps.`,
        severity: 'critical',
        category: 'performance',
        suggestions: [
          'Optimize heavy computations in your components',
          'Use OnPush change detection strategy',
          'Implement virtual scrolling for large lists',
          'Consider using Web Workers for heavy calculations',
          'Profile with Chrome DevTools to identify bottlenecks',
        ],
        impact: 'Severe impact on user experience and perceived performance',
        priority: 100,
      });
    }

    // High average frame time
    if (stats.averageFrameDuration > 20) {
      recommendations.push({
        id: 'high-average-frame-time',
        type: 'warning',
        title: 'High Average Frame Time',
        description: `Average frame time is ${stats.averageFrameDuration.toFixed(
          2
        )}ms, above the recommended 16.67ms.`,
        severity: 'high',
        category: 'performance',
        suggestions: [
          'Review components with frequent updates',
          'Implement debouncing for rapid state changes',
          'Use trackBy functions in ngFor loops',
          'Consider lazy loading for heavy components',
          'Optimize template expressions and bindings',
        ],
        impact: 'May cause noticeable lag and poor user experience',
        priority: 80,
      });
    }

    // Low frame count warning
    if (stats.frameCount < 10) {
      recommendations.push({
        id: 'low-frame-count',
        type: 'info',
        title: 'Limited Performance Data',
        description:
          'Only a few frames have been measured. Consider interacting with the application to gather more data.',
        severity: 'low',
        category: 'performance',
        suggestions: [
          'Interact with various components in your application',
          'Trigger different user actions to gather more data',
          'Wait for more performance data to be collected',
        ],
        impact: 'Limited data may not reflect real-world performance',
        priority: 20,
      });
    }
  }

  /**
   * Analyze component render issues
   */
  private analyzeComponentRenders(
    stats: ProfilerStats,
    recommendations: PerformanceRecommendation[]
  ): void {
    const highRenderComponents = stats.topComponents.filter((comp) => comp.severity === 'high');
    const mediumRenderComponents = stats.topComponents.filter((comp) => comp.severity === 'medium');

    // Critical render issues
    if (highRenderComponents.length > 0) {
      const worstComponent = highRenderComponents[0];
      recommendations.push({
        id: 'critical-render-count',
        type: 'error',
        title: 'Excessive Component Renders',
        description: `Component "${worstComponent.name}" has rendered ${worstComponent.renderCount} times, indicating potential performance issues.`,
        severity: 'critical',
        category: 'rendering',
        suggestions: [
          'Review change detection strategy for this component',
          'Check for unnecessary template bindings',
          'Implement OnPush change detection',
          'Use pure pipes instead of methods in templates',
          'Consider memoization for expensive calculations',
          'Review parent component for unnecessary re-renders',
        ],
        impact: 'Excessive renders can cause significant performance degradation',
        priority: 95,
      });
    }

    // Multiple high-render components
    if (highRenderComponents.length > 2) {
      recommendations.push({
        id: 'multiple-high-render-components',
        type: 'warning',
        title: 'Multiple Components with High Render Counts',
        description: `${highRenderComponents.length} components are rendering excessively, indicating systemic performance issues.`,
        severity: 'high',
        category: 'rendering',
        suggestions: [
          'Review global state management patterns',
          'Check for circular dependencies between components',
          'Implement proper component architecture',
          'Consider using a state management library (NgRx, Akita)',
          'Review service injection patterns',
        ],
        impact: 'Systemic rendering issues affect overall application performance',
        priority: 85,
      });
    }

    // Medium render issues
    if (mediumRenderComponents.length > 3) {
      recommendations.push({
        id: 'multiple-medium-render-components',
        type: 'warning',
        title: 'Several Components with Moderate Render Counts',
        description: `${mediumRenderComponents.length} components have moderate render counts that could be optimized.`,
        severity: 'medium',
        category: 'rendering',
        suggestions: [
          'Review change detection triggers',
          'Optimize template expressions',
          'Use trackBy functions in loops',
          'Consider component composition patterns',
          'Review input/output binding patterns',
        ],
        impact: 'Moderate performance impact that can accumulate',
        priority: 60,
      });
    }

    // Advanced component analysis
    this.analyzeComponentPatterns(stats, recommendations);
    this.analyzeTemplateOptimization(stats, recommendations);
  }

  /**
   * Analyze component patterns and architecture
   */
  private analyzeComponentPatterns(
    stats: ProfilerStats,
    recommendations: PerformanceRecommendation[]
  ): void {
    const allComponents = stats.topComponents;

    // Check for potential component composition issues
    if (allComponents.length > 5) {
      recommendations.push({
        id: 'component-composition',
        type: 'optimization',
        title: 'Component Composition Optimization',
        description:
          'Many components are being tracked, suggesting potential composition improvements.',
        severity: 'low',
        category: 'rendering',
        suggestions: [
          'Consider using smart/dumb component pattern',
          'Implement proper component hierarchy',
          'Review component responsibilities',
          'Consider using content projection',
          'Implement proper component interfaces',
        ],
        impact: 'Improves component maintainability and performance',
        priority: 35,
      });
    }

    // Check for potential over-engineering
    if (allComponents.length > 10) {
      recommendations.push({
        id: 'component-over-engineering',
        type: 'warning',
        title: 'Potential Component Over-Engineering',
        description:
          'Many small components detected. Consider if this level of granularity is necessary.',
        severity: 'medium',
        category: 'rendering',
        suggestions: [
          'Review component granularity',
          'Consider combining related components',
          'Implement proper component boundaries',
          'Review component communication patterns',
          'Consider using feature modules',
        ],
        impact: 'Reduces complexity and improves maintainability',
        priority: 45,
      });
    }
  }

  /**
   * Analyze template optimization opportunities
   */
  private analyzeTemplateOptimization(
    stats: ProfilerStats,
    recommendations: PerformanceRecommendation[]
  ): void {
    // High render counts often indicate template optimization opportunities
    const highRenderComponents = stats.topComponents.filter((comp) => comp.severity === 'high');

    if (highRenderComponents.length > 0) {
      recommendations.push({
        id: 'template-optimization',
        type: 'optimization',
        title: 'Template Optimization Opportunities',
        description: 'High render counts suggest template optimization opportunities.',
        severity: 'medium',
        category: 'rendering',
        suggestions: [
          'Use OnPush change detection strategy',
          'Implement pure pipes for expensive calculations',
          'Use trackBy functions in ngFor loops',
          'Avoid function calls in templates',
          'Use async pipe for observables',
          'Consider using signals for reactive templates',
        ],
        impact: 'Reduces template evaluation overhead and improves performance',
        priority: 70,
      });
    }
  }

  /**
   * Analyze memory usage patterns
   */
  private analyzeMemoryUsage(
    stats: ProfilerStats,
    recommendations: PerformanceRecommendation[]
  ): void {
    // Enhanced memory analysis with more specific recommendations

    // High frame count indicates potential memory pressure
    if (stats.frameCount > 100) {
      recommendations.push({
        id: 'memory-best-practices',
        type: 'optimization',
        title: 'Memory Optimization Opportunities',
        description: 'With significant application usage, consider memory optimization strategies.',
        severity: 'medium',
        category: 'memory',
        suggestions: [
          'Implement proper component destruction',
          'Unsubscribe from observables in ngOnDestroy',
          'Use weak references where appropriate',
          'Consider using OnPush change detection',
          'Implement proper cleanup for timers and intervals',
          'Review for memory leaks in event listeners',
        ],
        impact: 'Prevents memory leaks and improves long-term performance',
        priority: 50,
      });
    }

    // Very high frame count suggests potential memory issues
    if (stats.frameCount > 500) {
      recommendations.push({
        id: 'memory-pressure-detected',
        type: 'warning',
        title: 'Potential Memory Pressure Detected',
        description:
          'High frame count suggests potential memory pressure or performance degradation over time.',
        severity: 'high',
        category: 'memory',
        suggestions: [
          'Monitor memory usage with Chrome DevTools',
          'Check for memory leaks in long-running operations',
          'Implement memory profiling in development',
          'Consider implementing memory monitoring',
          'Review component lifecycle management',
          'Use Angular DevTools for memory analysis',
        ],
        impact: 'Memory pressure can cause application crashes and poor performance',
        priority: 75,
      });
    }

    // Analyze component render patterns for memory implications
    const highRenderComponents = stats.topComponents.filter((comp) => comp.severity === 'high');
    if (highRenderComponents.length > 0) {
      recommendations.push({
        id: 'memory-render-correlation',
        type: 'info',
        title: 'Memory-Render Correlation',
        description:
          'High render counts may indicate memory allocation patterns that could be optimized.',
        severity: 'medium',
        category: 'memory',
        suggestions: [
          'Review object creation in frequently rendered components',
          'Consider object pooling for frequently created objects',
          'Implement memoization for expensive calculations',
          'Use immutable data structures where possible',
          'Review for unnecessary object allocations in templates',
        ],
        impact: 'Reduces garbage collection pressure and improves performance',
        priority: 45,
      });
    }
  }

  /**
   * Analyze best practices and advanced optimizations
   */
  private analyzeBestPractices(
    stats: ProfilerStats,
    recommendations: PerformanceRecommendation[]
  ): void {
    // General best practices based on data patterns
    if (stats.frameCount > 50 && stats.averageFrameDuration > 10) {
      recommendations.push({
        id: 'performance-optimization',
        type: 'optimization',
        title: 'Performance Optimization Opportunities',
        description: 'Application shows opportunities for performance improvements.',
        severity: 'medium',
        category: 'best-practice',
        suggestions: [
          'Use Angular DevTools for detailed analysis',
          'Implement code splitting and lazy loading',
          'Optimize bundle size with tree shaking',
          'Use Angular Universal for SSR if applicable',
          'Consider using Angular PWA features',
          'Implement proper caching strategies',
        ],
        impact: 'Improves overall application performance and user experience',
        priority: 70,
      });
    }

    // Zone.js specific recommendations
    if (stats.frameCount > 20) {
      recommendations.push({
        id: 'zone-optimization',
        type: 'optimization',
        title: 'Zone.js Optimization',
        description: 'Consider optimizing Zone.js usage for better performance.',
        severity: 'low',
        category: 'best-practice',
        suggestions: [
          'Use NgZone.runOutsideAngular for heavy computations',
          'Consider zoneless change detection for specific components',
          'Optimize async operations to minimize change detection',
          'Use trackBy functions in ngFor loops',
          'Implement proper error boundaries',
        ],
        impact: 'Reduces unnecessary change detection cycles',
        priority: 40,
      });
    }

    // Network performance recommendations
    this.analyzeNetworkPerformance(stats, recommendations);

    // Bundle optimization recommendations
    this.analyzeBundleOptimization(stats, recommendations);

    // State management recommendations
    this.analyzeStateManagement(stats, recommendations);
  }

  /**
   * Analyze network performance patterns
   */
  private analyzeNetworkPerformance(
    stats: ProfilerStats,
    recommendations: PerformanceRecommendation[]
  ): void {
    // High frame times might indicate network-related issues
    if (stats.averageFrameDuration > 25) {
      recommendations.push({
        id: 'network-performance',
        type: 'warning',
        title: 'Potential Network Performance Issues',
        description: 'High frame times may indicate network-related performance bottlenecks.',
        severity: 'medium',
        category: 'best-practice',
        suggestions: [
          'Implement request caching strategies',
          'Use HTTP interceptors for request optimization',
          'Consider implementing request deduplication',
          'Optimize API response payloads',
          'Implement progressive loading for large datasets',
          'Use service workers for offline capabilities',
        ],
        impact: 'Improves data loading performance and user experience',
        priority: 65,
      });
    }
  }

  /**
   * Analyze bundle optimization opportunities
   */
  private analyzeBundleOptimization(
    stats: ProfilerStats,
    recommendations: PerformanceRecommendation[]
  ): void {
    if (stats.frameCount > 30) {
      recommendations.push({
        id: 'bundle-optimization',
        type: 'optimization',
        title: 'Bundle Optimization Opportunities',
        description: 'Consider optimizing your application bundle for better performance.',
        severity: 'medium',
        category: 'best-practice',
        suggestions: [
          'Implement dynamic imports for code splitting',
          'Use Angular CLI build optimization flags',
          'Analyze bundle with webpack-bundle-analyzer',
          'Remove unused dependencies',
          'Optimize third-party library imports',
          'Consider using standalone components for better tree-shaking',
        ],
        impact: 'Reduces initial load time and improves perceived performance',
        priority: 55,
      });
    }
  }

  /**
   * Analyze state management patterns
   */
  private analyzeStateManagement(
    stats: ProfilerStats,
    recommendations: PerformanceRecommendation[]
  ): void {
    const highRenderComponents = stats.topComponents.filter((comp) => comp.severity === 'high');

    if (highRenderComponents.length > 1) {
      recommendations.push({
        id: 'state-management',
        type: 'optimization',
        title: 'State Management Optimization',
        description:
          'Multiple components with high render counts suggest state management improvements.',
        severity: 'medium',
        category: 'best-practice',
        suggestions: [
          'Consider implementing NgRx or similar state management',
          'Review service injection patterns',
          'Implement proper state isolation',
          'Use BehaviorSubject for reactive state',
          'Consider using signals for fine-grained reactivity',
          'Review component communication patterns',
        ],
        impact: 'Improves state predictability and reduces unnecessary renders',
        priority: 60,
      });
    }
  }

  /**
   * Get recommendation by ID
   */
  getRecommendationById(id: string, stats: ProfilerStats): PerformanceRecommendation | null {
    const recommendations = this.analyzePerformance(stats);
    return recommendations.find((rec) => rec.id === id) || null;
  }

  /**
   * Get recommendations by category
   */
  getRecommendationsByCategory(
    category: string,
    stats: ProfilerStats
  ): PerformanceRecommendation[] {
    const recommendations = this.analyzePerformance(stats);
    return recommendations.filter((rec) => rec.category === category);
  }

  /**
   * Get critical recommendations only
   */
  getCriticalRecommendations(stats: ProfilerStats): PerformanceRecommendation[] {
    const recommendations = this.analyzePerformance(stats);
    return recommendations.filter((rec) => rec.severity === 'critical' || rec.severity === 'high');
  }

  /**
   * Check if performance is within acceptable thresholds
   */
  isPerformanceAcceptable(stats: ProfilerStats): boolean {
    return (
      stats.lastFrameDuration <= 16.67 &&
      stats.averageFrameDuration <= 16.67 &&
      stats.topComponents.filter((comp) => comp.severity === 'high').length === 0
    );
  }

  /**
   * Get performance score (0-100)
   */
  getPerformanceScore(stats: ProfilerStats): number {
    let score = 100;

    // Deduct points for frame time issues
    if (stats.lastFrameDuration > 50) score -= 30;
    else if (stats.lastFrameDuration > 33) score -= 20;
    else if (stats.lastFrameDuration > 16.67) score -= 10;

    if (stats.averageFrameDuration > 33) score -= 25;
    else if (stats.averageFrameDuration > 16.67) score -= 15;

    // Deduct points for render issues
    const highRenderComponents = stats.topComponents.filter((comp) => comp.severity === 'high');
    score -= highRenderComponents.length * 10;

    const mediumRenderComponents = stats.topComponents.filter((comp) => comp.severity === 'medium');
    score -= mediumRenderComponents.length * 5;

    // Ensure score doesn't go below 0
    return Math.max(0, score);
  }

  /**
   * Get performance health status
   */
  getPerformanceHealth(stats: ProfilerStats): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    const score = this.getPerformanceScore(stats);

    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 40) return 'poor';
    return 'critical';
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(stats: ProfilerStats): {
    score: number;
    health: string;
    acceptable: boolean;
    criticalIssues: number;
    warnings: number;
  } {
    const score = this.getPerformanceScore(stats);
    const health = this.getPerformanceHealth(stats);
    const acceptable = this.isPerformanceAcceptable(stats);
    const recommendations = this.analyzePerformance(stats);

    const criticalIssues = recommendations.filter((rec) => rec.severity === 'critical').length;
    const warnings = recommendations.filter(
      (rec) => rec.severity === 'high' || rec.severity === 'medium'
    ).length;

    return {
      score,
      health,
      acceptable,
      criticalIssues,
      warnings,
    };
  }
}
