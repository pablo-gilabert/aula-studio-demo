/** Dashboard view: role-aware academic workflows and UI presentation. */
import { t } from '../../i18n/Translations';
import { ArrowRight, BookOpen, CalendarCheck2, ChevronRight, ClipboardCheck, CreditCard, GraduationCap, Megaphone, Sparkles, TrendingUp, UsersRound, Wallet, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '../../context/DemoContext';
import { courseName, groupName, outstanding, scopedGroupIds } from '../../lib/Permissions';
import { dateLabel, money, percent } from '../../lib/Utils';
import { Avatar, Button, EmptyState, PageTitle, Panel, Pill } from '../../components/Common/Common';
import SharedStyles from '../../styles/PageShared.module.css';
import PageStyles from './Dashboard.module.css';

const Styles = { ...SharedStyles, ...PageStyles };
type IconType = typeof GraduationCap;
function Stat({ Icon, label, value, caption, tone = '' }: {
    Icon: IconType;
    label: string;
    value: string | number;
    caption: string;
    tone?: string;
}) {
    return <div className={Styles.statCard}>
        <div className={Styles.statTop}>
            <span className={Styles.statLabel}>{t(label)}</span>
            <span className={`${Styles.statIcon} ${Styles[tone] ?? ''}`}>
                <Icon size={18} />
            </span>
        </div>
        <div className={Styles.statValue}>{t(value)}</div>
        <div className={Styles.statBottom}>{t(caption)}</div>
    </div>;
}
// Summarize activity and quick actions according to the signed-in role.
export function Dashboard() {
    const { data, user } = useDemo();
    const navigate = useNavigate();
    if (!user)
        return null;
    const groupIds = scopedGroupIds(user, data);
    const relatedEnrollments = data.enrollments.filter(en => groupIds.includes(en.groupId) && en.status === 'active' && (user.role !== 'student' || en.studentId === user.studentId));
    const uniqueStudents = new Set(relatedEnrollments.map(e => e.studentId)).size;
    const currentSessions = data.sessions.filter(s => groupIds.includes(s.groupId)).sort((a, b) => b.date.localeCompare(a.date));
    const attended = data.attendance.filter(a => currentSessions.some(s => s.id === a.sessionId) && (user.role !== 'student' || a.studentId === user.studentId));
    const present = attended.filter(a => a.status === 'present' || a.status === 'justified').length;
    const studentCharges = data.charges.filter(c => c.studentId === user.studentId);
    const pending = studentCharges.reduce((n, c) => n + outstanding(c.id, data), 0);
    const totalPending = data.charges.reduce((n, c) => n + outstanding(c.id, data), 0);
    const visibleAnnouncements = data.announcements.filter(a => a.audience === 'all' || a.audience === (user.role === 'student' ? 'students' : 'tutors') || user.role === 'admin').slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
    const myEnrollments = data.enrollments.filter(en => en.studentId === user.studentId && en.status === 'active');
    const myGrades = data.grades.filter(g => g.studentId === user.studentId);
    const avg = myGrades.length ? (myGrades.reduce((sum, g) => sum + g.score, 0) / myGrades.length).toFixed(1) : '—';
    const greeting = new Date().getHours() < 12 ? 'Buen día' : new Date().getHours() < 19 ? 'Buenas tardes' : 'Buenas noches';
    const isAdmin = user.role === 'admin', isTutor = user.role === 'tutor';
    return <>
        <PageTitle
            kicker={t("SISTEMA DE GESTIÓN ACADÉMICA")}
            title={t("Vista general")}
            description={t(`Bienvenido a tu espacio de trabajo, ${user.name.split(' ')[0]}. Este es un entorno interactivo con información ficticia.`)}
        />
        <div className={Styles.hero}>
            <div className={Styles.heroCopy}>
                <div className={Styles.heroEyebrow}>
                    <Sparkles size={14} /> {t(" UNA NUEVA FORMA DE ORGANIZAR")}</div>
                <h2>{t(greeting)}{t(", ")}{t(user.name.split(' ')[0])}{t(". ")}<br />{t(isAdmin ? 'Todo lo importante, en un lugar.' : isTutor ? 'Tu aula, siempre organizada.' : 'Tu progreso comienza acá.')}</h2>
                <p>{t(isAdmin ? 'Consultá el estado de alumnos, cursos y administración en tiempo real dentro de esta demostración.' : isTutor ? 'Revisá tus comisiones, registrá asistencia y acompañá el progreso de tus alumnos.' : 'Consultá tus cursos, asistencias, calificaciones y cuotas desde un mismo lugar.')}</p>
            </div>
            <div className={Styles.heroMark}>{t("A.")}</div>
        </div>
        <div className="statsGrid">
            {isAdmin ? <>
                <Stat
                    Icon={UsersRound}
                    label={t("Alumnos activos")}
                    value={data.students.filter(s => s.status === 'active').length}
                    caption={t("En el registro académico")}
                />
                <Stat
                    Icon={BookOpen}
                    label={t("Cursos disponibles")}
                    value={data.courses.filter(c => c.active).length}
                    caption={t(`${data.groups.length} comisiones organizadas`)}
                    tone="bronze"
                />
                <Stat
                    Icon={CalendarCheck2}
                    label={t("Asistencia registrada")}
                    value={`${percent(present, attended.length)}%`}
                    caption={t(`${currentSessions.length} clases en el sistema`)}
                    tone="blue"
                />
                <Stat
                    Icon={Wallet}
                    label={t("Saldos pendientes")}
                    value={money(totalPending)}
                    caption={t("Cuotas ficticias sin cancelar")}
                    tone="pink"
                />
            </> : isTutor ? <>
                <Stat Icon={UsersRound} label={t("Mis alumnos")} value={uniqueStudents} caption={t("En las comisiones asignadas")} />
                <Stat Icon={BookOpen} label={t("Mis comisiones")} value={groupIds.length} caption={t("Grupos a tu cargo")} tone="bronze" />
                <Stat
                    Icon={CalendarCheck2}
                    label={t("Asistencia positiva")}
                    value={`${percent(present, attended.length)}%`}
                    caption={t("Incluye justificadas")}
                    tone="blue"
                />
                <Stat
                    Icon={ClipboardCheck}
                    label={t("Evaluaciones")}
                    value={data.evaluations.filter(e => groupIds.includes(e.groupId)).length}
                    caption={t("En tus comisiones")}
                    tone="pink"
                />
            </> : <>
                <Stat Icon={GraduationCap} label={t("Cursos activos")} value={myEnrollments.length} caption={t("Formaciones en curso")} />
                <Stat
                    Icon={CalendarCheck2}
                    label={t("Mi asistencia")}
                    value={`${percent(present, attended.length)}%`}
                    caption={t("Incluye faltas justificadas")}
                    tone="blue"
                />
                <Stat Icon={TrendingUp} label={t("Promedio")} value={avg} caption={t("Notas publicadas")} tone="bronze" />
                <Stat
                    Icon={CreditCard}
                    label={t("Saldo pendiente")}
                    value={money(pending)}
                    caption={t("Estado de mis cuotas")}
                    tone="pink"
                />
            </>}
        </div>
        <div className="sectionSpacer" />
        <div className="sectionGrid">
            <Panel
                title={t(isAdmin ? 'Actividad reciente' : isTutor ? 'Mis últimas clases' : 'Mis formaciones')}
                subtitle={t(isAdmin ? 'Movimientos de esta demostración' : isTutor ? 'Accedé al registro de asistencia' : 'Tu recorrido académico hasta ahora')}
                action={<Button
                    variant="ghost"
                    onClick={() => navigate(isAdmin ? '/app/students' : isTutor ? '/app/attendance' : '/app/enrollments')}
                >{t("Ver más ")}<ChevronRight size={15} />
                </Button>}
            >
                {isAdmin ? <div className={Styles.linkList}>{data.activity.slice(0, 5).map(ac => <div className={Styles.item} key={ac.id}>
                    <Avatar name={ac.actor} />
                    <div className={Styles.itemMain}>
                        <strong>{t(ac.actor)}</strong>
                        <small>{t(ac.message)}</small>
                    </div>
                    <span className={Styles.itemAside}>{t(dateLabel(ac.date))}</span>
                </div>)}</div>
                    : isTutor ? <div className={Styles.linkList}>{currentSessions.slice(0, 5).map(s => <div className={Styles.item} key={s.id}>
                        <div className={Styles.itemIcon}>
                            <BookOpen size={17} />
                        </div>
                        <div className={Styles.itemMain}>
                            <strong>{t(s.topic)}</strong>
                            <small>{t(groupName(s.groupId, data))}</small>
                        </div>
                        <span className={Styles.itemAside}>{t(dateLabel(s.date))}</span>
                    </div>)}{!currentSessions.length && <EmptyState />}</div>
                        : <div className={Styles.linkList}>{myEnrollments.map(en => <div className={Styles.item} key={en.id}>
                            <div className={Styles.itemIcon}>
                                <GraduationCap size={18} />
                            </div>
                            <div className={Styles.itemMain}>
                                <strong>{t(courseName(data.groups.find(g => g.id === en.groupId)?.courseId ?? '', data))}</strong>
                                <small>{t(groupName(en.groupId, data))}</small>
                            </div>
                            <Pill tone="success">{t("En curso")}</Pill>
                        </div>)}{!myEnrollments.length && <EmptyState />}</div>}
            </Panel>
            <Panel
                title={t("Comunicados")}
                subtitle={t("Novedades y avisos del instituto")}
                action={<Button variant="ghost" onClick={() => navigate('/app/announcements')}>{t("Ver todos ")}<ChevronRight size={15} />
                </Button>}
            >
                <div className={Styles.linkList}>{visibleAnnouncements.map(ann => <div className={Styles.item} key={ann.id}>
                    <div className={Styles.itemIcon}>
                        <Megaphone size={17} />
                    </div>
                    <div className={Styles.itemMain}>
                        <strong>{t(ann.title)}</strong>
                        <small>{t(ann.body)}</small>
                    </div>
                </div>)}{!visibleAnnouncements.length && <EmptyState />}</div>
            </Panel>
        </div>
        <div className="sectionSpacer" />
        <div className="sectionGrid">
            <Panel title={t("Accesos rápidos")} subtitle={t("Continuá con tus tareas de forma sencilla")}>
                <div className={Styles.simpleList}>{(isAdmin ? [
                    { label: 'Gestionar alumnos e inscripciones', path: '/app/students', Icon: UsersRound }, { label: 'Consultar cuotas y pagos', path: '/app/finance', Icon: CreditCard }, { label: 'Gestionar cursos y comisiones', path: '/app/courses', Icon: BookOpen }
                ] : isTutor ? [
                    { label: 'Tomar asistencia', path: '/app/attendance', Icon: CalendarCheck2 }, { label: 'Cargar calificaciones', path: '/app/evaluations', Icon: ClipboardCheck }, { label: 'Ver mis alumnos', path: '/app/students', Icon: UsersRound }
                ] : [
                    { label: 'Ver mis asistencias', path: '/app/attendance', Icon: CalendarCheck2 }, { label: 'Consultar calificaciones', path: '/app/evaluations', Icon: ClipboardCheck }, { label: 'Consultar mis cuotas', path: '/app/finance', Icon: CreditCard }
                ]).map(o => <button className={Styles.quickAction} type="button" key={o.path} onClick={() => navigate(o.path)}>
                    <span>
                        <o.Icon size={18} />{t(o.label)}</span>
                    <ArrowRight size={16} />
                </button>)}</div>
            </Panel>
            <Panel
                title={t("Resumen de actividad")}
                subtitle={t(isAdmin ? 'Asistencia de las últimas clases' : 'Información de tu perfil')}
            >
                {isAdmin || isTutor ? <>
                    <div className={Styles.metricBig}>{t(percent(present, attended.length))}{t("%")}</div>
                    <div className={Styles.metricDetail}>{t("Tasa de asistencia (justificadas incluidas)")}</div>
                    <div className="sectionSpacer" />
                    <div className={Styles.splitBar}>
                        <span style={{ width: `${percent(attended.filter(a => a.status === 'present').length, attended.length)}%` }} />
                        <span style={{ width: `${percent(attended.filter(a => a.status === 'justified').length, attended.length)}%` }} />
                    </div>
                    <div className="sectionSpacer" />
                    <div className={Styles.smallInfo}>
                        <AlertTriangle size={14} /> {t(" Valores calculados con datos ficticios.")}</div></>
                    : <>
                        <div className={Styles.profileTop}>
                            <Avatar name={user.name} size="large" />
                            <div>
                                <h3>{t(user.name)}</h3>
                                <p className="subText">{t("Perfil de alumno · Información personal")}</p>
                            </div>
                        </div>
                        <div className="sectionSpacer" />
                        <div className={Styles.mutedBox}>{t("Accedé a tus cursos, calificaciones y estado de pagos desde el menú lateral. Los cambios de otros perfiles de prueba también se reflejan acá.")}</div></>}
            </Panel>
        </div>
    </>;
}
