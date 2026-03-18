import {
  Component, Input, Output, EventEmitter,
  OnDestroy, ViewChild, ElementRef, AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef, inject
} from '@angular/core';

@Component({
  selector: 'app-blinker-status',
  standalone: true,
  templateUrl: './blinker-status.component.html',
  styleUrl: './blinker-status.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlinkerStatusComponent implements AfterViewInit, OnDestroy {

  @Input() earned = false;
  @Input() points = 0;
  @Output() redeem = new EventEmitter<void>();

  @ViewChild('smokeCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  fired = false;
  busy = false;

  private ctx!: CanvasRenderingContext2D;
  private particles: Puff[] = [];
  private animId: number | null = null;
  private trickleId: any = null;
  private cdr = inject(ChangeDetectorRef);

  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
  }

  ngOnDestroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    clearInterval(this.trickleId);
  }

  onRedeem() {
    if (this.busy || !this.earned) return;
    this.busy = true;
    this.fired = true;
    this.cdr.markForCheck();

    this.redeem.emit();

    this.spawn(16); this.loop();
    setTimeout(() => { this.spawn(10); this.ensureLoop(); }, 120);
    setTimeout(() => { this.spawn(6);  this.ensureLoop(); }, 280);

    this.trickleId = setInterval(() => {
      if (this.particles.length) { this.spawn(2); this.ensureLoop(); }
    }, 160);

    setTimeout(() => {
      clearInterval(this.trickleId);
      this.fired = false;
      this.busy = false;
      this.cdr.markForCheck();
    }, 2600);
  }

  private spawn(n: number) {
    for (let i = 0; i < n; i++) {
      this.particles.push(new Puff(
          100 + (Math.random() - 0.5) * 24, 120
      ));
    }
  }

  private loop() {
    this.ctx.clearRect(0, 0, 200, 120);
    this.particles = this.particles.filter(p => p.life > 0);
    this.particles.forEach(p => { p.update(); p.draw(this.ctx); });
    this.animId = this.particles.length > 0
        ? requestAnimationFrame(() => this.loop())
        : null;
  }

  private ensureLoop() {
    if (!this.animId) this.loop();
  }
}

class Puff {
  x: number; y: number;
  r: number; targetR: number;
  vx: number; vy: number;
  life = 1;
  decay: number;
  wobble: number;

  constructor(x: number, y: number) {
    this.x = x; this.y = y;
    this.r = 4 + Math.random() * 6;
    this.targetR = 22 + Math.random() * 30;
    this.vx = (Math.random() - 0.5) * 0.6;
    this.vy = -(0.4 + Math.random() * 1);
    this.decay = 0.009 + Math.random() * 0.006;
    this.wobble = Math.random() * Math.PI * 2;
  }

  update() {
    this.wobble += 0.03;
    this.vx += Math.sin(this.wobble) * 0.025;
    this.x += this.vx;
    this.y += this.vy;
    this.r += (this.targetR - this.r) * 0.04;
    this.life -= this.decay;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(232,255,65,${Math.max(0, this.life) * 0.2})`;
    ctx.fill();
  }
}