import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AiInsightsService } from '../services/ai-insights.service';
import { NLPQueryResult } from '../services/ai-engine.service';
import { Subscription } from 'rxjs';



interface ChatMessage {
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
  queryResult?: NLPQueryResult;
}

@Component({
  selector: 'app-ai-chat',
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.scss'],
  standalone: false
})
export class AiChatComponent implements OnInit, OnDestroy {
  private aiService = inject(AiInsightsService);
  isLoadingModules: boolean = false;
  private readonly MIN_LOADING_DURATION_MS = 1500; // Set your desired minimum duration

  ngOnInit(): void {
    this.isLoadingModules = true;
    setTimeout(() => {
      this.isLoadingModules = false;
    }, this.MIN_LOADING_DURATION_MS);
  }

  userInput = '';
  isProcessing = false;
  messages: ChatMessage[] = [];
  private subscription: Subscription | null = null;
  isLoading: boolean = false;


  exampleQueries = [
    // Multi-criteria combined queries (not possible in any module UI)
    //'Show all defective laptops with expiring warranty',
    'Show all assets belong to Manila Infra Team in good condition',
    'Show all good condition servers belong to Manila Infra Team',

    // Condition-based filtering (no module has condition filters)
    'Show all defective assets',
    'Show all disposed assets',
    //'Show all assets in fair condition',
    'Show all assets for disposal',

    // Team & assignment queries (no module supports this)
    'Show all assets belong to Manila Infra Team',
    //'Show unassigned assets',

    // Time-based warranty intelligence (beyond warranty-monitoring)
    'Which assets have warranty expiring in the next 3 months?',
    'Show all assets with expired warranty for laptops',
    'Show all assets with expired warranty for Rack Type Server',
    'Show all assets with expired warranty for Tower Type Server',


    // Age-based queries (not available in any module)
    'Show assets older than 3 years',
    'Show assets acquired this year',

    // Server type queries (Rack vs Tower)
    'Show all Rack Type Servers',
    'Show all Tower Type Servers',
    'Show all defective Rack Type Servers',
    'Show all Tower Type Servers in good condition',

    // Count & statistics (no module provides counts)
    'How many defective laptops do we have?',
    'How many Rack Type Servers do we have?',

    // Location queries (no module has location filtering)
    //'Show all assets in Manila',

    // Cost center queries (only warranty-monitoring has this)
    'Show assets under cost center 5336',

    // Direct lookups (faster than scrolling through tables)
    //'Find asset tag ASSET-001',
    //'Find serial number SN12345',
  ];


  objectKeys = Object.keys;

  constructor() {
    // Welcome message
    this.messages.push({
      type: 'ai',
      text: 'Welcome to the Infra AI Asset Query Engine. Ask me anything about your assets :) . For example: "Show all laptops with expiring warranty" or "Find my assets".',
      timestamp: new Date()
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  sendQuery(): void {
    const query = this.userInput.trim();
    if (!query || this.isProcessing) return;

    // Add user message
    this.messages.push({
      type: 'user',
      text: query,
      timestamp: new Date()
    });

    this.userInput = '';
    this.isProcessing = true;

    this.subscription = this.aiService.queryAssets(query).subscribe({
      next: (result) => {
        const count = result.matchedAssets.length;
        let responseText: string;

        if (result.interpretedIntent === 'count') {
          responseText = `Found ${count} asset(s) matching your query.`;
        } else if (count === 0) {
          responseText = 'No assets found matching your query. Try a different filter or check the suggestions below.';
        } else {
          responseText = `Found ${count} asset(s) matching "${query}".`;
        }

        this.messages.push({
          type: 'ai',
          text: responseText,
          timestamp: new Date(),
          queryResult: result
        });

        this.isProcessing = false;
      },
      error: (err) => {
        console.error('AI Query error:', err);
        this.messages.push({
          type: 'ai',
          text: 'Sorry, something went wrong while processing your query. Please try again.',
          timestamp: new Date()
        });
        this.isProcessing = false;
      }
    });
  }

  useExample(query: string): void {
    this.userInput = query;
    this.sendQuery();
  }

  clearChat(): void {
    this.messages = [{
      type: 'ai',
      text: 'Chat cleared. Ask me anything about your assets!',
      timestamp: new Date()
    }];
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendQuery();
    }
  }
}
