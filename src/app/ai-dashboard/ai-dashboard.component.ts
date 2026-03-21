import { Component, OnInit, OnDestroy } from '@angular/core';
import { AiInsightsService, AiDashboardData, AiSummary } from '../services/ai-insights.service';
import { RiskScore, Anomaly, LifecycleRecommendation, BudgetForecast } from '../services/ai-engine.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ai-dashboard',
  templateUrl: './ai-dashboard.component.html',
  styleUrls: ['./ai-dashboard.component.scss'],
  standalone: false
})
export class AiDashboardComponent implements OnInit, OnDestroy {
  Math = Math;
  isLoading = true;
  activeTab: 'overview' | 'risks' | 'anomalies' | 'lifecycle' | 'budget' = 'overview';

  dashboardData: AiDashboardData | null = null;
  summary: AiSummary | null = null;
  riskScores: RiskScore[] = [];
  anomalies: Anomaly[] = [];
  lifecycleRecs: LifecycleRecommendation[] = [];
  budgetForecasts: BudgetForecast[] = [];

  // Filtered views
  riskFilter: 'all' | 'Critical' | 'High' | 'Medium' | 'Low' = 'all';
  anomalyFilter: 'all' | 'critical' | 'high' | 'medium' | 'low' = 'all';
  lifecycleFilter: 'all' | 'replace' | 'monitor' | 'keep' = 'all';

  // Pagination
  riskPage = 1;
  riskPageSize = 10;
  lifecyclePage = 1;
  lifecyclePageSize = 10;

  private subscription: Subscription | null = null;

  constructor(private aiService: AiInsightsService) {}

  ngOnInit(): void {
    this.loadAiAnalysis();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  loadAiAnalysis(): void {
    this.isLoading = true;
    this.subscription = this.aiService.getFullAiAnalysis().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.summary = data.summary;
        this.riskScores = data.riskScores;
        this.anomalies = data.anomalies;
        this.lifecycleRecs = data.lifecycleRecommendations;
        this.budgetForecasts = data.budgetForecasts;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('AI Dashboard error:', err);
        this.isLoading = false;
      }
    });
  }

  setTab(tab: typeof this.activeTab): void {
    this.activeTab = tab;
  }

  // Risk filtering
  get filteredRisks(): RiskScore[] {
    const filtered = this.riskFilter === 'all'
      ? this.riskScores
      : this.riskScores.filter(r => r.riskLevel === this.riskFilter);
    const start = (this.riskPage - 1) * this.riskPageSize;
    return filtered.slice(start, start + this.riskPageSize);
  }

  get totalFilteredRisks(): number {
    return this.riskFilter === 'all'
      ? this.riskScores.length
      : this.riskScores.filter(r => r.riskLevel === this.riskFilter).length;
  }

  // Anomaly filtering
  get filteredAnomalies(): Anomaly[] {
    return this.anomalyFilter === 'all'
      ? this.anomalies
      : this.anomalies.filter(a => a.severity === this.anomalyFilter);
  }

  // Lifecycle filtering
  get filteredLifecycle(): LifecycleRecommendation[] {
    const filtered = this.lifecycleFilter === 'all'
      ? this.lifecycleRecs
      : this.lifecycleRecs.filter(l => l.recommendation === this.lifecycleFilter);
    const start = (this.lifecyclePage - 1) * this.lifecyclePageSize;
    return filtered.slice(start, start + this.lifecyclePageSize);
  }

  get totalFilteredLifecycle(): number {
    return this.lifecycleFilter === 'all'
      ? this.lifecycleRecs.length
      : this.lifecycleRecs.filter(l => l.recommendation === this.lifecycleFilter).length;
  }

  // Budget helpers
  get totalForecastedSpend(): number {
    return this.budgetForecasts.reduce((sum, f) => sum + f.predictedSpend, 0);
  }

  get maxMonthlySpend(): number {
    return Math.max(...this.budgetForecasts.map(f => f.predictedSpend), 1);
  }

  // Health score color
  getHealthColor(score: number): string {
    if (score >= 75) return '#28a745';
    if (score >= 50) return '#ffc107';
    if (score >= 25) return '#fd7e14';
    return '#dc3545';
  }

  getRiskColor(level: string): string {
    switch (level) {
      case 'Critical': return '#dc3545';
      case 'High': return '#fd7e14';
      case 'Medium': return '#ffc107';
      default: return '#28a745';
    }
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      default: return '#17a2b8';
    }
  }

  getRecommendationColor(rec: string): string {
    switch (rec) {
      case 'replace': return '#dc3545';
      case 'monitor': return '#ffc107';
      default: return '#28a745';
    }
  }

  getBarWidth(value: number, max: number): string {
    return `${Math.min(100, (value / max) * 100)}%`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  }

  mathCeil(value: number): number {
    return Math.ceil(value);
  }
}
