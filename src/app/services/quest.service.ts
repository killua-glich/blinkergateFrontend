import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateQuestRequest, Quest } from '../models/quest.model';

const API = 'http://localhost:8080/api';          //dev API
//const API = 'https://api.blinkergate.lol/api';  //prod API

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
