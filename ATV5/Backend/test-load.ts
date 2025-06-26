#!/usr/bin/env tsx

import { CONFIG } from "./test-api";
import { HttpClient } from "./test-api";

// test-load.ts - Load Testing Script for Hotel Management API

interface LoadTestConfig {
  baseUrl: string;
  concurrentUsers: number;
  testDuration: number; // in seconds
  rampUpTime: number; // in seconds
}

interface LoadTestResults {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
}

class LoadTester {
  private config: LoadTestConfig;
  private results: LoadTestResults;
  private requestTimes: number[] = [];
  private isRunning = false;

  constructor(config: LoadTestConfig) {
    this.config = config;
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      requestsPerSecond: 0,
      errorRate: 0
    };
  }

  private async makeRequest(endpoint: string): Promise<{ success: boolean; responseTime: number }> {
    const startTime = Date.now();
    
    try {
      const response = await HttpClient.get(`${this.config.baseUrl}${endpoint}`);
      const responseTime = Date.now() - startTime;
      
      return {
        success: response.statusCode >= 200 && response.statusCode < 300,
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        success: false,
        responseTime
      };
    }
  }

  private async simulateUser(userId: number): Promise<void> {
    const endpoints = [
      '/api/health',
      '/api/v1/guests',
      '/api/v1/rooms',
      '/api/v1/bookings',
      '/api/v1/rooms/active',
      '/api/v1/guests/primary'
    ];

    while (this.isRunning) {
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const result = await this.makeRequest(endpoint);
      
      this.results.totalRequests++;
      this.requestTimes.push(result.responseTime);
      
      if (result.success) {
        this.results.successfulRequests++;
      } else {
        this.results.failedRequests++;
      }

      // Update min/max response times
      this.results.minResponseTime = Math.min(this.results.minResponseTime, result.responseTime);
      this.results.maxResponseTime = Math.max(this.results.maxResponseTime, result.responseTime);

      // Wait between requests (simulate real user behavior)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    }
  }

  private calculateResults(testDuration: number): void {
    this.results.averageResponseTime = this.requestTimes.length > 0 
      ? this.requestTimes.reduce((a, b) => a + b, 0) / this.requestTimes.length 
      : 0;
    
    this.results.requestsPerSecond = this.results.totalRequests / testDuration;
    this.results.errorRate = this.results.totalRequests > 0 
      ? (this.results.failedRequests / this.results.totalRequests) * 100 
      : 0;

    if (this.results.minResponseTime === Infinity) {
      this.results.minResponseTime = 0;
    }
  }

  async runLoadTest(): Promise<LoadTestResults> {
    console.log('\n🔥 Starting Load Test...');
    console.log(`Concurrent Users: ${this.config.concurrentUsers}`);
    console.log(`Test Duration: ${this.config.testDuration}s`);
    console.log(`Ramp-up Time: ${this.config.rampUpTime}s`);
    console.log(`Target: ${this.config.baseUrl}\n`);

    this.isRunning = true;
    const startTime = Date.now();

    // Start users with ramp-up
    const userPromises: Promise<void>[] = [];
    const rampUpDelay = (this.config.rampUpTime * 1000) / this.config.concurrentUsers;

    for (let i = 0; i < this.config.concurrentUsers; i++) {
      setTimeout(() => {
        if (this.isRunning) {
          userPromises.push(this.simulateUser(i + 1));
        }
      }, i * rampUpDelay);
    }

    // Run for specified duration
    setTimeout(() => {
      this.isRunning = false;
    }, this.config.testDuration * 1000);

    // Wait for all users to finish
    await Promise.all(userPromises);

    const actualDuration = (Date.now() - startTime) / 1000;
    this.calculateResults(actualDuration);

    return this.results;
  }
}

class LoadTestReporter {
  static printResults(results: LoadTestResults): void {
    console.log('\n📊 Load Test Results');
    console.log('===================');
    console.log(`Total Requests: ${results.totalRequests}`);
    console.log(`Successful Requests: ${results.successfulRequests}`);
    console.log(`Failed Requests: ${results.failedRequests}`);
    console.log(`Error Rate: ${results.errorRate.toFixed(2)}%`);
    console.log(`Requests/Second: ${results.requestsPerSecond.toFixed(2)}`);
    console.log('\n⏱️  Response Times');
    console.log('==================');
    console.log(`Average: ${results.averageResponseTime.toFixed(2)}ms`);
    console.log(`Minimum: ${results.minResponseTime}ms`);
    console.log(`Maximum: ${results.maxResponseTime}ms`);

    // Performance rating
    console.log('\n📈 Performance Rating');
    console.log('=====================');
    
    if (results.errorRate === 0 && results.averageResponseTime < 200) {
      console.log('🟢 Excellent - API is performing very well');
    } else if (results.errorRate < 1 && results.averageResponseTime < 500) {
      console.log('🟡 Good - API performance is acceptable');
    } else if (results.errorRate < 5 && results.averageResponseTime < 1000) {
      console.log('🟠 Fair - API performance needs attention');
    } else {
      console.log('🔴 Poor - API performance is problematic');
    }

    // Recommendations
    console.log('\n💡 Recommendations');
    console.log('==================');
    
    if (results.errorRate > 0) {
      console.log(`- Investigate ${results.failedRequests} failed requests`);
    }
    
    if (results.averageResponseTime > 500) {
      console.log('- Consider optimizing database queries');
      console.log('- Review API endpoint performance');
    }
    
    if (results.requestsPerSecond < 10) {
      console.log('- Consider implementing caching');
      console.log('- Review server resource allocation');
    }
  }

