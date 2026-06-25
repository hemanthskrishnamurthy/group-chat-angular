import { AfterViewChecked, Component, ElementRef, ViewChild, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
  ],
  template: `
    <main class="chat-page">
      <section class="chat-shell">
        <header class="chat-header">
          <div class="brand">
            <span class="brand-icon"><lucide-angular name="message-circle" size="22" /></span>
            <div>
              <h1>Group Chat</h1>
              <p>Real-time messages with Socket.IO</p>
            </div>
          </div>

          <div class="status-row">
            <span class="status-pill" [class.connected]="chat.isConnected()">
              <lucide-angular [name]="chat.isConnected() ? 'wifi' : 'wifi-off'" size="16" />
              {{ chat.isConnected() ? 'Connected' : 'Offline' }}
            </span>
            <span class="status-pill">
              <lucide-angular name="users" size="16" />
              {{ chat.onlineCount() }} online
            </span>
          </div>
        </header>

        <section class="chat-body">
          @if (!chat.hasJoined()) {
            <form class="join-panel" (ngSubmit)="join()">
              <div>
                <h2>Join the conversation</h2>
                <p>Pick a username between 2 and 30 characters.</p>
              </div>

              <label>
                <span>Username</span>
                <input
                  name="username"
                  type="text"
                  autocomplete="name"
                  maxlength="30"
                  [(ngModel)]="username"
                  placeholder="Hemanth"
                />
              </label>

              @if (chat.error()) {
                <p class="error-message">{{ chat.error() }}</p>
              }

              <button class="primary-button" type="submit">
                <lucide-angular name="log-in" size="18" />
                Join chat
              </button>
            </form>
          } @else {
            <section class="conversation-panel">
              <div class="conversation-top">
                <div>
                  <h2>Welcome, {{ chat.currentUsername() }}</h2>
                  <p>{{ chat.currentSocketId() }}</p>
                </div>
                <button class="icon-button" type="button" title="Leave chat" (click)="leave()">
                  <lucide-angular name="x" size="18" />
                </button>
              </div>

              <div #messageList class="message-list">
                @for (item of chat.feed(); track item.id) {
                  @if (item.type === 'chat') {
                    <article class="message" [class.mine]="item.socketId === chat.currentSocketId()">
                      <div class="message-meta">
                        <strong>{{ item.username }}</strong>
                        <time>{{ formatTime(item.timestamp) }}</time>
                      </div>
                      <p>{{ item.message }}</p>
                    </article>
                  } @else {
                    <article class="system-note" [class.welcome]="item.type === 'welcome'">
                      {{ item.message }}
                    </article>
                  }
                }
              </div>

              <div class="typing-line">
                @if (typingText()) {
                  <span>{{ typingText() }}</span>
                }
              </div>

              @if (chat.error()) {
                <p class="error-message compact">{{ chat.error() }}</p>
              }

              <form class="message-form" (ngSubmit)="send()">
                <input
                  name="message"
                  type="text"
                  maxlength="500"
                  [(ngModel)]="message"
                  (input)="chat.startTyping()"
                  (blur)="chat.stopTyping()"
                  placeholder="Type a message..."
                />
                <button class="send-button" type="submit" title="Send message">
                  <lucide-angular name="send" size="18" />
                </button>
              </form>
            </section>
          }
        </section>
      </section>
    </main>
  `,
})
export class ChatComponent implements AfterViewChecked {
  protected readonly chat = inject(ChatService);
  protected username = '';
  protected message = '';

  @ViewChild('messageList') private messageList?: ElementRef<HTMLDivElement>;

  protected readonly typingText = computed(() => {
    const users = this.chat.typingUsers();

    if (users.length === 0) {
      return '';
    }

    if (users.length === 1) {
      return `${users[0].username} is typing...`;
    }

    return `${users.length} people are typing...`;
  });

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  protected join(): void {
    this.chat.joinChat(this.username);
  }

  protected send(): void {
    const message = this.message;
    this.message = '';
    this.chat.sendMessage(message);
  }

  protected leave(): void {
    this.chat.disconnect();
    this.message = '';
  }

  protected formatTime(timestamp: string): string {
    return new Intl.DateTimeFormat('en', {
      hour: '2-digit',
      minute: '2-digit', 
    }).format(new Date(timestamp));
  }

  private scrollToBottom(): void {
    const element = this.messageList?.nativeElement;

    if (!element) {
      return;
    }

    element.scrollTop = element.scrollHeight;
  }
}
