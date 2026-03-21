import { Injectable } from '@angular/core';
import { Asset } from '../models/asset.model';

// ── Exported Interfaces ──

export interface RiskFactor {
  name: string;
  score: number;
}

export interface RiskScore {
  assetTag: string;
  description: string;
  overallRisk: number;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  factors: RiskFactor[];
  predictedFailureDate: Date | null;
  confidenceScore: number;
  recommendedAction: string;
}

export interface Anomaly {
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  dimension: string;
  score: number;
  affectedAssets: Asset[];
  suggestedAction: string;
}

export interface LifecycleRecommendation {
  assetTag: string;
  description: string;
  currentAge: number;
  estimatedRemainingLife: number;
  monthlyDepreciation: number;
  warrantyGapCost: number;
  recommendation: 'replace' | 'monitor' | 'keep';
  justification: string;
  optimalReplacementDate: Date | null;
  savingsIfReplaced: number;
}

export interface BudgetForecast {
  month: string;
  predictedSpend: number;
  newAcquisitions: number;
  warrantyRenewals: number;
  replacementCosts: number;
  confidence: number;
}

export interface NLPQueryResult {
  interpretedIntent: string;
  filters: { [key: string]: any };
  matchedAssets: Asset[];
  suggestions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AiEngineService {

  // ── Risk Scoring ──

  computeRiskScores(assets: Asset[]): RiskScore[] {
    return assets.map(asset => this.scoreAsset(asset));
  }

  private scoreAsset(asset: Asset): RiskScore {
    const factors: RiskFactor[] = [];

    // Condition factor
    const conditionScore = this.conditionRiskScore(asset.AssetCondition);
    factors.push({ name: 'Condition', score: conditionScore });

    // Warranty factor
    const warrantyScore = this.warrantyRiskScore(asset.Warranty);
    factors.push({ name: 'Warranty', score: warrantyScore });

    // Age factor
    const ageScore = this.ageRiskScore(asset.DateAcquired);
    factors.push({ name: 'Age', score: ageScore });

    factors.sort((a, b) => b.score - a.score);

    const overallRisk = Math.round(
      factors.reduce((sum, f) => sum + f.score, 0) / factors.length
    );
    const riskLevel = this.riskLevelFromScore(overallRisk);
    const confidenceScore = Math.min(0.95, 0.6 + factors.length * 0.1);

    return {
      assetTag: asset.AssetTag,
      description: asset.Description,
      overallRisk,
      riskLevel,
      factors,
      predictedFailureDate: overallRisk >= 60 ? this.predictFailure(asset) : null,
      confidenceScore,
      recommendedAction: this.recommendAction(riskLevel, asset)
    };
  }

  private conditionRiskScore(condition: string): number {
    switch ((condition || '').toLowerCase()) {
      case 'defective': return 90;
      case 'for disposal': return 85;
      case 'fair': return 50;
      case 'good': return 10;
      default: return 40;
    }
  }

  private warrantyRiskScore(warranty: string | null): number {
    if (!warranty) return 70;
    const expiryDate = new Date(warranty);
    if (isNaN(expiryDate.getTime())) return 50;
    const now = new Date();
    const monthsLeft = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsLeft <= 0) return 80;
    if (monthsLeft <= 3) return 60;
    if (monthsLeft <= 6) return 40;
    return 10;
  }

