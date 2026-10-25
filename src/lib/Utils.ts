/** Shared presentation utilities for IDs, formatting, and status labels. */
import { getActiveLocale } from '../i18n/Translations';
export const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36)}`;
export const isoDay = (offset = 0): string => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
// Currency and dates respect the currently selected display language.
export const dateLabel = (date: string) => {
    if (!date)
        return '—';
    return new Intl.DateTimeFormat(getActiveLocale() === 'es' ? 'es-AR' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${date.slice(0, 10)}T12:00:00`));
};
export const money = (n: number) => new Intl.NumberFormat(getActiveLocale() === 'es' ? 'es-AR' : 'en-GB', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
export const initials = (name: string) => name.split(' ').slice(0, 2).map((p) => p.charAt(0)).join('').toUpperCase();
export const percent = (n: number, d: number) => d ? Math.round((n / d) * 100) : 0;
export const roleLabel = { admin: 'Administrador', tutor: 'Tutor / docente', student: 'Alumno' } as const;
export const statusLabel = { active: 'Activo', paused: 'Pausado', completed: 'Finalizado' } as const;
