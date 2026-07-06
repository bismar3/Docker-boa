import { Injectable } from '@angular/core';

export type ThemeColor = 'blue' | 'orange' | 'green';
export type ThemeMode = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private colorKey = 'boa_theme_color';
  private modeKey = 'boa_theme_mode';

  color: ThemeColor = (localStorage.getItem(this.colorKey) as ThemeColor) || 'blue';
  mode: ThemeMode = (localStorage.getItem(this.modeKey) as ThemeMode) || 'dark';

  setColor(color: ThemeColor): void {
    this.color = color;
    localStorage.setItem(this.colorKey, color);
    this.applyTheme();
  }

  setMode(mode: ThemeMode): void {
    this.mode = mode;
    localStorage.setItem(this.modeKey, mode);
    this.applyTheme();
  }

  toggleMode(): void {
    this.setMode(this.mode === 'dark' ? 'light' : 'dark');
  }

  applyTheme(): void {
    const root = document.getElementById('theme-root');
    if (!root) return;

    const filtros: string[] = [];

    switch (this.color) {
      case 'orange':
        filtros.push('hue-rotate(180deg)', 'saturate(1.3)');
        break;
      case 'green':
        filtros.push('hue-rotate(90deg)', 'saturate(1.2)');
        break;
    }

    if (this.mode === 'light') {
      filtros.push('invert(0.92)', 'hue-rotate(180deg)', 'contrast(1.05)');
    }

    root.style.filter = filtros.length > 0 ? filtros.join(' ') : 'none';
  }
}