  static generateReport(results: LoadTestResults): string {
    const timestamp = new Date().toISOString();
    
    return `
# Load Test Report
Generated: ${timestamp}

## Summary
- Total Requests: ${results.totalRequests}
- Successful: ${results.successfulRequests}
- Failed: ${results.failedRequests}
- Error Rate: ${results.errorRate.toFixed(2)}%
- Requests/Second: ${results.requestsPerSecond.toFixed(2)}

## Response Times
- Average: ${results.averageResponseTime.toFixed(2)}ms
- Minimum: ${results.minResponseTime}ms
- Maximum: ${results.maxResponseTime}ms

## Status
${results.errorRate === 0 && results.averageResponseTime < 200 ? '✅ PASS' : '❌ NEEDS ATTENTION'}
`;
  }
}

// Spike testing
class SpikeTest {
  static async runSpikeTest(baseUrl: string): Promise<void> {
    console.log('\n⚡ Running Spike Test...');
    
    const endpoints = ['/api/health', '/api/v1/guests', '/api/v1/rooms'];
    const spikeDuration = 5000; // 5 seconds
    const requestsPerSecond = 50;
    const interval = 1000 / requestsPerSecond;

    let successCount = 0;
    let errorCount = 0;
    const responseTimes: number[] = [];

    const startTime = Date.now();
    const endTime = startTime + spikeDuration;

    while (Date.now() < endTime) {
      const requestPromises = endpoints.map(async (endpoint) => {
        const requestStart = Date.now();
        try {
          const response = await HttpClient.get(`${baseUrl}${endpoint}`);
          const responseTime = Date.now() - requestStart;
          responseTimes.push(responseTime);
          
          if (response.statusCode >= 200 && response.statusCode < 300) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      });

      await Promise.all(requestPromises);
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const totalRequests = successCount + errorCount;
    const errorRate = (errorCount / totalRequests) * 100;

    console.log('\n⚡ Spike Test Results');
    console.log('====================');
    console.log(`Total Requests: ${totalRequests}`);
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Error Rate: ${errorRate.toFixed(2)}%`);
    console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    
    if (errorRate < 5 && avgResponseTime < 1000) {
      console.log('✅ Spike test passed - API handles traffic spikes well');
    } else {
      console.log('❌ Spike test failed - API struggles with traffic spikes');
    }
  }
}

// Stress testing
class StressTest {
  static async runStressTest(baseUrl: string): Promise<void> {
    console.log('\n💪 Running Stress Test...');
    
    const maxUsers = 100;
    const stepSize = 10;
    const stepDuration = 30; // seconds
    
    for (let users = stepSize; users <= maxUsers; users += stepSize) {
      console.log(`\nTesting with ${users} concurrent users...`);
      
      const loadTester = new LoadTester({
        baseUrl,
        concurrentUsers: users,
        testDuration: stepDuration,
        rampUpTime: 5
      });
      
      const results = await loadTester.runLoadTest();
      
      console.log(`Users: ${users}, RPS: ${results.requestsPerSecond.toFixed(2)}, Avg RT: ${results.averageResponseTime.toFixed(2)}ms, Errors: ${results.errorRate.toFixed(2)}%`);
      
      // Stop if error rate exceeds threshold
      if (results.errorRate > 10) {
        console.log(`\n🛑 Stopping stress test - Error rate too high at ${users} users`);
        console.log(`Maximum sustainable load: ~${users - stepSize} concurrent users`);
        break;
      }
      
      // Cool down between steps
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const testType = args[0] || 'load';
  const baseUrl = args[1] || CONFIG.baseUrl;

  console.log('🏨 Hotel Management API Load Testing Suite');
  console.log(`Target: ${baseUrl}`);

  // Check if server is available
  try {
    await HttpClient.get(`${baseUrl}/api/health`);
    console.log('✅ Server is available\n');
  } catch (error) {
    console.log('❌ Server is not available');
    console.log('Make sure the API server is running');
    process.exit(1);
  }

  switch (testType) {
    case 'load':
      const loadTester = new LoadTester({
        baseUrl,
        concurrentUsers: 20,
        testDuration: 60,
        rampUpTime: 10
      });
      
      const results = await loadTester.runLoadTest();
      LoadTestReporter.printResults(results);
      
      // Save report
      const report = LoadTestReporter.generateReport(results);
      console.log('\n📄 Report saved to load-test-report.md');
      require('fs').writeFileSync('load-test-report.md', report);
      break;

    case 'spike':
      await SpikeTest.runSpikeTest(baseUrl);
      break;

    case 'stress':
      await StressTest.runStressTest(baseUrl);
      break;

    default:
      console.log('Unknown test type. Use: load, spike, or stress');
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Error running load tests:', error);
    process.exit(1);
  });
}