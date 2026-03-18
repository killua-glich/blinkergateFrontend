import {Component, computed, inject, signal, OnInit} from '@angular/core';
import {HeaderComponent} from "../../components/header/header.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs";
import {UserProfile} from "../../models/userProfile.model";

const LEVEL_ROLES: Record<number, string> = {
    1:  'Fresh Blinkerer',
    5:  'Apprentice Blinkerer',
    10: 'Novice Blinkerer',
    15: 'Adept Blinkerer',
    20: 'Skilled Blinkerer',
    25: 'Expert Blinkerer',
    30: 'Master of the Penjamin',
    40: 'Legend of the HotBox',
    50: 'Grand Master of the green arts',
    60: 'Bob the builder',
    100: 'Highest in the room',
    200: 'kafer lesh',
    300: 'Faded af',
    400: 'Stone',
    500: 'Bob Marley',
    700: 'Wizz Khalifa',
    900: 'Snoop Dogg',
    1000: 'The smoke itself'
};

function getRoleForLevel(level: number): string {
    const thresholds = Object.keys(LEVEL_ROLES).map(Number).sort((a, b) => b - a);
    for (const t of thresholds) {
        if (level >= t) return LEVEL_ROLES[t];
    }
    return 'Fresh Blinkerer';
}

@Component({
    selector: 'app-user',
    imports: [
        HeaderComponent,
        ReactiveFormsModule,
        FormsModule
    ],
    templateUrl: './user.component.html',
    styleUrl: './user.component.css'
})
export class UserComponent implements OnInit {

    private http = inject(HttpClient);
    authService = inject(AuthService);

    private readonly API = environment.apiBaseUrl;

    profile = signal<UserProfile>({
        username: '',
        xp: 0,
        xpRequired: 100,
        level: 1,
        role: 'Fresh Blinkerer',
        avatarUrl: undefined,
    });

    isEditingUsername = signal(false);
    editUsername = signal('');
    isSaving = signal(false);
    saveError = signal('');

    xpPercent = computed(() => {
        const p = this.profile();
        return Math.min((p.xp / p.xpRequired) * 100, 100);
    });

    readonly RADIUS = 110;
    readonly STROKE = 8;
    readonly SIZE = (this.RADIUS + this.STROKE) * 2;
    readonly CIRCUMFERENCE = 2 * Math.PI * this.RADIUS;

    dashOffset = computed(() => {
        return this.CIRCUMFERENCE * (1 - this.xpPercent() / 100);
    });

    ngOnInit(): void {
        this.loadProfile();
    }

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }

    private loadProfile(): void {
        this.http.get<any>(`${this.API}/users/me`, { headers: this.getHeaders() })
            .subscribe({
                next: (data) => {
                    const level = data.lvl ?? 1;
                    const currentXp = data.currentXp ?? 0;
                    const xpRequired = level * 100;
                    this.profile.set({
                        username: data.username,
                        xp: currentXp,
                        xpRequired,
                        level,
                        role: getRoleForLevel(level),
                        avatarUrl: undefined,
                    });
                },
                error: (err) => console.error('Failed to load profile', err)
            });
    }

    startEdit(): void {
        this.editUsername.set(this.profile().username);
        this.saveError.set('');
        this.isEditingUsername.set(true);
    }

    saveUsername(): void {
        const name = this.editUsername().trim();
        if (name.length < 3) return;

        this.isSaving.set(true);
        this.saveError.set('');

        this.http.patch<any>(
            `${this.API}/users/me`,
            { username: name },
            { headers: this.getHeaders() }
        ).subscribe({
            next: (data) => {
                // If the username changed, the backend issues a fresh token.
                // We must replace the stored token or all future requests will 401.
                if (data.token) {
                    localStorage.setItem('bg_token', data.token);
                }
                this.authService.setUsername(data.username);
                const level = data.lvl ?? this.profile().level;
                this.profile.update(p => ({
                    ...p,
                    username: data.username,
                    level,
                    xp: data.currentXp ?? p.xp,
                    xpRequired: level * 100,
                    role: getRoleForLevel(level),
                }));
                this.isEditingUsername.set(false);
                this.isSaving.set(false);
            },
            error: (err) => {
                this.saveError.set(err.error?.message ?? 'Username already taken');
                this.isSaving.set(false);
            }
        });
    }

    cancelEdit(): void {
        this.isEditingUsername.set(false);
        this.saveError.set('');
    }

    onUsernameKeydown(event: KeyboardEvent): void {
        if (event.key === 'Enter') this.saveUsername();
        if (event.key === 'Escape') this.cancelEdit();
    }
}