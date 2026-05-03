import { Component } from '@angular/core';
import { AnswerPanelComponent } from './app/components/answer-panel.component';
import { KnowledgePanelComponent } from './app/components/knowledge-panel.component';
import { StatusStripComponent } from './app/components/status-strip.component';
import { VisitorCommandComponent } from './app/components/visitor-command.component';
import { VoiceSamplePanelComponent } from './app/components/voice-sample-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    AnswerPanelComponent,
    KnowledgePanelComponent,
    StatusStripComponent,
    VisitorCommandComponent,
    VoiceSamplePanelComponent,
  ],
  template: `
    <main class="app-shell">
      <section class="workspace">
        <div class="topbar">
          <div class="brand-lockup">
            <span class="brand-mark">AR</span>
            <div>
              <strong>AI Receptionist</strong>
              <span>Angular 21 Console</span>
            </div>
          </div>
          <app-status-strip />
        </div>

        <section class="hero-panel">
          <div>
            <p class="eyebrow"><span class="icon-mark">LIVE</span> Voice receptionist modeling</p>
            <h1>Reception desk intelligence, tuned to your business.</h1>
          </div>
          <div class="hero-metrics">
            <div><strong>Voice</strong><span>Upload or record</span></div>
            <div><strong>Knowledge</strong><span>Text, JSON, document</span></div>
            <div><strong>Answer</strong><span>Voice or text</span></div>
          </div>
        </section>

        <div class="dashboard-grid">
          <app-voice-sample-panel />
          <app-knowledge-panel />
          <app-visitor-command />
          <app-answer-panel />
        </div>
      </section>
    </main>
  `,
})
export class AppComponent {}