  private ageRiskScore(dateAcquired: string | null): number {
    if (!dateAcquired) return 50;
    const acquired = new Date(dateAcquired);
    if (isNaN(acquired.getTime())) return 50;
    const ageMonths = (new Date().getTime() - acquired.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (ageMonths > 60) return 80;
    if (ageMonths > 36) return 50;
    if (ageMonths > 12) return 25;
    return 10;
  }

  private riskLevelFromScore(score: number): 'Critical' | 'High' | 'Medium' | 'Low' {
    if (score >= 75) return 'Critical';
    if (score >= 50) return 'High';
    if (score >= 30) return 'Medium';
    return 'Low';
  }

  private predictFailure(asset: Asset): Date {
    const base = asset.DateAcquired ? new Date(asset.DateAcquired) : new Date();
    const lifespan = 48; // average months
    const predicted = new Date(base);
    predicted.setMonth(predicted.getMonth() + lifespan);
    if (predicted < new Date()) {
      const d = new Date();
      d.setMonth(d.getMonth() + 3);
      return d;
    }
    return predicted;
  }

  private recommendAction(level: string, asset: Asset): string {
    switch (level) {
      case 'Critical':
        return `Immediately schedule replacement for ${asset.AssetTag}. Current condition: ${asset.AssetCondition}. Estimated failure is imminent.`;
      case 'High':
        return `Plan replacement for ${asset.AssetTag} within the next quarter. Monitor closely for performance degradation.`;
      case 'Medium':
        return `Include ${asset.AssetTag} in next review cycle. Consider warranty renewal or preventive maintenance.`;
      default:
        return `No immediate action required for ${asset.AssetTag}. Continue standard monitoring.`;
    }
  }

  // ── Anomaly Detection ──

  detectAnomalies(assets: Asset[]): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Temporal: too many recently acquired assets with issues
    const recentDefective = assets.filter(a => {
      if (!a.DateAcquired) return false;
      const months = (new Date().getTime() - new Date(a.DateAcquired).getTime()) / (1000 * 60 * 60 * 24 * 30);
      return months < 12 && (a.AssetCondition || '').toLowerCase() === 'defective';
    });
    if (recentDefective.length > 0) {
      anomalies.push({
        title: 'Premature Asset Failures',
        description: `${recentDefective.length} asset(s) acquired within the last 12 months are already defective.`,
        severity: recentDefective.length >= 5 ? 'critical' : recentDefective.length >= 3 ? 'high' : 'medium',
        dimension: 'temporal',
        score: Math.min(100, recentDefective.length * 20),
        affectedAssets: recentDefective,
        suggestedAction: 'Investigate vendor quality and review procurement contracts.'
      });
    }

    // Organizational: concentration of assets in single checkout
    const checkoutMap = new Map<string, Asset[]>();
    assets.forEach(a => {
      if (a.CheckoutTo) {
        const list = checkoutMap.get(a.CheckoutTo) || [];
        list.push(a);
        checkoutMap.set(a.CheckoutTo, list);
      }
    });
    checkoutMap.forEach((list, person) => {
      if (list.length >= 10) {
        anomalies.push({
          title: `High Asset Concentration — ${person}`,
          description: `${person} has ${list.length} assets checked out, significantly above average.`,
          severity: list.length >= 20 ? 'high' : 'medium',
          dimension: 'organizational',
          score: Math.min(100, list.length * 5),
          affectedAssets: list,
          suggestedAction: `Review asset distribution for ${person}. Redistribute if possible.`
        });
      }
    });

    // Category: warranty gaps
    const expiredWarranty = assets.filter(a => {
      if (!a.Warranty) return false;
      return new Date(a.Warranty) < new Date();
    });
    if (expiredWarranty.length > 5) {
      anomalies.push({
        title: 'High Expired Warranty Count',
        description: `${expiredWarranty.length} assets have expired warranties, exposing the organization to unplanned replacement costs.`,
        severity: expiredWarranty.length >= 20 ? 'critical' : expiredWarranty.length >= 10 ? 'high' : 'medium',
        dimension: 'financial',
        score: Math.min(100, expiredWarranty.length * 4),
        affectedAssets: expiredWarranty,
        suggestedAction: 'Initiate bulk warranty renewal or plan replacements for exposed assets.'
      });
    }

    anomalies.sort((a, b) => b.score - a.score);
    return anomalies;
  }

  // ── Lifecycle Optimization ──

  computeLifecycleRecommendations(assets: Asset[]): LifecycleRecommendation[] {
    return assets.map(asset => {
      const currentAge = asset.DateAcquired
        ? Math.round((new Date().getTime() - new Date(asset.DateAcquired).getTime()) / (1000 * 60 * 60 * 24 * 30))
        : 0;
      const expectedLife = 60; // 5 years default
      const estimatedRemainingLife = Math.max(0, expectedLife - currentAge);
      const estimatedValue = 1000; // placeholder
      const monthlyDepreciation = currentAge > 0 ? Math.round(estimatedValue / expectedLife) : 0;

      let warrantyGapCost = 0;
      if (asset.Warranty) {
        const warrantyEnd = new Date(asset.Warranty);
        if (warrantyEnd < new Date()) {
          const gapMonths = (new Date().getTime() - warrantyEnd.getTime()) / (1000 * 60 * 60 * 24 * 30);
          warrantyGapCost = Math.round(gapMonths * monthlyDepreciation * 0.3);
        }
      }

      let recommendation: 'replace' | 'monitor' | 'keep';
      let justification: string;
      let optimalReplacementDate: Date | null = null;
      let savingsIfReplaced = 0;

      if (estimatedRemainingLife <= 6 || (asset.AssetCondition || '').toLowerCase() === 'defective') {
        recommendation = 'replace';
        justification = `Asset ${asset.AssetTag} has ${estimatedRemainingLife} months of estimated remaining life. Condition: ${asset.AssetCondition}. Replacement cost will be lower now than after failure.`;
        optimalReplacementDate = new Date();
        optimalReplacementDate.setMonth(optimalReplacementDate.getMonth() + 1);
        savingsIfReplaced = Math.round(warrantyGapCost + monthlyDepreciation * 6);
      } else if (estimatedRemainingLife <= 18 || (asset.AssetCondition || '').toLowerCase() === 'fair') {
        recommendation = 'monitor';
        justification = `Asset ${asset.AssetTag} is aging but still functional. Increased monitoring recommended. Plan budget for future replacement.`;
        optimalReplacementDate = new Date();
        optimalReplacementDate.setMonth(optimalReplacementDate.getMonth() + estimatedRemainingLife - 3);
      } else {
        recommendation = 'keep';
        justification = `Asset ${asset.AssetTag} is in good standing with ${estimatedRemainingLife} months of remaining useful life. No action needed at this time.`;
      }

      return {
        assetTag: asset.AssetTag,
        description: asset.Description,
        currentAge,
        estimatedRemainingLife,
        monthlyDepreciation,
        warrantyGapCost,
        recommendation,
        justification,
        optimalReplacementDate,
        savingsIfReplaced
      };
    });
  }

