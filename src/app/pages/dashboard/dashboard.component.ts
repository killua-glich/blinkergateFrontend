import {Component, inject, OnInit} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { QuestService } from '../../services/quest.service';
import { AuthService } from '../../services/auth.service';
import { Quest, CreateQuestRequest, QuestCategory, RepeatType } from '../../models/quest.model';
import {routes} from "../../app.routes";
import {RouterLink} from "@angular/router";
import {HeaderComponent} from "../../components/header/header.component";
import {repeat} from "rxjs";
import {BlinkerStatusComponent} from "./blinker-status/blinker-status.component";

@Component({
    selector: 'app-dashboard',
  imports: [FormsModule, HeaderComponent, BlinkerStatusComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
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

  private questService = inject(QuestService)
  private authService = inject(AuthService)

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

  redeemBlinkerOnClick() {
    this.questService.redeemBlinker().subscribe({
      next: (updatedUser) => {
        console.log('Redeemed!', updatedUser);

        this.quests.forEach(value => this.toggleComplete(value));
        this.quests.filter(value => value.repeatType == "SINGLE").forEach(value => this.deleteQuest(value.id));
      },
      error: (err) => console.error('Redeem failed', err)
    });
  }

  protected readonly routes = routes;
}
