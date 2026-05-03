import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReceptionistSessionService } from '../services/receptionist-session.service';
import { SpeechCommandService } from '../services/speech-command.service';

@Component({
  selector: 'app-visitor-command',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="panel command-panel" aria-labelledby="command-title">
      <div class="panel-heading">
        <div>
          <p class="section-kicker"><span class="icon-mark">ASK</span> Visitor command</p>
          <h2 id="command-title">Question intake</h2>
        </div>
      </div>

      <label class="question-field">
        <span>Visitor question or command</span>
        <div class="question-input">
          <textarea
            [ngModel]="session.visitorQuestion()"
            (ngModelChange)="session.visitorQuestion.set($event)"
            rows="5"
            placeholder="Can I book an appointment tomorrow?"
          ></textarea>
          <button
            class="mic-button"
            type="button"
            [title]="speech.isListening() ? 'Stop voice command' : 'Speak visitor command'"
            (click)="toggleListening()"
          >
            {{ speech.isListening() ? 'Stop' : 'Mic' }}
          </button>
        </div>
      </label>
    </section>
  `,
})
export class VisitorCommandComponent {
  readonly session = inject(ReceptionistSessionService);
  readonly speech = inject(SpeechCommandService);

  toggleListening(): void {
    if (this.speech.isListening()) {
      this.speech.stop();
      return;
    }

    this.speech.start((transcript) => this.session.visitorQuestion.set(transcript));
  }
}