  // ── Budget Forecasting ──

  computeBudgetForecasts(assets: Asset[]): BudgetForecast[] {
    const forecasts: BudgetForecast[] = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const forecastDate = new Date(now);
      forecastDate.setMonth(forecastDate.getMonth() + i);
      const monthLabel = forecastDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      // Estimate costs based on asset patterns
      const warrantyRenewals = assets.filter(a => {
        if (!a.Warranty) return false;
        const exp = new Date(a.Warranty);
        return exp.getMonth() === forecastDate.getMonth() && exp.getFullYear() === forecastDate.getFullYear();
      }).length * 200;

      const replacementCandidates = assets.filter(a => {
        if (!a.DateAcquired) return false;
        const age = (forecastDate.getTime() - new Date(a.DateAcquired).getTime()) / (1000 * 60 * 60 * 24 * 30);
        return age > 54 && age <= 66;
      });
      const replacementCosts = replacementCandidates.length * 800;

      const baseAcquisitions = Math.round(assets.length * 0.02) * 1000;
      const seasonalFactor = [0.8, 0.7, 1.0, 1.1, 0.9, 0.8, 1.2, 0.9, 1.0, 1.3, 0.8, 0.7];
      const newAcquisitions = Math.round(baseAcquisitions * seasonalFactor[forecastDate.getMonth()]);

      const predictedSpend = newAcquisitions + warrantyRenewals + replacementCosts;
      const confidence = Math.max(0.5, 0.95 - i * 0.04);

      forecasts.push({
        month: monthLabel,
        predictedSpend,
        newAcquisitions,
        warrantyRenewals,
        replacementCosts,
        confidence: Math.round(confidence * 100) / 100
      });
    }

    return forecasts;
  }

  // ── NLP Query Processing ──

  processNaturalLanguageQuery(query: string, assets: Asset[]): NLPQueryResult {
    const lowerQuery = query.toLowerCase();
    const filters: { [key: string]: any } = {};
    let matchedAssets = [...assets];

    // Condition filters
    const conditions = ['good', 'defective', 'fair', 'for disposal', 'disposed'];
    for (const condition of conditions) {
      if (lowerQuery.includes(condition)) {
        filters['AssetCondition'] = condition;
        matchedAssets = matchedAssets.filter(a =>
          (a.AssetCondition || '').toLowerCase().includes(condition)
        );
        break;
      }
    }

    // Category filters
    const categories: { [key: string]: string } = {
      'laptop': 'Laptop',
      'server': 'Server',
      'desktop': 'Desktop',
      'monitor': 'Monitor',
      'printer': 'Printer',
      'switch': 'Switch',
      'router': 'Router'
    };
    for (const [keyword, category] of Object.entries(categories)) {
      if (lowerQuery.includes(keyword)) {
        filters['GroupAssetCategory'] = category;
        matchedAssets = matchedAssets.filter(a =>
          (a.GroupAssetCategory || '').toLowerCase().includes(keyword) ||
          (a.Description || '').toLowerCase().includes(keyword)
        );
        break;
      }
    }

    // Warranty expiring
    if (lowerQuery.includes('warranty') && (lowerQuery.includes('expir') || lowerQuery.includes('ending'))) {
      filters['Warranty'] = 'expiring soon';
      const threeMonths = new Date();
      threeMonths.setMonth(threeMonths.getMonth() + 3);
      matchedAssets = matchedAssets.filter(a => {
        if (!a.Warranty) return false;
        const exp = new Date(a.Warranty);
        return exp > new Date() && exp <= threeMonths;
      });
    }

    // Checkout / assignment filters
    if (lowerQuery.includes('available') || lowerQuery.includes('unassigned')) {
      filters['CheckoutTo'] = 'Available';
      matchedAssets = matchedAssets.filter(a => !a.CheckoutTo || a.CheckoutTo.trim() === '');
    }

    if (lowerQuery.includes('my assets') || lowerQuery.includes('my asset')) {
      filters['scope'] = 'personal';
    }

    // Interpret intent
    let interpretedIntent = 'search';
    if (lowerQuery.includes('show') || lowerQuery.includes('list') || lowerQuery.includes('find') || lowerQuery.includes('get')) {
      interpretedIntent = 'search';
    }
    if (lowerQuery.includes('count') || lowerQuery.includes('how many')) {
      interpretedIntent = 'count';
    }

    // Suggestions
    const suggestions: string[] = [];
    if (matchedAssets.length === 0) {
      suggestions.push('Show all assets', 'Show all defective assets', 'Show laptops');
    } else if (matchedAssets.length > 20) {
      suggestions.push('Filter by condition', 'Show only defective ones', 'Show assets with expiring warranty');
    }

    return { interpretedIntent, filters, matchedAssets, suggestions };
  }
}
