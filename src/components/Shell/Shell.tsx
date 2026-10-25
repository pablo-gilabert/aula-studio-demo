/** Application shell: permission-aware navigation, user menu and display preferences. */
import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, CalendarCheck2, BarChart3, ChevronDown, CreditCard, GraduationCap, LayoutDashboard, LogOut, Megaphone, Menu, RefreshCcw, Shield, Users, UsersRound, X, NotebookTabs, ClipboardCheck, UserRound } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { canSee, type Section } from '../../lib/Permissions';
import { roleLabel } from '../../lib/Utils';
import { t } from '../../i18n/Translations';
import { Avatar, Modal, Button } from '../Common/Common';
import { DisplayControls } from '../DisplayControls/DisplayControls';
import Styles from './Shell.module.css';
const NAV: {
    section: Section;
    label: string;
    studentLabel?: string;
    Icon: typeof LayoutDashboard;
}[] = [
        { section: 'dashboard', label: 'Vista general', Icon: LayoutDashboard },
        { section: 'students', label: 'Alumnos', Icon: UsersRound },
        { section: 'courses', label: 'Cursos y materias', Icon: BookOpen },
        { section: 'enrollments', label: 'Inscripciones', studentLabel: 'Mis cursos', Icon: NotebookTabs },
        { section: 'attendance', label: 'Asistencias', studentLabel: 'Mi asistencia', Icon: CalendarCheck2 },
        { section: 'evaluations', label: 'Evaluaciones', studentLabel: 'Mis calificaciones', Icon: ClipboardCheck },
        { section: 'finance', label: 'Cuotas y pagos', studentLabel: 'Mis cuotas', Icon: CreditCard },
        { section: 'reports', label: 'Reportes de dirección', Icon: BarChart3 },
        { section: 'announcements', label: 'Comunicados', Icon: Megaphone },
        { section: 'users', label: 'Usuarios y accesos', Icon: Users },
        { section: 'profile', label: 'Mi perfil', Icon: UserRound },
    ];
