/** Courses view: role-aware academic workflows and UI presentation. */
import { t } from '../../i18n/Translations';
import { useState } from 'react';
import { BookOpen, Layers, Pencil, Plus, Search } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { courseName, tutorName } from '../../lib/Permissions';
import { dateLabel, money, uid } from '../../lib/Utils';
import type { Course, Group, Subject } from '../../Types';
import { Button, EmptyState, Modal, PageTitle, Panel, Pill, SelectInput, TextArea, TextInput } from '../../components/Common/Common';
import SharedStyles from '../../styles/PageShared.module.css';
import PageStyles from './Courses.module.css';

const Styles = { ...SharedStyles, ...PageStyles };
const blankCourse: Course = { id: '', name: '', code: '', category: 'Formación profesional', modality: 'Presencial', duration: '', monthlyFee: 0, description: '', active: true };
// Browse and maintain the course catalog, subjects, and teaching groups.
export function Courses() {
    const { data, user, update } = useDemo();
    const [tab, setTab] = useState<'courses' | 'groups' | 'subjects'>('courses');
    const [search, setSearch] = useState('');
    const [editCourse, setEditCourse] = useState<Course | null>(null);
    const [editGroup, setEditGroup] = useState<Group | null>(null);
    const [editSubject, setEditSubject] = useState<Subject | null>(null);
    const [error, setError] = useState('');
    if (!user)
        return null;
    const admin = user.role === 'admin';
    const courses = data.courses.filter(c => `${c.name} ${c.code} ${c.category}`.toLowerCase().includes(search.toLowerCase()));
    const tutors = data.users.filter(u => u.role === 'tutor' && u.active);
    const saveCourse = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editCourse || !admin)
            return;
        if (!editCourse.name.trim() || !editCourse.code.trim() || editCourse.monthlyFee < 0) {
            setError('Ingresá un nombre, código e importe válido.');
            return;
        }
        if (data.courses.some(c => c.id !== editCourse.id && c.code.toLowerCase() === editCourse.code.trim().toLowerCase())) {
            setError('Ese código ya existe.');
            return;
        }
        update(editCourse.id ? 'Actualizó un curso' : 'Creó un curso', prev => ({ ...prev, courses: editCourse.id ? prev.courses.map(c => c.id === editCourse.id ? { ...editCourse } : c) : [...prev.courses, { ...editCourse, id: uid('course') }] }));
        setEditCourse(null);
    };
    const saveGroup = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editGroup || !admin)
            return;
        if (!editGroup.courseId || !editGroup.tutorId || !editGroup.name.trim() || editGroup.capacity < 1) {
            setError('Completá los datos de la comisión.');
            return;
        }
        update(editGroup.id ? 'Actualizó una comisión' : 'Creó una comisión', prev => ({ ...prev, groups: editGroup.id ? prev.groups.map(g => g.id === editGroup.id ? { ...editGroup } : g) : [...prev.groups, { ...editGroup, id: uid('group') }] }));
        setEditGroup(null);
    };
    const saveSubject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editSubject || !admin)
            return;
        if (!editSubject.courseId || !editSubject.name.trim() || editSubject.hours <= 0) {
            setError('Completá los datos de la materia.');
            return;
        }
        update(editSubject.id ? 'Actualizó una materia' : 'Creó una materia', prev => ({ ...prev, subjects: editSubject.id ? prev.subjects.map(s => s.id === editSubject.id ? { ...editSubject } : s) : [...prev.subjects, { ...editSubject, id: uid('subject') }] }));
        setEditSubject(null);
    };
    const add = () => {
        setError(''); if (tab === 'courses')
            setEditCourse({ ...blankCourse });
        else if (tab === 'groups')
            setEditGroup({ id: '', name: '', courseId: data.courses[0]?.id ?? '', tutorId: tutors[0]?.id ?? '', schedule: '', capacity: 20, startDate: new Date().toISOString().slice(0, 10) });
        else
            setEditSubject({ id: '', name: '', courseId: data.courses[0]?.id ?? '', hours: 32 });
    };
    return <>
        <PageTitle
            kicker={t("OFERTA ACADÉMICA")}
            title={t("Cursos y materias")}
            description={t("Organizá las formaciones, sus contenidos y las comisiones con docentes asignados.")}
            action={admin ? <Button onClick={add}>
                <Plus size={16} /> {t(tab === 'courses' ? 'Nuevo curso' : tab === 'groups' ? 'Nueva comisión' : 'Nueva materia')}</Button> : undefined}
        />
        <div className={Styles.tabs}>{([['courses', 'Cursos'], ['groups', 'Comisiones'], ['subjects', 'Materias']] as const).map(([k, label]) => <button
            type="button"
            key={k}
            className={`${Styles.tab} ${tab === k ? Styles.tabActive : ''}`}
            onClick={() => { setTab(k); setSearch(''); }}
        >{t(label)}</button>)}</div>
        {tab === 'courses' && <>
            <div className="filters">
                <div className="searchWrap">
                    <Search size={16} />
                    <input
                        aria-label={t("Buscar cursos")}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={t("Buscar por nombre o código...")}
                    />
                </div>
            </div>
            <div className="cardGrid">{courses.map(c => <div key={c.id} className={Styles.courseCard}>
                <div className={Styles.courseTop}>
                    <span className={Styles.courseIcon}>
                        <BookOpen size={20} />
                    </span>
                    <Pill tone={c.active ? 'success' : 'warning'}>{t(c.active ? 'Disponible' : 'Inactivo')}</Pill>
                </div>
                <div>
                    <div className={Styles.numberAccent}>{t(c.code)}</div>
                    <h3>{t(c.name)}</h3>
                </div>
                <p>{t(c.description)}</p>
                <div className={Styles.tagRow}>
                    <span className={Styles.innerBadge}>{t(c.modality)}</span>
                    <span className={Styles.innerBadge}>{t(c.duration)}</span>
                </div>
                <div className={Styles.courseMeta}>
                    <span>
                        <strong>{t(money(c.monthlyFee))}</strong> {t(" / mes")}</span>{admin ? <button type="button" className="miniButton" onClick={() => { setEditCourse({ ...c }); setError(''); }}>
                            <Pencil size={14} /> {t(" Editar")}</button> : <span>{t(data.subjects.filter(s => s.courseId === c.id).length)} {t(" materias")}</span>}</div>
            </div>)}</div>{!courses.length && <EmptyState />}</>}
        {tab === 'groups' && <Panel title={t("Comisiones activas")} subtitle={t(`${data.groups.length} comisiones registradas`)}>
            <div className="tableWrap">
                <table className="dataTable">
                    <thead>
                        <tr>
                            <th>{t("Comisión")}</th>
                            <th>{t("Curso")}</th>
                            <th>{t("Docente")}</th>
                            <th>{t("Horario")}</th>
                            <th>{t("Alumnos")}</th>
                            <th>{t("Inicio")}</th>{admin && <th>{t("Editar")}</th>}</tr>
                    </thead>
                    <tbody>{data.groups.map(g => <tr key={g.id}>
                        <td>
                            <strong>{t(g.name)}</strong>
                        </td>
                        <td>{t(courseName(g.courseId, data))}</td>
                        <td>{t(tutorName(g.tutorId, data))}</td>
                        <td>{t(g.schedule)}</td>
                        <td>{t(data.enrollments.filter(en => en.groupId === g.id && en.status === 'active').length)} {t(" / ")}{t(g.capacity)}</td>
                        <td>{t(dateLabel(g.startDate))}</td>{admin && <td>
                            <button type="button" className="miniButton" onClick={() => { setEditGroup({ ...g }); setError(''); }}>
                                <Pencil size={14} />
                            </button>
                        </td>}</tr>)}</tbody>
                </table>
            </div>
        </Panel>}
        {tab === 'subjects' && <Panel title={t("Plan de materias")} subtitle={t(`${data.subjects.length} materias registradas`)}>
            <div className="tableWrap">
                <table className="dataTable">
                    <thead>
                        <tr>
                            <th>{t("Materia")}</th>
                            <th>{t("Curso")}</th>
                            <th>{t("Horas")}</th>{admin && <th>{t("Editar")}</th>}</tr>
                    </thead>
                    <tbody>{data.subjects.map(s => <tr key={s.id}>
                        <td>
                            <strong>{t(s.name)}</strong>
                        </td>
                        <td>{t(courseName(s.courseId, data))}</td>
                        <td>{t(s.hours)} {t(" h")}</td>{admin && <td>
                            <button type="button" className="miniButton" onClick={() => { setEditSubject({ ...s }); setError(''); }}>
                                <Pencil size={14} />
                            </button>
                        </td>}</tr>)}</tbody>
                </table>
            </div>
        </Panel>}
        <div className="sectionSpacer" />
        <div className={Styles.smallInfo}>
            <Layers size={15} /> {t(" Los valores, duraciones y cursos de esta demostración son ficticios; no representan la oferta oficial de ninguna academia.")}</div>
        {editCourse && <Modal title={t(editCourse.id ? 'Editar curso' : 'Nuevo curso')} onClose={() => setEditCourse(null)}>
            <form className="formStack" onSubmit={saveCourse}>
                <TextInput
                    required
                    label={t("Nombre del curso")}
                    value={editCourse.name}
                    onChange={v => setEditCourse({ ...editCourse, name: v })}
                />
                <div className="formGrid">
                    <TextInput required label={t("Código")} value={editCourse.code} onChange={v => setEditCourse({ ...editCourse, code: v })} />
                    <TextInput
                        required
                        label={t("Categoría")}
                        value={editCourse.category}
                        onChange={v => setEditCourse({ ...editCourse, category: v })}
                    />
                </div>
                <div className="formGrid">
                    <SelectInput
                        label={t("Modalidad")}
                        value={editCourse.modality}
                        onChange={v => setEditCourse({ ...editCourse, modality: v as Course['modality'] })}
                        options={['Presencial', 'Híbrida', 'Virtual'].map(v => ({ value: v, label: v }))}
                    />
                    <TextInput
                        required
                        label={t("Duración")}
                        value={editCourse.duration}
                        onChange={v => setEditCourse({ ...editCourse, duration: v })}
                        placeholder={t("8 meses")}
                    />
                </div>
                <TextInput
                    required
                    type="number"
                    min={0}
                    label={t("Valor mensual de muestra (ARS)")}
                    value={editCourse.monthlyFee}
                    onChange={v => setEditCourse({ ...editCourse, monthlyFee: Number(v) })}
                />
                <TextArea
                    label={t("Descripción")}
                    value={editCourse.description}
                    onChange={v => setEditCourse({ ...editCourse, description: v })}
                />
                <SelectInput
                    label={t("Estado")}
                    value={String(editCourse.active)}
                    onChange={v => setEditCourse({ ...editCourse, active: v === 'true' })}
                    options={[{ value: 'true', label: 'Disponible' }, { value: 'false', label: 'Inactivo' }]}
                />{error && <p className="helpLine" className="formError">{t(error)}</p>}<div className="formActions">
                    <Button variant="secondary" onClick={() => setEditCourse(null)}>{t("Cancelar")}</Button>
                    <Button type="submit">{t("Guardar curso")}</Button>
                </div>
            </form>
        </Modal>}
        {editGroup && <Modal title={t(editGroup.id ? 'Editar comisión' : 'Nueva comisión')} onClose={() => setEditGroup(null)}>
            <form className="formStack" onSubmit={saveGroup}>
                <SelectInput
                    required
                    label={t("Curso")}
                    value={editGroup.courseId}
                    onChange={v => setEditGroup({ ...editGroup, courseId: v })}
                    options={data.courses.map(c => ({ value: c.id, label: c.name }))}
                />
                <TextInput
                    required
                    label={t("Nombre de la comisión")}
                    value={editGroup.name}
                    onChange={v => setEditGroup({ ...editGroup, name: v })}
                />
                <SelectInput
                    required
                    label={t("Tutor / docente responsable")}
                    value={editGroup.tutorId}
                    onChange={v => setEditGroup({ ...editGroup, tutorId: v })}
                    options={tutors.map(t => ({ value: t.id, label: t.name }))}
                />
                <TextInput
                    required
                    label={t("Horario")}
                    value={editGroup.schedule}
                    onChange={v => setEditGroup({ ...editGroup, schedule: v })}
                    placeholder={t("Lun. y mié. · 09:00")}
                />
                <div className="formGrid">
                    <TextInput
                        required
                        type="number"
                        min={1}
                        label={t("Capacidad")}
                        value={editGroup.capacity}
                        onChange={v => setEditGroup({ ...editGroup, capacity: Number(v) })}
                    />
                    <TextInput
                        required
                        type="date"
                        label={t("Fecha de inicio")}
                        value={editGroup.startDate}
                        onChange={v => setEditGroup({ ...editGroup, startDate: v })}
                    />
                </div>{error && <p className="helpLine" className="formError">{t(error)}</p>}<div className="formActions">
                    <Button variant="secondary" onClick={() => setEditGroup(null)}>{t("Cancelar")}</Button>
                    <Button type="submit">{t("Guardar comisión")}</Button>
                </div>
            </form>
        </Modal>}
        {editSubject && <Modal title={t(editSubject.id ? 'Editar materia' : 'Nueva materia')} onClose={() => setEditSubject(null)}>
            <form className="formStack" onSubmit={saveSubject}>
                <SelectInput
                    label={t("Curso")}
                    value={editSubject.courseId}
                    onChange={v => setEditSubject({ ...editSubject, courseId: v })}
                    options={data.courses.map(c => ({ value: c.id, label: c.name }))}
                />
                <TextInput
                    required
                    label={t("Nombre de la materia")}
                    value={editSubject.name}
                    onChange={v => setEditSubject({ ...editSubject, name: v })}
                />
                <TextInput
                    required
                    type="number"
                    min={1}
                    label={t("Carga horaria")}
                    value={editSubject.hours}
                    onChange={v => setEditSubject({ ...editSubject, hours: Number(v) })}
                />{error && <p className="helpLine" className="formError">{t(error)}</p>}<div className="formActions">
                    <Button variant="secondary" onClick={() => setEditSubject(null)}>{t("Cancelar")}</Button>
                    <Button type="submit">{t("Guardar materia")}</Button>
                </div>
            </form>
        </Modal>}
    </>;
}
