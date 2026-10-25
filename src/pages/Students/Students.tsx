/** Students view: role-aware academic workflows and UI presentation. */
import { t } from '../../i18n/Translations';
import { useState } from 'react';
import { Pencil, Plus, Search } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { scopedGroupIds } from '../../lib/Permissions';
import { dateLabel, uid } from '../../lib/Utils';
import type { Student } from '../../Types';
import { Avatar, Button, EmptyState, Modal, PageTitle, Panel, Pill, SelectInput, TextInput } from '../../components/Common/Common';
const blank: Student = { id: '', name: '', email: '', phone: '', doc: '', status: 'active', registeredAt: '' };
// Scope student records to the current role and validate administrator edits.
export function Students() {
    const { data, user, update } = useDemo();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [editing, setEditing] = useState<Student | null>(null);
    const [error, setError] = useState('');
    if (!user)
        return null;
    const allowedIds = user.role === 'tutor' ? new Set(data.enrollments.filter(e => scopedGroupIds(user, data).includes(e.groupId)).map(e => e.studentId)) : null;
    const shown = data.students.filter(s => (!allowedIds || allowedIds.has(s.id)) && (filter === 'all' || s.status === filter) && `${s.name} ${s.email} ${s.doc}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name));
    const save = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing || user.role !== 'admin')
            return;
        if (!editing.name.trim() || !editing.email.trim()) {
            setError('Completá los campos obligatorios.');
            return;
        }
        if (data.students.some(s => s.id !== editing.id && s.email.toLowerCase() === editing.email.trim().toLowerCase())) {
            setError('Ya existe un alumno con ese correo.');
            return;
        }
        const isNew = !editing.id;
        update(isNew ? 'Registró un nuevo alumno' : 'Actualizó los datos de un alumno', prev => ({ ...prev, students: isNew ? [...prev.students, { ...editing, id: uid('student'), registeredAt: new Date().toISOString().slice(0, 10) }] : prev.students.map(s => s.id === editing.id ? { ...editing } : s) }));
        setEditing(null);
        setError('');
    };
    return <>
        <PageTitle
            kicker={t("ADMINISTRACIÓN ACADÉMICA")}
            title={t("Alumnos")}
            description={t(user.role === 'admin' ? 'Gestioná el registro de alumnos, sus datos de contacto y estado académico.' : 'Consultá los alumnos inscriptos en tus comisiones asignadas.')}
            action={user.role === 'admin' ? <Button onClick={() => { setEditing({ ...blank }); setError(''); }}>
                <Plus size={16} /> {t(" Nuevo alumno")}</Button> : undefined}
        />
        <Panel title={t("Directorio de alumnos")} subtitle={t(`${shown.length} registros disponibles para tu perfil`)}>
            <div className="filters">
                <div className="searchWrap">
                    <Search size={16} />
                    <input
                        aria-label={t("Buscar alumno")}
                        placeholder={t("Buscar por nombre, correo o documento...")}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select aria-label={t("Filtrar alumnos")} className="filterSelect" value={filter} onChange={e => setFilter(e.target.value)}>
                    <option value="all">{t("Todos los estados")}</option>
                    <option value="active">{t("Activos")}</option>
                    <option value="inactive">{t("Inactivos")}</option>
                </select>
            </div>
            <div className="tableWrap">
                <table className="dataTable">
                    <thead>
                        <tr>
                            <th>{t("Alumno")}</th>
                            <th>{t("Documento")}</th>
                            <th>{t("Teléfono")}</th>
                            <th>{t("Inscripciones")}</th>
                            <th>{t("Estado")}</th>{user.role === 'admin' && <th>{t("Acciones")}</th>}</tr>
                    </thead>
                    <tbody>{shown.map(s => <tr key={s.id}>
                        <td>
                            <div className="tablePerson">
                                <Avatar name={s.name} />
                                <div>
                                    <strong>{t(s.name)}</strong>
                                    <div className="muted">{t(s.email)}</div>
                                </div>
                            </div>
                        </td>
                        <td>{t(s.doc || '—')}</td>
                        <td>{t(s.phone || '—')}</td>
                        <td>{t(data.enrollments.filter(e => e.studentId === s.id && e.status === 'active').length)}</td>
                        <td>
                            <Pill tone={s.status === 'active' ? 'success' : 'warning'}>{t(s.status === 'active' ? 'Activo' : 'Inactivo')}</Pill>
                        </td>{user.role === 'admin' && <td>
                            <button
                                type="button"
                                className="miniButton"
                                aria-label={t(`Editar ${s.name}`)}
                                onClick={() => { setEditing({ ...s }); setError(''); }}
                            >
                                <Pencil size={14} />
                            </button>
                        </td>}</tr>)}</tbody>
                </table>{shown.length === 0 && <EmptyState title={t("No hay alumnos")} message={t("No encontramos registros con esos filtros.")} />}</div>
        </Panel>
        {editing && <Modal
            title={t(editing.id ? 'Editar alumno' : 'Registrar alumno')}
            subtitle={t("Los datos son ficticios y solo se almacenan en esta sesión.")}
            onClose={() => setEditing(null)}
        >
            <form onSubmit={save} className="formStack">
                <TextInput
                    required
                    label={t("Nombre y apellido *")}
                    value={editing.name}
                    onChange={v => setEditing({ ...editing, name: v })}
                    placeholder={t("Nombre del alumno")}
                />
                <TextInput
                    required
                    type="email"
                    label={t("Correo electrónico *")}
                    value={editing.email}
                    onChange={v => setEditing({ ...editing, email: v })}
                    placeholder={t("correo@ejemplo.com")}
                />
                <div className="formGrid">
                    <TextInput label={t("Documento ficticio")} value={editing.doc} onChange={v => setEditing({ ...editing, doc: v })} />
                    <TextInput label={t("Teléfono ficticio")} value={editing.phone} onChange={v => setEditing({ ...editing, phone: v })} />
                </div>
                <SelectInput
                    label={t("Estado")}
                    value={editing.status}
                    onChange={v => setEditing({ ...editing, status: v as Student['status'] })}
                    options={[{ value: 'active', label: 'Activo' }, { value: 'inactive', label: 'Inactivo' }]}
                />{editing.id && <p className="helpLine">{t("Registrado el ")}{t(dateLabel(editing.registeredAt))}{t(". El historial de inscripciones se conserva al desactivar un alumno.")}</p>}{error && <p role="alert" className="formError">{t(error)}</p>}<div className="formActions">
                    <Button variant="secondary" onClick={() => setEditing(null)}>{t("Cancelar")}</Button>
                    <Button type="submit">{t("Guardar alumno")}</Button>
                </div>
            </form>
        </Modal>}
    </>;
}
