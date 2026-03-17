import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse } from '../models/quest.model';

const API = 'http://localhost:8080/api';          //dev API
//const API = 'https://api.blinkergate.lol/api';  //prod API

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey    = 'bg_token';
  private usernameKey = 'bg_username';
  private lvlKey      = 'bg_lvl';
  private xpKey       = 'bg_xp';
  private roleKey     = 'bg_role';

  loggedIn$ = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient, private router: Router) {}

  register(username: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/auth/register`, { username, email, password })
        .pipe(tap(res => this.storeAuth(res)));
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/auth/login`, { username, password })
        .pipe(tap(res => this.storeAuth(res)));
  }

  logout(): void {
    [this.tokenKey, this.usernameKey, this.lvlKey, this.xpKey, this.roleKey]
        .forEach(k => localStorage.removeItem(k));
    this.loggedIn$.next(false);
    this.router.navigate(['/login']);
  }

  getToken():    string | null { return localStorage.getItem(this.tokenKey); }
  getUsername(): string | null { return localStorage.getItem(this.usernameKey); }
  getLvl():      number        { return Number(localStorage.getItem(this.lvlKey))  || 1; }
  getXp():       number        { return Number(localStorage.getItem(this.xpKey))   || 0; }
  getRole():     string        { return localStorage.getItem(this.roleKey) ?? 'USER'; }

  // Called by UserComponent after a successful username change
  setUsername(username: string): void {
    localStorage.setItem(this.usernameKey, username);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  private storeAuth(res: AuthResponse): void {
    localStorage.setItem(this.tokenKey,    res.token);
    localStorage.setItem(this.usernameKey, res.username);
    if (res.lvl       != null) localStorage.setItem(this.lvlKey,  String(res.lvl));
    if (res.currentXp != null) localStorage.setItem(this.xpKey,   String(res.currentXp));
    if (res.role      != null) localStorage.setItem(this.roleKey,  res.role);
    this.loggedIn$.next(true);
  }
}