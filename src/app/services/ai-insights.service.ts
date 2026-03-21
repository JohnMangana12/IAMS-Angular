import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AssetService } from './asset.service';
import {
  AiEngineService,
  RiskScore,
  Anomaly,
  LifecycleRecommendation,
  BudgetForecast,
  NLPQueryResult
} from './ai-engine.service';

export interface AiSummary {
  healthScore: number;
  totalAssets: number;
  avgRiskScore: number;
  warrantyExpiringCount: number;
  totalProjectedSpend: number;
  criticalRiskCount: number;
  highRiskCount: number;
  anomalyCount: number;
  replaceNowCount: number;
}

export interface AiDashboardData {
  summary: AiSummary;
  riskScores: RiskScore[];
  anomalies: Anomaly[];
  lifecycleRecommendations: LifecycleRecommendation[];
  budgetForecasts: BudgetForecast[];
}

@Injectable({
  providedIn: 'root'
})
export class AiInsightsService {

  constructor(
    private assetService: AssetService,
    private aiEngine: AiEngineService
  ) {}

  getFullAiAnalysis(): Observable<AiDashboardData> {
    return this.assetService.getAssetList().pipe(
      map(assets => {
        const riskScores = this.aiEngine.computeRiskScores(assets);
        const anomalies = this.aiEngine.detectAnomalies(assets);
        const lifecycleRecommendations = this.aiEngine.computeLifecycleRecommendations(assets);
        const budgetForecasts = this.aiEngine.computeBudgetForecasts(assets);

        // Compute summary
        const now = new Date();
        const threeMonthsOut = new Date();
        threeMonthsOut.setMonth(threeMonthsOut.getMonth() + 3);

        const warrantyExpiringCount = assets.filter(a => {
          if (!a.Warranty) return false;
          const exp = new Date(a.Warranty);
          return exp > now && exp <= threeMonthsOut;
        }).length;

        const avgRiskScore = riskScores.length > 0
          ? Math.round(riskScores.reduce((s, r) => s + r.overallRisk, 0) / riskScores.length)
          : 0;

        const criticalRiskCount = riskScores.filter(r => r.riskLevel === 'Critical').length;
        const highRiskCount = riskScores.filter(r => r.riskLevel === 'High').length;
        const replaceNowCount = lifecycleRecommendations.filter(l => l.recommendation === 'replace').length;
        const totalProjectedSpend = budgetForecasts.reduce((s, f) => s + f.predictedSpend, 0);

        const healthScore = Math.max(0, Math.min(100, Math.round(
          100 - (criticalRiskCount * 5) - (highRiskCount * 2) - (anomalies.length * 3) - (avgRiskScore * 0.3)
        )));

        const summary: AiSummary = {
          healthScore,
          totalAssets: assets.length,
          avgRiskScore,
          warrantyExpiringCount,
          totalProjectedSpend,
          criticalRiskCount,
          highRiskCount,
          anomalyCount: anomalies.length,
          replaceNowCount
        };

        return { summary, riskScores, anomalies, lifecycleRecommendations, budgetForecasts };
      })
    );
  }

  queryAssets(query: string): Observable<NLPQueryResult> {
    return this.assetService.getAssetList().pipe(
      map(assets => this.aiEngine.processNaturalLanguageQuery(query, assets))
    );
  }
}
