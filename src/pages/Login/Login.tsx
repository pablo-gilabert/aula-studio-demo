/**
 * Public entry screen for the academic demo.
 * Visitors can sign in with credentials or instantly preview any permission tier.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpenText, Eye, EyeOff, GraduationCap, LockKeyhole, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { DisplayControls } from '../../components/DisplayControls/DisplayControls';
import { useDemo } from '../../context/DemoContext';
import { t } from '../../i18n/Translations';
import type { Role } from '../../Types';
import Styles from './Login.module.css';
// The accounts are seeded locally; one click is enough to explore each role.
const DemoAccounts: {
    role: Role;
    title: string;
    description: string;
    Icon: typeof GraduationCap;
    email: string;
}[] = [
        { role: 'student', title: 'Alumno', description: 'Materias, asistencia, notas y cuotas.', Icon: GraduationCap, email: 'alumno@demo.academia' },
        { role: 'tutor', title: 'Tutor / docente', description: 'Comisiones, lista de asistencia y notas.', Icon: BookOpenText, email: 'tutor@demo.academia' },
        { role: 'admin', title: 'Administrador', description: 'Gestión integral y control académico.', Icon: ShieldCheck, email: 'admin@demo.academia' },
    ];
export function Login() {
    const { login, loginAs } = useDemo();
    const navigate = useNavigate();
    const [email, setEmail] = useState('admin@demo.academia');
    const [password, setPassword] = useState('Demo2026!');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [error, setError] = useState('');
    // Both entry methods use the same session-scoped demo state.
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const message = login(email, password);
        if (message)
            setError(message);
        else
            navigate('/app/dashboard');
    };
    const openRole = (role: Role) => {
        loginAs(role);
        navigate('/app/dashboard');
    };
    return <div className={Styles.page}>
        <aside className={Styles.story}>
            <div className={Styles.storyContent}>
                <div className={Styles.logo}>
                    <span className={Styles.logoIcon}>
                        <GraduationCap size={24} />
                    </span>
                    <span>AULA<span className={Styles.logoAccent}>STUDIO.</span>
                    </span>
                </div>
                <div className={Styles.storyMain}>
                    <div className={Styles.eyebrow}>
                        <Sparkles size={13} /> {t('LA EDUCACIÓN, MEJOR ORGANIZADA')}</div>
                    <h1>{t('Una academia.')}<br />
                        <em>{t('Todo conectado.')}</em>
                    </h1>
                    <p>{t('La gestión académica y administrativa en una sola plataforma. Explorá cómo sería el día a día desde cada rol.')}</p>
                    <div className={Styles.storyTiles}>
                        <div>
                            <span>
                                <Users size={19} />
                            </span>
                            <strong>{t('Alumnos')}</strong>
                            <small>{t('Seguimiento centralizado')}</small>
                        </div>
                        <div>
                            <span>
                                <BookOpenText size={19} />
                            </span>
                            <strong>{t('Docentes')}</strong>
                            <small>{t('Gestión simple de clases')}</small>
                        </div>
                        <div>
                            <span>
                                <ShieldCheck size={19} />
                            </span>
                            <strong>{t('Dirección')}</strong>
                            <small>{t('Visión general y control')}</small>
                        </div>
                    </div>
                </div>
                <div className={Styles.storyFooter}>
                    <span className={Styles.storyDash} />{t('DEMOSTRACIÓN INTERACTIVA · PROYECTO NO OFICIAL')}</div>
            </div>
            <div className={Styles.decorOne} />
            <div className={Styles.decorTwo} />
            <div className={Styles.decorThree} />
        </aside>

        <main className={Styles.loginArea}>
            <div className={Styles.loginTop}>
                <span className={Styles.tag}>{t('PROTOTIPO FUNCIONAL')}</span>
                <span className={Styles.dot} />
                <DisplayControls />
            </div>
            <div className={Styles.formWrap}>
                <div className={Styles.welcomeIcon}>
                    <LockKeyhole size={20} />
                </div>
                <h2>{t('Tu espacio de trabajo,')}<br />{t('a un clic.')}</h2>
                <p className={Styles.intro}>{t('Ingresá con una cuenta de prueba o elegí un perfil para explorar todas las funcionalidades.')}</p>
                <form className={Styles.form} onSubmit={handleSubmit}>
                    <label>{t('Correo electrónico')}
                        <input
                            autoComplete="username"
                            type="email"
                            required
                            value={email}
                            onChange={event => { setEmail(event.target.value); setError(''); }}
                            placeholder="admin@demo.academia"
                        />
                    </label>
                    <label>{t('Contraseña')}
                        <div className={Styles.passwordWrap}>
                            <input
                                autoComplete="current-password"
                                type={isPasswordVisible ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={event => { setPassword(event.target.value); setError(''); }}
                            />
                            <button
                                type="button"
                                aria-label={t(isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña')}
                                onClick={() => setIsPasswordVisible(value => !value)}
                            >
                                {isPasswordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
                            </button>
                        </div>
                    </label>
                    {error && <p role="alert" className={Styles.error}>{t(error)}</p>}
                    <button type="submit" className={Styles.loginButton}>{t('Ingresar al sistema')} <ArrowRight size={17} />
                    </button>
                </form>

                {/* Public credentials make the three permission tiers easy to discover. */}
                <div className={Styles.divider}>
                    <span />{t('Las tres cuentas de demostración')}<span />
                </div>
                <p className={Styles.credentialsNote}>{t('Contraseña de ejemplo')}: <strong>Demo2026!</strong>
                </p>
                <div className={Styles.demoRoles}>
                    {DemoAccounts.map(({ role, title, description, Icon, email: accountEmail }) => <button
                        type="button"
                        key={role}
                        className={Styles.demoRole}
                        onClick={() => openRole(role)}
                        aria-label={`${t('Entrar como')} ${t(title)}`}
                    >
                        <span className={Styles.roleIcon}>
                            <Icon size={18} />
                        </span>
                        <span className={Styles.demoRoleText}>
                            <strong>{t(title)}</strong>
                            <small>{accountEmail}</small>
                            <small className={Styles.roleDescription}>{t(description)}</small>
                        </span>
                        <ArrowRight size={16} className={Styles.roleArrow} />
                    </button>)}
                </div>
            </div>
            <div className={Styles.loginFooter}>{t('Todos los datos son ficticios. Los cambios se guardan solo durante la sesión de esta pestaña y se pueden reiniciar. No ingresar datos personales reales.')}</div>
        </main>
    </div>;
}
