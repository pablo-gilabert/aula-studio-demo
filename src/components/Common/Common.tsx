/** Common view: role-aware academic workflows and UI presentation. */
import { t } from '../../i18n/Translations';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { AlertCircle, Check, ChevronRight, Inbox, X } from 'lucide-react';
import Styles from './Common.module.css';
// Generic panels and page headings keep module layouts consistent.
export function Panel({ title, subtitle, action, children, className = '' }: {
    title?: string;
    subtitle?: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
}) {
    return <section className={`${Styles.panel} ${className}`}>
        {(title || action) && <div className={Styles.panelHead}>
            <div>{title && <h3>{t(title)}</h3>}{subtitle && <p>{t(subtitle)}</p>}</div>{t(action)}</div>}
        {t(children)}
    </section>;
}
export function PageTitle({ kicker, title, description, action }: {
    kicker?: string;
    title: string;
    description?: string;
    action?: ReactNode;
}) {
    return <div className={Styles.pageTitle}>
        <div>{kicker && <p className={Styles.kicker}>{t(kicker)}</p>}<h1>{t(title)}</h1>{description && <p className={Styles.description}>{t(description)}</p>}</div>{action && <div className={Styles.titleActions}>{t(action)}</div>}</div>;
}
export function Pill({ children, tone = 'neutral' }: {
    children: ReactNode;
    tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
}) {
    return <span className={`${Styles.pill} ${Styles[tone]}`}>
        <span className={Styles.pillDot} />{t(children)}</span>;
}
export function Avatar({ name, size = 'normal' }: {
    name: string;
    size?: 'normal' | 'small' | 'large';
}) {
    const parts = name.trim().split(/\s+/);
    const initials = parts.slice(0, 2).map(p => p.charAt(0)).join('').toUpperCase();
    const tone = (name.charCodeAt(0) || 1) % 5;
    return <span className={`${Styles.avatar} ${Styles[size]} ${Styles[`avatar${tone}`]}`} aria-label={t(name)}>{t(initials)}</span>;
}
export function Button({ children, variant = 'primary', type = 'button', onClick, disabled, className = '' }: {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    type?: 'button' | 'submit';
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
}) {
    return <button type={type} onClick={onClick} disabled={disabled} className={`${Styles.button} ${Styles[variant]} ${className}`}>{t(children)}</button>;
}
// Form primitives normalize labels, input states, and select options.
export function TextInput({ label, value, onChange, placeholder = '', type = 'text', required, min, max, step, disabled }: {
    label: string;
    value: string | number;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
    required?: boolean;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
}) {
    return <label className={Styles.field}>
        <span>{t(label)}</span>
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={t(placeholder)}
            required={required}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
        />
    </label>;
}
export function SelectInput({ label, value, onChange, options, disabled, required }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: {
        value: string;
        label: string;
    }[];
    disabled?: boolean;
    required?: boolean;
}) {
    return <label className={Styles.field}>
        <span>{t(label)}</span>
        <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled} required={required}>{options.map(o => <option key={o.value} value={o.value}>{t(o.label)}</option>)}</select>
    </label>;
}
export function TextArea({ label, value, onChange, placeholder }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    return <label className={Styles.field}>
        <span>{t(label)}</span>
        <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} placeholder={t(placeholder)} />
    </label>;
}
export function EmptyState({ title = 'Sin resultados', message = 'Probá modificando los filtros o agregando un registro.' }: {
    title?: string;
    message?: string;
}) {
    return <div className={Styles.empty}>
        <Inbox size={24} />
        <strong>{t(title)}</strong>
        <span>{t(message)}</span>
    </div>;
}
// Dialogs lock background scrolling and support Escape to close.
export function Modal({ title, subtitle, children, onClose, width = 'normal' }: {
    title: string;
    subtitle?: string;
    children: ReactNode;
    onClose: () => void;
    width?: 'normal' | 'wide';
}) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape')
                onClose();
        };
        window.addEventListener('keydown', onKey);
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = previous; };
    }, [onClose]);
    return <div
        className={Styles.overlay}
        onMouseDown={e => {
            if (e.target === e.currentTarget)
                onClose();
        }}
        role="presentation"
    >
        <section
            className={`${Styles.modal} ${width === 'wide' ? Styles.wide : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label={t(title)}
        >
            <header className={Styles.modalHead}>
                <div>
                    <h2>{t(title)}</h2>{subtitle && <p>{t(subtitle)}</p>}</div>
                <button aria-label={t("Cerrar ventana")} type="button" className={Styles.iconButton} onClick={onClose}>
                    <X size={19} />
                </button>
            </header>
            <div className={Styles.modalBody}>{t(children)}</div>
        </section>
    </div>;
}
export function Notice({ children, tone = 'info' }: {
    children: ReactNode;
    tone?: 'info' | 'warning' | 'success';
}) {
    return <div className={`${Styles.notice} ${Styles[`notice${tone}`]}`}>{tone === 'success' ? <Check size={17} /> : <AlertCircle size={17} />}<span>{t(children)}</span>
    </div>;
}
export function RowLink({ text, onClick }: {
    text: string;
    onClick: () => void;
}) {
    return <button className={Styles.rowLink} type="button" onClick={onClick}>{t(text)}<ChevronRight size={16} />
    </button>;
}
