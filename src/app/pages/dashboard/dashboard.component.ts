import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestService } from '../../services/quest.service';
import { AuthService } from '../../services/auth.service';
import { Quest, CreateQuestRequest, QuestCategory, RepeatType } from '../../models/quest.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard">
      <!-- Header -->
      <header class="header">
        <div class="header-left">
          <span class="logo-icon">⚡</span>
          <span class="logo-text">Blinkergate</span>
        </div>
        <div class="header-right">
          <span class="username">{{ username }}</span>
          <button class="btn-ghost" (click)="logout()">Logout</button>
        </div>
      </header>

      <main class="main">
        <!-- Progress bar -->
        <div class="progress-section">
          <div class="progress-header">
            <div>
              <h2 class="day-title">Today's Quests</h2>
              <p class="progress-label">{{ completedCount }} / {{ quests.length }} completed</p>
            </div>
            <div class="blinker-status" [class.earned]="allDone && quests.length > 0">
              <span class="blinker-icon">🌟</span>
              <span>{{ allDone && quests.length > 0 ? 'Blinker Earned!' : 'Complete all quests' }}</span>
            </div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="progressPercent"></div>
          </div>
        </div>

        <!-- Category filters -->
        <div class="filters">
          <button class="filter-btn" [class.active]="activeFilter === 'ALL'" (click)="activeFilter = 'ALL'">All</button>
          <button class="filter-btn" [class.active]="activeFilter === 'SKINCARE'" (click)="activeFilter = 'SKINCARE'">
            🧴 Skin Care
          </button>
          <button class="filter-btn" [class.active]="activeFilter === 'EDUCATION'" (click)="activeFilter = 'EDUCATION'">
            📚 Education
          </button>
          <button class="filter-btn" [class.active]="activeFilter === 'PRODUCTIVITY'" (click)="activeFilter = 'PRODUCTIVITY'">
            ⚙️ Productivity
          </button>
          <button class="filter-btn" [class.active]="activeFilter === 'HEALTH'" (click)="activeFilter = 'HEALTH'">
            💪 Health
          </button>
        </div>

        <!-- Quest list -->
        <div class="quest-list" *ngIf="!loading">
          <div *ngIf="filteredQuests.length === 0" class="empty-state">
            <span>🗺️</span>
            <p>No quests yet. Add one below!</p>
          </div>

          <div class="quest-card" *ngFor="let q of filteredQuests" [class.completed]="q.completed">
            <button class="complete-btn" (click)="toggleComplete(q)" [title]="q.completed ? 'Mark incomplete' : 'Mark complete'">
              <span *ngIf="!q.completed">○</span>
              <span *ngIf="q.completed">✓</span>
            </button>
            <div class="quest-info">
              <div class="quest-top">
                <span class="quest-title">{{ q.title }}</span>
                <span class="tag repeat-tag" [class.daily]="q.repeatType === 'DAILY'" [class.single]="q.repeatType === 'SINGLE'">
                  {{ q.repeatType === 'DAILY' ? '🔁 Daily' : '1️⃣ Once' }}
                </span>
              </div>
              <div class="quest-meta">
                <span class="category-tag">{{ categoryLabel(q.category) }}</span>
                <span *ngIf="q.description" class="quest-desc">{{ q.description }}</span>
              </div>
            </div>
            <button class="delete-btn" (click)="deleteQuest(q.id)" title="Delete quest">✕</button>
          </div>
        </div>

        <div class="loading" *ngIf="loading">Loading quests...</div>

        <!-- Add Quest Form -->
        <div class="add-section">
          <button class="toggle-form-btn" (click)="showForm = !showForm">
            {{ showForm ? '✕ Cancel' : '+ Add Quest' }}
          </button>

          <div class="add-form" *ngIf="showForm">
            <h3>New Quest</h3>
            <div class="form-row">
              <div class="field">
                <label>Title *</label>
                <input [(ngModel)]="newTitle" type="text" placeholder="Quest title"/>
              </div>
              <div class="field">
                <label>Description</label>
                <input [(ngModel)]="newDescription" type="text" placeholder="Optional details"/>
              </div>
            </div>
            <div class="form-row">
              <div class="field">
                <label>Category *</label>
                <select [(ngModel)]="newCategory">
                  <option value="SKINCARE">🧴 Skin Care</option>
                  <option value="EDUCATION">📚 Education</option>
                  <option value="PRODUCTIVITY">⚙️ Productivity</option>
                  <option value="HEALTH">💪 Health</option>
                </select>
              </div>
              <div class="field">
                <label>Repeat *</label>
                <select [(ngModel)]="newRepeatType">
                  <option value="DAILY">🔁 Daily</option>
                  <option value="SINGLE">1️⃣ Single (once)</option>
                </select>
              </div>
            </div>
            <div *ngIf="formError" class="error-msg">{{ formError }}</div>
            <button class="btn-primary" (click)="createQuest()" [disabled]="creating">
              {{ creating ? 'Adding...' : 'Add Quest ⚡' }}
            </button>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard { min-height: 100vh; background: var(--bg); display: flex; flex-direction: column; }

    .header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: var(--surface); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10; }
    .header-left { display: flex; align-items: center; gap: .6rem; }
    .logo-icon { font-size: 1.5rem; }
    .logo-text { font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem; letter-spacing: .08em; color: var(--accent); }
    .header-right { display: flex; align-items: center; gap: 1rem; }
    .username { color: var(--muted); font-size: .9rem; }
    .btn-ghost { background: none; border: 1px solid var(--border); color: var(--muted); padding: .4rem .9rem; border-radius: 6px; cursor: pointer; font-size: .85rem; transition: all .2s; }
    .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }

    .main { max-width: 760px; margin: 0 auto; width: 100%; padding: 2rem 1rem; }

    .progress-section { margin-bottom: 1.5rem; }
    .progress-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: .75rem; }
    .day-title { font-size: 1.4rem; font-weight: 700; margin: 0 0 .2rem; color: var(--text); }
    .progress-label { color: var(--muted); font-size: .85rem; margin: 0; }
    .blinker-status { display: flex; align-items: center; gap: .5rem; padding: .5rem 1rem; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; font-size: .85rem; color: var(--muted); transition: all .3s; }
    .blinker-status.earned { background: #ffd70022; border-color: #ffd700; color: #ffd700; font-weight: 700; }
    .blinker-icon { font-size: 1.1rem; }
    .progress-bar { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), #ffd700); border-radius: 3px; transition: width .4s ease; }

    .filters { display: flex; gap: .5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .filter-btn { padding: .4rem .9rem; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; color: var(--muted); font-size: .82rem; cursor: pointer; transition: all .2s; }
    .filter-btn.active, .filter-btn:hover { border-color: var(--accent); color: var(--accent); background: #e8ff411a; }

    .quest-list { display: flex; flex-direction: column; gap: .7rem; margin-bottom: 2rem; }
    .quest-card { display: flex; align-items: flex-start; gap: 1rem; padding: 1rem 1.2rem; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; transition: all .2s; }
    .quest-card:hover { border-color: var(--accent-dim); }
    .quest-card.completed { opacity: .6; }
    .quest-card.completed .quest-title { text-decoration: line-through; }

    .complete-btn { width: 28px; height: 28px; min-width: 28px; border-radius: 50%; border: 2px solid var(--border); background: none; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; color: var(--accent); transition: all .2s; }
    .complete-btn:hover { border-color: var(--accent); background: #e8ff411a; }

    .quest-info { flex: 1; }
    .quest-top { display: flex; align-items: center; gap: .7rem; flex-wrap: wrap; }
    .quest-title { font-weight: 600; color: var(--text); }
    .tag { font-size: .72rem; padding: .2rem .6rem; border-radius: 10px; font-weight: 600; }
    .repeat-tag.daily { background: #4da6ff22; color: #4da6ff; border: 1px solid #4da6ff44; }
    .repeat-tag.single { background: #c084fc22; color: #c084fc; border: 1px solid #c084fc44; }
    .quest-meta { display: flex; align-items: center; gap: .6rem; margin-top: .3rem; flex-wrap: wrap; }
    .category-tag { font-size: .75rem; color: var(--muted); background: var(--bg); border: 1px solid var(--border); padding: .15rem .5rem; border-radius: 6px; }
    .quest-desc { font-size: .82rem; color: var(--muted); }

    .delete-btn { background: none; border: none; color: var(--muted); cursor: pointer; font-size: .9rem; padding: .3rem; border-radius: 4px; transition: all .2s; line-height: 1; }
    .delete-btn:hover { color: #ff6b6b; background: #ff6b6b15; }

    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 3rem; color: var(--muted); gap: .5rem; }
    .empty-state span { font-size: 2.5rem; }

    .add-section { border-top: 1px solid var(--border); padding-top: 1.5rem; }
    .toggle-form-btn { padding: .65rem 1.4rem; background: none; border: 1px dashed var(--accent); color: var(--accent); border-radius: 8px; cursor: pointer; font-size: .95rem; font-weight: 600; letter-spacing: .04em; transition: all .2s; }
    .toggle-form-btn:hover { background: #e8ff411a; }

    .add-form { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; margin-top: 1rem; }
    .add-form h3 { margin: 0 0 1.2rem; font-size: 1rem; color: var(--accent); text-transform: uppercase; letter-spacing: .1em; font-weight: 700; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
    .field { display: flex; flex-direction: column; gap: .35rem; }
    .field label { font-size: .78rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
    .field input, .field select { padding: .65rem .9rem; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: .95rem; transition: border .2s; }
    .field input:focus, .field select:focus { outline: none; border-color: var(--accent); }
    .field select { cursor: pointer; }

    .btn-primary { padding: .75rem 2rem; background: var(--accent); color: #000; border: none; border-radius: 6px; font-size: .95rem; font-weight: 700; letter-spacing: .05em; cursor: pointer; transition: opacity .2s, transform .1s; margin-top: .5rem; }
    .btn-primary:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
    .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
    .error-msg { background: #ff4d4d22; border: 1px solid #ff4d4d55; color: #ff8080; border-radius: 6px; padding: .6rem .9rem; margin-bottom: .8rem; font-size: .88rem; }
    .loading { text-align: center; color: var(--muted); padding: 2rem; }

    @media (max-width: 600px) {
      .form-row { grid-template-columns: 1fr; }
      .progress-header { flex-direction: column; gap: .8rem; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  quests: Quest[] = [];
  loading = true;
  showForm = false;
  creating = false;
  formError = '';
  activeFilter: string = 'ALL';

  newTitle = '';
  newDescription = '';
  newCategory: QuestCategory = 'PRODUCTIVITY';
  newRepeatType: RepeatType = 'DAILY';

  constructor(private questService: QuestService, private authService: AuthService) {}

  get username() { return this.authService.getUsername() || ''; }

  get filteredQuests(): Quest[] {
    if (this.activeFilter === 'ALL') return this.quests;
    return this.quests.filter(q => q.category === this.activeFilter);
  }

  get completedCount(): number { return this.quests.filter(q => q.completed).length; }
  get progressPercent(): number { return this.quests.length ? (this.completedCount / this.quests.length) * 100 : 0; }
  get allDone(): boolean { return this.quests.length > 0 && this.completedCount === this.quests.length; }

  ngOnInit() { this.loadQuests(); }

  loadQuests() {
    this.loading = true;
    this.questService.getQuests().subscribe({
      next: (quests) => { this.quests = quests; this.loading = false; },
      error: () => this.loading = false
    });
  }

  toggleComplete(quest: Quest) {
    this.questService.toggleComplete(quest.id).subscribe({
      next: (updated) => {
        const idx = this.quests.findIndex(q => q.id === quest.id);
        if (idx !== -1) this.quests[idx] = updated;
      }
    });
  }

  deleteQuest(id: number) {
    if (!confirm('Delete this quest?')) return;
    this.questService.deleteQuest(id).subscribe({
      next: () => this.quests = this.quests.filter(q => q.id !== id)
    });
  }

  createQuest() {
    if (!this.newTitle.trim()) { this.formError = 'Title is required'; return; }
    this.creating = true;
    this.formError = '';
    const req: CreateQuestRequest = {
      title: this.newTitle.trim(),
      description: this.newDescription.trim() || undefined,
      category: this.newCategory,
      repeatType: this.newRepeatType
    };
    this.questService.createQuest(req).subscribe({
      next: (q) => {
        this.quests.unshift(q);
        this.newTitle = '';
        this.newDescription = '';
        this.newCategory = 'PRODUCTIVITY';
        this.newRepeatType = 'DAILY';
        this.showForm = false;
        this.creating = false;
      },
      error: (e) => { this.formError = e.error?.message || 'Failed to create quest'; this.creating = false; }
    });
  }

  categoryLabel(cat: QuestCategory): string {
    const map: Record<QuestCategory, string> = {
      SKINCARE: '🧴 Skin Care', EDUCATION: '📚 Education',
      PRODUCTIVITY: '⚙️ Productivity', HEALTH: '💪 Health'
    };
    return map[cat];
  }

  logout() { this.authService.logout(); }
}