export const PAGE_NAMES: Record<Section, string> = {
    dashboard: 'Vista general', students: 'Alumnos', courses: 'Cursos y materias', enrollments: 'Inscripciones', attendance: 'Asistencias', evaluations: 'Evaluaciones', finance: 'Cuotas y pagos', reports: 'Reportes de dirección', announcements: 'Comunicados', users: 'Usuarios y accesos', profile: 'Mi perfil'
};
export function Shell() {
    const { user, logout, reset } = useDemo();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [showReset, setShowReset] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    if (!user)
        return null;
    const section = (location.pathname.split('/')[2] ?? 'dashboard') as Section;
    const activeTitle = NAV.find(n => n.section === section)?.[user.role === 'student' ? 'studentLabel' : 'label'] ?? PAGE_NAMES[section] ?? 'Plataforma';
    const leave = () => { logout(); navigate('/login'); };
    return <div className={Styles.layout}>
        {menuOpen && <button type="button" className={Styles.scrim} onClick={() => setMenuOpen(false)} aria-label={t("Cerrar menú")} />}
        <aside className={`${Styles.sidebar} ${menuOpen ? Styles.sidebarOpen : ''}`}>
            <div className={Styles.brandArea}>
                <div className={Styles.brandIcon}>
                    <GraduationCap size={24} strokeWidth={1.7} />
                </div>
                <div className={Styles.brandText}>
                    <strong>{t("AULA")}<span>{t("STUDIO.")}</span>
                    </strong>
                    <small>{t("GESTIÓN ACADÉMICA")}</small>
                </div>
                <button type="button" className={Styles.mobileClose} onClick={() => setMenuOpen(false)} aria-label={t("Cerrar menú")}>
                    <X size={19} />
                </button>
            </div>
            <div className={Styles.sidebarIntro}>
                <span className={Styles.introIcon}>
                    <Shield size={14} />
                </span>
                <div>
                    <strong>{t("Entorno de demostración")}</strong>
                    <small>{t("Información 100% ficticia")}</small>
                </div>
            </div>
            <div className={Styles.navHeading}>{t("ESPACIO DE TRABAJO")}</div>
            <nav className={Styles.nav} aria-label={t("Navegación principal")}>
                {NAV.filter(n => canSee(user.role, n.section)).map(({ section: sec, label, studentLabel, Icon }) => <NavLink
                    to={`/app/${sec}`}
                    key={sec}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) => `${Styles.navItem} ${isActive ? Styles.navActive : ''}`}
                >
                    <Icon size={17} strokeWidth={1.8} />
                    <span>{t(user.role === 'student' && studentLabel ? studentLabel : label)}</span>{sec === 'announcements' && <span className={Styles.navBullet} />}</NavLink>)}
            </nav>
            <div className={Styles.sidebarBottom}>
                <button type="button" className={Styles.logout} onClick={leave}>
                    <LogOut size={16} /> {t(" Cerrar sesión")}</button>
            </div>
        </aside>
        <div className={Styles.mainArea}>
            <header className={Styles.topbar}>
                <div className={Styles.breadcrumb}>
                    <button type="button" className={Styles.menuToggle} onClick={() => setMenuOpen(true)} aria-label={t("Abrir menú")}>
                        <Menu size={20} />
                    </button>
                    <span>{t("Panel académico")}</span>
                    <span className={Styles.slash}>{t("/")}</span>
                    <strong>{t(activeTitle)}</strong>
                </div>
                <div className={Styles.topRight}>
                    <DisplayControls />
                    <button type="button" className={Styles.switchRole} onClick={leave}>
                        <LogOut size={14} />
                        <span>{t('Probá otro perfil')}</span>
                    </button>
                    <span className={Styles.liveTag}>
                        <span /> {t(" Demo activa")}</span>
                    <div className={Styles.profileWrap}>
                        <button type="button" className={Styles.profile} onClick={() => setProfileOpen(v => !v)} aria-expanded={profileOpen}>
                            <Avatar name={user.name} size="small" />
                            <span className={Styles.profileDetails}>
                                <strong>{t(user.name)}</strong>
                                <small>{t(roleLabel[user.role])}</small>
                            </span>
                            <ChevronDown size={15} />
                        </button>{profileOpen && <div className={Styles.dropdown}>
                            <div className={Styles.dropdownIntro}>{t(user.email)}<br />
                                <strong>{t(roleLabel[user.role])}</strong>
                            </div>
                            <button type="button" onClick={() => { setProfileOpen(false); leave(); }}>
                                <LogOut size={15} /> {t(" Cambiar de perfil")}</button>{user.role === 'admin' && <button type="button" onClick={() => { setProfileOpen(false); setShowReset(true); }}>
                                    <RefreshCcw size={15} /> {t(" Reiniciar demo")}</button>}</div>}</div>
                </div>
            </header>
            <main className={Styles.content}>
                <Outlet />
                <footer className={Styles.footer}>
                    <span>{t("© ")}{t(new Date().getFullYear())} {t(" Aula Studio · Prototipo no oficial")}</span>
                    <span>{t("Los cambios se conservan durante esta sesión del navegador.")}</span>
                </footer>
            </main>
        </div>
        {showReset && <Modal
            title={t("Reiniciar la demostración")}
            subtitle={t("Esta acción restaurará todos los datos ficticios originales.")}
            onClose={() => setShowReset(false)}
        >
            <p className={Styles.resetText}>{t("Se descartarán las modificaciones, alumnos, notas y pagos que hayas agregado en esta pestaña. También se cerrará la sesión actual.")}</p>
            <div className="formActions">
                <Button variant="secondary" onClick={() => setShowReset(false)}>{t("Cancelar")}</Button>
                <Button variant="danger" onClick={() => { setShowReset(false); reset(); navigate('/login'); }}>
                    <RefreshCcw size={15} /> {t(" Restaurar datos")}</Button>
            </div>
        </Modal>}
    </div>;
}
