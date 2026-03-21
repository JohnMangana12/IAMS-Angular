import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { AiInsightsService } from '../services/ai-insights.service';
import { RiskScore } from '../services/ai-engine.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ai-risk-score',
  template: `
    <div class="risk-widget" *ngIf="topRisks.length > 0">
      <h5><i class="bi bi-shield-exclamation"></i> Top Risk Assets</h5>
      <div *ngFor="let risk of topRisks" class="risk-item">
        <span class="asset-tag">{{ risk.assetTag }}</span>
        <span class="risk-level" [style.color]="getRiskColor(risk.riskLevel)">
          {{ risk.riskLevel }} ({{ risk.overallRisk }}%)
        </span>
      </div>
    </div>
  `,
  styles: [`
    .risk-widget { padding: 12px; }
    .risk-item { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; }
    .asset-tag { font-weight: 600; color: #6f42c1; }
    .risk-level { font-weight: 600; font-size: 13px; }
    h5 { margin-bottom: 12px; color: #495057; }
    h5 i { margin-right: 6px; }
  `],
  standalone: false
})
export class AiRiskScoreComponent implements OnInit, OnDestroy {
  private aiService = inject(AiInsightsService);
  topRisks: RiskScore[] = [];
  private subscription: Subscription | null = null;

  ngOnInit(): void {
    this.subscription = this.aiService.getFullAiAnalysis().subscribe({
      next: (data) => {
        this.topRisks = data.riskScores
          .sort((a, b) => b.overallRisk - a.overallRisk)
          .slice(0, 5);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  getRiskColor(level: string): string {
    switch (level) {
      case 'Critical': return '#dc3545';
      case 'High': return '#fd7e14';
      case 'Medium': return '#ffc107';
      default: return '#28a745';
    }
  }
}
