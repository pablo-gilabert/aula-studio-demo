/** Attendance view: role-aware academic workflows and UI presentation. */
import { t } from '../../i18n/Translations';
import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck2, CheckCircle2, Plus } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { canTeachGroup, courseName, groupName, scopedGroupIds, studentName } from '../../lib/Permissions';
import { dateLabel, isoDay, percent, uid } from '../../lib/Utils';
import type { AttendanceStatus, ClassSession } from '../../Types';
import { Avatar, Button, EmptyState, Modal, PageTitle, Panel, Pill, SelectInput, TextInput } from '../../components/Common/Common';
import Styles from '../../styles/PageShared.module.css';
const labels: Record<AttendanceStatus, string> = { present: 'Presente', absent: 'Ausente', justified: 'Justificada' };
const selectStatuses = [{ value: 'present', label: 'Presente' }, { value: 'absent', label: 'Ausente' }, { value: 'justified', label: 'Justificada' }];
// Capture session attendance for the groups assigned to the current tutor.
export function Attendance() {
    const { data, user, update } = useDemo();
    const [groupId, setGroupId] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [draft, setDraft] = useState<Record<string, AttendanceStatus>>({});
    const [success, setSuccess] = useState(false);
    const [newOpen, setNewOpen] = useState(false);
    const [topic, setTopic] = useState('');
    const [sessionDate, setSessionDate] = useState(isoDay());
    const [subjectId, setSubjectId] = useState('');
    const ids = useMemo(() => user ? scopedGroupIds(user, data) : [], [user, data]);
    const activeGroup = ids.includes(groupId) ? groupId : (ids[0] ?? '');
    const sessions = data.sessions.filter(s => s.groupId === activeGroup).slice().sort((a, b) => b.date.localeCompare(a.date));
    const activeSession = sessions.find(s => s.id === sessionId) ?? sessions[0];
    const availableSubjects = data.subjects.filter(s => s.courseId === data.groups.find(g => g.id === activeGroup)?.courseId);
    const student = user?.role === 'student';
    const enrollees = data.enrollments.filter(e => e.groupId === activeGroup && e.status !== 'completed').map(e => data.students.find(s => s.id === e.studentId)).filter((s): s is NonNullable<typeof s> => !!s);
    useEffect(() => {
        if (!activeSession) {
            setDraft({});
            return;
        }
        const rows: Record<string, AttendanceStatus> = {};
        enrollees.forEach(s => { rows[s.id] = data.attendance.find(a => a.sessionId === activeSession.id && a.studentId === s.id)?.status ?? 'present'; });
        setDraft(rows); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSession?.id, data.attendance, data.enrollments]);
    if (!user)
        return null;
    const canEdit = !student && canTeachGroup(user, activeGroup, data);
    const mine = data.attendance.filter(a => a.studentId === user.studentId && data.sessions.some(s => s.id === a.sessionId));
    const mySessions = data.sessions.filter(s => data.enrollments.some(e => e.studentId === user.studentId && e.groupId === s.groupId));
    const myResults = mine.filter(a => mySessions.some(s => s.id === a.sessionId));
    const save = () => {
        if (!activeSession || !canEdit)
            return;
        update('Actualizó el registro de asistencia', prev => {
            const keep = prev.attendance.filter(a => !(a.sessionId === activeSession.id && enrollees.some(s => s.id === a.studentId)));
            const rows = enrollees.map(s => ({ id: uid('attendance'), sessionId: activeSession.id, studentId: s.id, status: draft[s.id] ?? 'present' }));
            return { ...prev, attendance: [...keep, ...rows] };
        });
        setSuccess(true);
    };
    const createClass = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canEdit || !topic.trim() || !activeGroup)
            return;
        const courseSubject = data.subjects.find(s => s.id === subjectId && s.courseId === data.groups.find(g => g.id === activeGroup)?.courseId) ?? availableSubjects[0];
        if (!courseSubject)
            return;
        const item: ClassSession = { id: uid('class'), groupId: activeGroup, subjectId: courseSubject.id, date: sessionDate, topic: topic.trim() };
        update('Agregó una clase al calendario', prev => ({ ...prev, sessions: [...prev.sessions, item] }));
        setSessionId(item.id);
        setNewOpen(false);
        setTopic('');
    };
    if (student)
        return <>
            <PageTitle
                kicker={t("MI ACTIVIDAD ACADÉMICA")}
                title={t("Mi asistencia")}
                description={t("Consultá tu historial de clases y los registros de asistencia que cargaron tus docentes.")}
            />
            <div className="statsGrid">
                <div className={Styles.statCard}>
                    <div className={Styles.statLabel}>{t("Asistencia positiva")}</div>
                    <div className={Styles.statValue}>{t(percent(myResults.filter(a => a.status !== 'absent').length, myResults.length))}{t("%")}</div>
                    <span className="subText">{t("Incluye faltas justificadas")}</span>
                </div>
                <div className={Styles.statCard}>
                    <div className={Styles.statLabel}>{t("Clases registradas")}</div>
                    <div className={Styles.statValue}>{t(myResults.length)}</div>
                    <span className="subText">{t("En tus formaciones")}</span>
                </div>
                <div className={Styles.statCard}>
                    <div className={Styles.statLabel}>{t("Presentes")}</div>
                    <div className={Styles.statValue}>{t(myResults.filter(a => a.status === 'present').length)}</div>
                    <span className="subText">{t("Clases asistidas")}</span>
                </div>
                <div className={Styles.statCard}>
                    <div className={Styles.statLabel}>{t("Ausencias")}</div>
                    <div className={Styles.statValue}>{t(myResults.filter(a => a.status === 'absent').length)}</div>
                    <span className="subText">{t("Faltas registradas")}</span>
                </div>
            </div>
            <div className="sectionSpacer" />
            <Panel title={t("Historial de asistencia")}>
                <div className="tableWrap">
                    <table className="dataTable">
                        <thead>
                            <tr>
                                <th>{t("Fecha")}</th>
                                <th>{t("Curso y comisión")}</th>
                                <th>{t("Clase")}</th>
                                <th>{t("Estado")}</th>
                            </tr>
                        </thead>
                        <tbody>{myResults.slice().sort((a, b) => (data.sessions.find(s => s.id === b.sessionId)?.date ?? '').localeCompare(data.sessions.find(s => s.id === a.sessionId)?.date ?? '')).map(a => {
                            const s = data.sessions.find(s => s.id === a.sessionId)!; return <tr key={a.id}>
                                <td>{t(dateLabel(s.date))}</td>
                                <td>
                                    <strong>{t(groupName(s.groupId, data))}</strong>
                                </td>
                                <td>{t(s.topic)}</td>
                                <td>
                                    <Pill tone={a.status === 'present' ? 'success' : a.status === 'absent' ? 'danger' : 'warning'}>{t(labels[a.status])}</Pill>
                                </td>
                            </tr>;
                        })}</tbody>
                    </table>{!myResults.length && <EmptyState title={t("Todavía no hay clases registradas")} />}</div>
            </Panel></>;
    return <>
        <PageTitle
            kicker={t("SEGUIMIENTO ACADÉMICO")}
            title={t("Control de asistencia")}
            description={t("Seleccioná una comisión y una clase para registrar o corregir la asistencia de tus alumnos.")}
            action={<Button
                onClick={() => { setSubjectId(availableSubjects[0]?.id ?? ''); setNewOpen(true); }}
                disabled={!canEdit || !availableSubjects.length}
            >
                <Plus size={16} /> {t(" Nueva clase")}</Button>}
        />
        <Panel title={t("Tomar asistencia")} subtitle={t("Los cambios quedan guardados en esta sesión de demostración.")}>
            <div className="formGrid" style={{ marginBottom: 22 }}>
                <SelectInput
                    label={t("Comisión")}
                    value={activeGroup}
                    onChange={v => { setGroupId(v); setSessionId(''); setSuccess(false); }}
                    options={ids.map(id => ({ value: id, label: groupName(id, data) }))}
                />
                <SelectInput
                    label={t("Clase registrada")}
                    value={activeSession?.id ?? ''}
                    onChange={v => { setSessionId(v); setSuccess(false); }}
                    options={sessions.length ? sessions.map(s => ({ value: s.id, label: `${dateLabel(s.date)} · ${s.topic}` })) : [{ value: '', label: 'No hay clases registradas' }]}
                />
            </div>
            {activeSession ? <>
                <div className={Styles.alertCard} style={{ marginBottom: 19 }}>
                    <strong>{t(activeSession.topic)}</strong>
                    <div>{t(courseName(data.groups.find(g => g.id === activeGroup)?.courseId ?? '', data))} {t(" · ")}{t(dateLabel(activeSession.date))}</div>
                </div>
                <div className="tableWrap">
                    <table className="dataTable">
                        <thead>
                            <tr>
                                <th>{t("Alumno")}</th>
                                <th>{t("Estado de asistencia")}</th>
                            </tr>
                        </thead>
                        <tbody>{enrollees.map(s => <tr key={s.id}>
                            <td>
                                <div className="tablePerson">
                                    <Avatar name={s.name} size="small" />
                                    <strong>{t(studentName(s.id, data))}</strong>
                                </div>
                            </td>
                            <td>
                                <select
                                    aria-label={t(`Asistencia de ${s.name}`)}
                                    className="filterSelect"
                                    value={draft[s.id] ?? 'present'}
                                    onChange={e => { setDraft({ ...draft, [s.id]: e.target.value as AttendanceStatus }); setSuccess(false); }}
                                >{selectStatuses.map(o => <option key={o.value} value={o.value}>{t(o.label)}</option>)}</select>
                            </td>
                        </tr>)}</tbody>
                    </table>{!enrollees.length && <EmptyState title={t("Esta comisión no tiene alumnos")} />}</div>
                <div className="formActions" style={{ alignItems: 'center' }}>{success && <span className="formSuccess" style={{ fontSize: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
                    <CheckCircle2 size={16} /> {t(" Asistencia guardada")}</span>}<Button onClick={save} disabled={!enrollees.length}>
                        <CalendarCheck2 size={16} /> {t(" Guardar asistencia")}</Button>
                </div></> : <EmptyState title={t("Todavía no hay clases")} message={t("Creá una clase para comenzar a registrar asistencias.")} />}
        </Panel>
        {newOpen && <Modal title={t("Registrar nueva clase")} subtitle={t(groupName(activeGroup, data))} onClose={() => setNewOpen(false)}>
            <form className="formStack" onSubmit={createClass}>
                <TextInput
                    required
                    label={t("Tema o título de la clase")}
                    value={topic}
                    onChange={setTopic}
                    placeholder={t("Práctica de técnicas de corte")}
                />
                <SelectInput
                    label={t("Materia")}
                    value={availableSubjects.some(s => s.id === subjectId) ? subjectId : availableSubjects[0]?.id ?? ''}
                    onChange={setSubjectId}
                    options={availableSubjects.map(s => ({ value: s.id, label: s.name }))}
                />
                <TextInput required label={t("Fecha de la clase")} type="date" value={sessionDate} onChange={setSessionDate} />
                <div className="formActions">
                    <Button variant="secondary" onClick={() => setNewOpen(false)}>{t("Cancelar")}</Button>
                    <Button type="submit">{t("Crear clase")}</Button>
                </div>
            </form>
        </Modal>}
    </>;
}
