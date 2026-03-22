import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { NLPQueryResult } from './ai-engine.service';

interface AiChatApiResponse {
  interpretedIntent: string;
  filters: { [key: string]: any };
  matchedAssets: any[];
  suggestions: string[];
  aiResponse: string;
  aiPowered: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OpenaiChatService {
  private apiUrl = 'http://localhost:3000/api/ai-chat';

  constructor(private http: HttpClient) {}

  /**
   * Sends a natural language query to the OpenAI-powered backend endpoint.
   * Returns the same NLPQueryResult interface for compatibility with existing UI.
   */
  queryAssets(query: string): Observable<NLPQueryResult & { aiResponse?: string; aiPowered?: boolean }> {
    return this.http.post<AiChatApiResponse>(this.apiUrl, { query }).pipe(
      map(response => ({
        interpretedIntent: response.interpretedIntent,
        filters: response.filters,
        matchedAssets: response.matchedAssets,
        suggestions: response.suggestions,
        aiResponse: response.aiResponse,
        aiPowered: response.aiPowered
      }))
    );
  }

  /**
   * Check if the OpenAI backend is available
   */
  isAvailable(): Observable<boolean> {
    return this.http.post<any>(this.apiUrl, { query: 'test' }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
