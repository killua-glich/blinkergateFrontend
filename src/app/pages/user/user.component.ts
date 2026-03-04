import {Component, computed, inject, signal} from '@angular/core';
import {HeaderComponent} from "../../components/header/header.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AuthService} from "../../services/auth.service";

export interface UserProfile {
    username: string;
    xp: number;
    xpRequired: number;
    level: number;
    role: string;
    avatarUrl?: string;
}

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
    60: 'Bob the builder', //Patrick

    100: 'Highest in the room', //Patrick
    200: 'kafer lesh', //Patrick
    300: 'Faded af',
    400: 'Stone',

    500: 'Bob Marley',
    700: 'Wizz Khalifa',
    900: 'Snoop Dogg',

    1000: 'The smoke itself' // Jonas
};

function getRoleForLevel(level: number): string {
    const thresholds = Object.keys(LEVEL_ROLES).map(Number).sort((a, b) => b - a);
    for (const t of thresholds) {
        if (level >= t) return LEVEL_ROLES[t];
    }
    return 'Fresh Blinker';
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
export class UserComponent {
    profile = signal<UserProfile>({
        username: 'Diego6769',
        xp: 60,
        xpRequired: 100,
        level: 10,
        role: 'Novice Blinkerer',
        avatarUrl: undefined,
    });

    isEditingUsername = signal(false);
    editUsername = signal('');
    authService = inject(AuthService)

    xpPercent = computed(() => {
        const p = this.profile();
        return Math.min((p.xp / p.xpRequired) * 100, 100);
    });

    // SVG circle math for the XP ring
    readonly RADIUS = 110;
    readonly STROKE = 8;
    readonly SIZE = (this.RADIUS + this.STROKE) * 2;
    readonly CIRCUMFERENCE = 2 * Math.PI * this.RADIUS;

    dashOffset = computed(() => {
        return this.CIRCUMFERENCE * (1 - this.xpPercent() / 100);
    });


    ngOnInit(): void {
        const username = this.authService.getUsername();
        if (username) {
            this.profile.update(p => ({ ...p, username }));
        }
    }

    startEdit(): void {
        this.editUsername.set(this.profile().username);
        this.isEditingUsername.set(true);
    }

    saveUsername(): void {
        const name = this.editUsername().trim();
        if (name.length >= 3) {
            this.profile.update(p => ({ ...p, username: name }));
        }
        this.isEditingUsername.set(false);
    }

    cancelEdit(): void {
        this.isEditingUsername.set(false);
    }

    onUsernameKeydown(event: KeyboardEvent): void {
        if (event.key === 'Enter') this.saveUsername();
        if (event.key === 'Escape') this.cancelEdit();
    }
}
