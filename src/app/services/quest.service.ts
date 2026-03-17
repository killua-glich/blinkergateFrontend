import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateQuestRequest, Quest } from '../models/quest.model';
import {environment} from "../../environments/environment";

const API = environment.apiBaseUrl;

@Injectable({ providedIn: 'root' })
export class QuestService {

  constructor(private http: HttpClient) {}

  getQuests(): Observable<Quest[]> {
    return this.http.get<Quest[]>(`${API}/quests`);
  }

  createQuest(req: CreateQuestRequest): Observable<Quest> {
    return this.http.post<Quest>(`${API}/quests`, req);
  }

  toggleComplete(id: number): Observable<Quest> {
    return this.http.patch<Quest>(`${API}/quests/${id}/complete`, {});
  }

  deleteQuest(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/quests/${id}`);
  }
}
