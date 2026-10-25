/** Enrollments view: role-aware academic workflows and UI presentation. */
import { t } from '../../i18n/Translations';
import { useState } from 'react';
import { GraduationCap, Plus, Search } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { courseName, groupName, scopedGroupIds, studentName } from '../../lib/Permissions';
import { dateLabel, uid, statusLabel } from '../../lib/Utils';
import type { Enrollment, Status } from '../../Types';
import { Avatar, Button, EmptyState, Modal, PageTitle, Panel, Pill, SelectInput } from '../../components/Common/Common';
// Connect students to groups while respecting duplicate and capacity rules.
export function Enrollments() {
    const { data, user, update } = useDemo();
    const [search, setSearch] = useState('');
    const [newOpen, setNewOpen] = useState(false);
    const [studentId, setStudentId] = useState(data.students[0]?.id ?? '');
    const [groupId, setGroupId] = useState(data.groups[0]?.id ?? '');
    const [error, setError] = useState('');
    if (!user)
        return null;
    const ids = scopedGroupIds(user, data);
    const admin = user.role === 'admin', student = user.role === 'student';
    const shown = data.enrollments.filter(e => ids.includes(e.groupId) && (!student || e.studentId === user.studentId) && `${studentName(e.studentId, data)} ${groupName(e.groupId, data)}`.toLowerCase().includes(search.toLowerCase())).slice().sort((a, b) => b.date.localeCompare(a.date));
    const add = (e: React.FormEvent) => {
        e.preventDefault();
        if (!admin)
            return;
        if (!studentId || !groupId) {
            setError('Seleccioná el alumno y la comisión.');
            return;
        }
        const group = data.groups.find(g => g.id === groupId)!;
        if (data.enrollments.some(en => en.studentId === studentId && en.groupId === groupId && en.status !== 'completed')) {
            setError('El alumno ya tiene una inscripción vigente en esa comisión.');
            return;
        }
        const seats = data.enrollments.filter(en => en.groupId === groupId && en.status === 'active').length;
        if (seats >= group.capacity) {
            setError('La comisión llegó al límite de alumnos.');
            return;
        }
        const newItem: Enrollment = { id: uid('enrollment'), studentId, groupId, date: new Date().toISOString().slice(0, 10), status: 'active' };
        update('Registró una nueva inscripción', prev => ({ ...prev, enrollments: [...prev.enrollments, newItem] }));
        setNewOpen(false);
        setError('');
    };
    const changeStatus = (id: string, status: Status) => {
        if (!admin)
            return; update('Modificó el estado de una inscripción', prev => ({ ...prev, enrollments: prev.enrollments.map(en => en.id === id ? { ...en, status } : en) }));
    };
    return <>
        <PageTitle
            kicker={t("GESTIÓN ACADÉMICA")}
            title={t(student ? 'Mis cursos' : 'Inscripciones')}
            description={t(student ? 'Conocé tus cursos y el estado de tus inscripciones.' : 'Administrá la relación entre alumnos, cursos y comisiones.')}
            action={admin ? <Button onClick={() => { setNewOpen(true); setError(''); }}>
                <Plus size={16} /> {t(" Nueva inscripción")}</Button> : undefined}
        />
        <Panel
            title={t(student ? 'Mis inscripciones' : 'Registro de inscripciones')}
            subtitle={t(`${shown.length} registros visibles`)}
        >
            {!student && <div className="filters">
                <div className="searchWrap">
                    <Search size={16} />
                    <input
                        aria-label={t("Buscar inscripción")}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={t("Buscar alumno, curso o comisión...")}
                    />
                </div>
            </div>}
            <div className="tableWrap">
                <table className="dataTable">
                    <thead>
                        <tr>{!student && <th>{t("Alumno")}</th>}<th>{t("Curso y comisión")}</th>
                            <th>{t("Modalidad")}</th>
                            <th>{t("Fecha de inscripción")}</th>
                            <th>{t("Estado")}</th>
                        </tr>
                    </thead>
                    <tbody>{shown.map(en => {
                        const group = data.groups.find(g => g.id === en.groupId); const course = data.courses.find(c => c.id === group?.courseId); return <tr key={en.id}>{!student && <td>
                            <div className="tablePerson">
                                <Avatar name={studentName(en.studentId, data)} size="small" />
                                <strong>{t(studentName(en.studentId, data))}</strong>
                            </div>
                        </td>}<td>
                                <strong>{t(course?.name || 'Curso')}</strong>
                                <div className="muted">{t(group?.name)}</div>
                            </td>
                            <td>{t(course?.modality || '—')}</td>
                            <td>{t(dateLabel(en.date))}</td>
                            <td>{admin ? <select
                                aria-label={t("Estado de inscripción")}
                                value={en.status}
                                className="filterSelect"
                                onChange={e => changeStatus(en.id, e.target.value as Status)}
                            >
                                <option value="active">{t("Activo")}</option>
                                <option value="paused">{t("Pausado")}</option>
                                <option value="completed">{t("Finalizado")}</option>
                            </select> : <Pill tone={en.status === 'active' ? 'success' : en.status === 'paused' ? 'warning' : 'neutral'}>{t(statusLabel[en.status])}</Pill>}</td>
                        </tr>;
                    })}</tbody>
                </table>{!shown.length && <EmptyState title={t("Sin inscripciones")} message={t("No hay inscripciones para mostrar.")} />}</div>
        </Panel>
        <div className="sectionSpacer" />
        <p className="helpLine">
            <GraduationCap size={14} style={{ verticalAlign: 'middle' }} /> {t(" El historial de inscripciones se conserva aunque un alumno cambie de comisión o finalice un curso.")}</p>
        {newOpen && <Modal
            title={t("Nueva inscripción")}
            subtitle={t("Vinculá un alumno existente con una comisión.")}
            onClose={() => setNewOpen(false)}
        >
            <form className="formStack" onSubmit={add}>
                <SelectInput
                    label={t("Alumno")}
                    value={studentId}
                    onChange={setStudentId}
                    options={data.students.filter(s => s.status === 'active').map(s => ({ value: s.id, label: s.name }))}
                />
                <SelectInput
                    label={t("Comisión")}
                    value={groupId}
                    onChange={setGroupId}
                    options={data.groups.filter(g => data.courses.find(c => c.id === g.courseId)?.active).map(g => ({ value: g.id, label: `${courseName(g.courseId, data)} · ${g.name}` }))}
                />
                <div className="helpLine">{t(groupName(groupId, data))}{t(". Lugares ocupados: ")}{t(data.enrollments.filter(en => en.groupId === groupId && en.status === 'active').length)} {t(" / ")}{t(data.groups.find(g => g.id === groupId)?.capacity ?? 0)}{t(".")}</div>{error && <p className="helpLine" className="formError" role="alert">{t(error)}</p>}<div className="formActions">
                    <Button variant="secondary" onClick={() => setNewOpen(false)}>{t("Cancelar")}</Button>
                    <Button type="submit">{t("Inscribir alumno")}</Button>
                </div>
            </form>
        </Modal>}
    </>;
}
