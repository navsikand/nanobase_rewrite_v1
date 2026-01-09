/**
 * Phase 3.1: Frontend Performance Monitoring
 * Collects and reports performance metrics for analysis
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();

  /**
   * Mark a point in time for later measurement
   */
  static mark(name: string) {
    if (typeof performance !== "undefined") {
      performance.mark(name);
    }
  }

  /**
   * Measure time between two marks
   */
  static measure(name: string, startMark: string, endMark?: string) {
    if (typeof performance !== "undefined") {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        if (measure) {
          this.addMetric(name, measure.duration);
          return measure.duration;
        }
      } catch (e) {
        console.error("Performance measurement failed:", e);
      }
    }
    return 0;
  }

  /**
   * Add a metric value
   */
  static addMetric(key: string, value: number) {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    const arr = this.metrics.get(key)!;
    arr.push(value);

    // Keep last 50 measurements
    if (arr.length > 50) {
      arr.shift();
    }
  }

  /**
   * Get all collected metrics with statistics
   */
  static getMetrics() {
    const report: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    this.metrics.forEach((arr, key) => {
      if (arr.length === 0) return;
      report[key] = {
        avg: arr.reduce((a, b) => a + b, 0) / arr.length,
        min: Math.min(...arr),
        max: Math.max(...arr),
        count: arr.length,
      };
    });
    return report;
  }

  /**
   * Log metrics to console
   */
  static logReport() {
    console.table(this.getMetrics());
  }

  /**
   * Clear all metrics
   */
  static clear() {
    this.metrics.clear();
  }
}

export default PerformanceMonitor;
