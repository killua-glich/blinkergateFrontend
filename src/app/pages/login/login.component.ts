import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    imports: [FormsModule, RouterModule],
    template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="logo">
          <span class="logo-icon">⚡</span>
          <h1>Blinkergate</h1>
        </div>
        <p class="tagline">Quest Master awaits</p>
    
        @if (error) {
          <div class="error-msg">{{ error }}</div>
        }
    
        <div class="field">
          <label>Username</label>
          <input [(ngModel)]="username" type="text" placeholder="your_username" autocomplete="username"/>
        </div>
        <div class="field">
          <label>Password</label>
          <input [(ngModel)]="password" type="password" placeholder="••••••••" autocomplete="current-password"/>
        </div>
    
        <button class="btn-primary" (click)="login()" [disabled]="loading">
          {{ loading ? 'Logging in...' : 'Enter the Gate' }}
        </button>
    
        <p class="switch-link">No account? <a routerLink="/register">Create one</a></p>
      </div>
    </div>
    `,
    styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg);
    }
    .auth-card {
      width: 380px;
      padding: 2.5rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
    }
    .logo { display: flex; align-items: center; gap: .75rem; margin-bottom: .25rem; }
    .logo-icon { font-size: 1.8rem; }
    .logo h1 { font-family: 'Bebas Neue', sans-serif; font-size: 2rem; letter-spacing: .08em; color: var(--accent); margin: 0; }
    .tagline { color: var(--muted); margin-bottom: 2rem; font-size: .9rem; }
    .field { margin-bottom: 1.2rem; }
    .field label { display: block; font-size: .8rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); margin-bottom: .4rem; }
    .field input { width: 100%; box-sizing: border-box; padding: .7rem 1rem; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: 1rem; transition: border .2s; }
    .field input:focus { outline: none; border-color: var(--accent); }
    .btn-primary { width: 100%; padding: .8rem; background: var(--accent); color: #000; border: none; border-radius: 6px; font-size: 1rem; font-weight: 700; letter-spacing: .06em; cursor: pointer; transition: opacity .2s, transform .1s; margin-top: .5rem; }
    .btn-primary:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
    .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
    .error-msg { background: #ff4d4d22; border: 1px solid #ff4d4d55; color: #ff8080; border-radius: 6px; padding: .7rem 1rem; margin-bottom: 1rem; font-size: .9rem; }
    .switch-link { text-align: center; margin-top: 1.5rem; font-size: .9rem; color: var(--muted); }
    .switch-link a { color: var(--accent); text-decoration: none; font-weight: 600; }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    if (!this.username || !this.password) return;
    this.loading = true;
    this.error = '';
    this.auth.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => { this.error = e.error?.message || 'Invalid credentials'; this.loading = false; }
    });
  }
}
