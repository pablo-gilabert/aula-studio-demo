/** DemoContext view: role-aware academic workflows and UI presentation. */
import { t } from '../i18n/Translations';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { DemoData, Role, User } from '../Types';
import { createSeed } from '../data/Seed';
import { isoDay, uid } from '../lib/Utils';
const DATA_KEY = 'aula-studio-demo:v2:data';
const USER_KEY = 'aula-studio-demo:v2:auth';
/* Restore fictional records from the current tab, or start with the bundled dataset. */
function readData(): DemoData {
    try {
        const value = sessionStorage.getItem(DATA_KEY);
        if (value) {
            const parsed: DemoData = JSON.parse(value);
            if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.students) && Array.isArray(parsed.groups))
                return parsed;
        }
    }
    catch { /* Storage disabled: demo remains in memory until refresh. */ }
    return createSeed();
}
function readAuth(): string | null {
    try {
        return sessionStorage.getItem(USER_KEY);
    }
    catch {
        return null;
    }
}
interface DemoContextType {
    data: DemoData;
    user: User | null;
    login: (email: string, password: string) => string | null;
    loginAs: (role: Role) => void;
    logout: () => void;
    update: (action: string, updater: (prev: DemoData) => DemoData) => void;
    reset: () => void;
}
const DemoContext = createContext<DemoContextType | null>(null);
export function DemoProvider({ children }: {
    children: ReactNode;
}) {
    const [data, setData] = useState<DemoData>(readData);
    const [authId, setAuthId] = useState<string | null>(readAuth);
    const user = useMemo(() => data.users.find(u => u.id === authId && u.active) ?? null, [data.users, authId]);
    useEffect(() => {
        try {
            sessionStorage.setItem(DATA_KEY, JSON.stringify(data));
        }
        catch { /* Storage disabled or full. */ }
    }, [data]);
    useEffect(() => {
        try {
            if (authId)
                sessionStorage.setItem(USER_KEY, authId);
            else
                sessionStorage.removeItem(USER_KEY);
        }
        catch { /* Ignore. */ }
    }, [authId]);
    // Authenticate against fictional users; this is NOT server-side authentication.
    const login = (email: string, password: string): string | null => {
        const found = data.users.find(u => u.active && u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
        if (!found)
            return 'Correo o contraseña incorrectos, o usuario deshabilitado.';
        setAuthId(found.id);
        return null;
    };
    const loginAs = (role: Role) => {
        const preferred = { admin: 'u-admin', tutor: 'u-tutor', student: 'u-student' }[role];
        const found = data.users.find(u => u.id === preferred && u.active) ?? data.users.find(u => u.role === role && u.active);
        if (found)
            setAuthId(found.id);
    };
    const logout = () => setAuthId(null);
    // Apply a demo-only mutation and append a human-readable audit message.
    const update = (action: string, updater: (prev: DemoData) => DemoData) => {
        if (!user)
            return;
        setData(prev => {
            const next = updater(prev);
            if (next === prev)
                return prev;
            return { ...next, activity: [{ id: uid('ac'), actor: user.name, message: action, date: isoDay() }, ...next.activity].slice(0, 120) };
        });
    };
    // Clear tab-local data and restore the original fixtures.
    const reset = () => {
        setData(createSeed());
        setAuthId(null);
        try {
            sessionStorage.removeItem(DATA_KEY);
            sessionStorage.removeItem(USER_KEY);
        }
        catch { /* Ignore. */ }
    };
    return <DemoContext.Provider value={{ data, user, login, loginAs, logout, update, reset }}>{t(children)}</DemoContext.Provider>;
}
export function useDemo() {
    const ctx = useContext(DemoContext);
    if (!ctx)
        throw new Error('DemoProvider is missing');
    return ctx;
}
