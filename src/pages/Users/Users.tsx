/** Users view: role-aware academic workflows and UI presentation. */
import { t } from '../../i18n/Translations';
import { useState } from 'react';
import { KeyRound, Plus, Search, UserCog } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { roleLabel, uid } from '../../lib/Utils';
import type { Role, User } from '../../Types';
import { Avatar, Button, EmptyState, Modal, Notice, PageTitle, Panel, Pill, SelectInput, TextInput } from '../../components/Common/Common';
import Styles from '../../styles/PageShared.module.css';
const blank: User = { id: '', name: '', email: '', password: 'Demo2026!', role: 'tutor', active: true };
// Manage fictional sign-in accounts and access roles.
export function Users() {
    const { data, user, update } = useDemo();
    const [editing, setEditing] = useState<User | null>(null);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    if (!user || user.role !== 'admin')
        return null;
    const shown = data.users.filter(u => `${u.name} ${u.email} ${roleLabel[u.role]}`.toLowerCase().includes(search.toLowerCase()));
    const save = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing)
            return;
        if (!editing.name.trim() || !editing.email.trim() || !editing.password.trim()) {
            setError('Completá nombre, correo y contraseña de prueba.');
            return;
        }
        if (data.users.some(u => u.id !== editing.id && u.email.toLowerCase() === editing.email.trim().toLowerCase())) {
            setError('Ya existe una cuenta con ese correo.');
            return;
        }
        if (editing.role === 'student' && !editing.studentId) {
            setError('Seleccioná un alumno para asociar la cuenta.');
            return;
        }
        if (editing.id === user.id && (editing.role !== 'admin' || !editing.active)) {
            setError('No podés quitarte tu propio acceso de administrador.');
            return;
        }
        const edited = { ...editing, studentId: editing.role === 'student' ? editing.studentId : undefined };
        update(editing.id ? 'Modificó un usuario de prueba' : 'Creó un usuario de prueba', prev => ({ ...prev, users: editing.id ? prev.users.map(u => u.id === editing.id ? edited : u) : [...prev.users, { ...edited, id: uid('user') }] }));
        setEditing(null);
        setError('');
    };
    return <>
        <PageTitle
            kicker={t("CONTROL DE ACCESOS")}
            title={t("Usuarios y permisos")}
            description={t("Administrá las cuentas de demostración y sus perfiles de acceso.")}
            action={<Button onClick={() => { setEditing({ ...blank }); setError(''); }}>
                <Plus size={16} /> {t(" Nuevo usuario")}</Button>}
        />
        <div className="statsGrid">
            <div className={Styles.statCard}>
                <div className={Styles.statLabel}>{t("Cuentas registradas")}</div>
                <div className={Styles.statValue}>{t(data.users.length)}</div>
                <span className="subText">{t("Usuarios de prueba")}</span>
            </div>{(['admin', 'tutor', 'student'] as Role[]).map(role => <div className={Styles.statCard} key={role}>
                <div className={Styles.statLabel}>{t(roleLabel[role])}</div>
                <div className={Styles.statValue}>{t(data.users.filter(u => u.role === role).length)}</div>
                <span className="subText">{t("Con este rol")}</span>
            </div>)}</div>
        <div className="sectionSpacer" />
        <Panel title={t("Directorio de usuarios")} subtitle={t("Administración de cuentas de prueba")}>
            <div className="filters">
                <div className="searchWrap">
                    <Search size={16} />
                    <input
                        aria-label={t("Buscar usuarios")}
                        placeholder={t("Buscar usuario...")}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>
            <div className="tableWrap">
                <table className="dataTable">
                    <thead>
                        <tr>
                            <th>{t("Usuario")}</th>
                            <th>{t("Perfil")}</th>
                            <th>{t("Estado")}</th>
                            <th>{t("Editar")}</th>
                        </tr>
                    </thead>
                    <tbody>{shown.map(u => <tr key={u.id}>
                        <td>
                            <div className="tablePerson">
                                <Avatar name={u.name} />
                                <div>
                                    <strong>{t(u.name)}</strong>
                                    <div className="muted">{t(u.email)}</div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <Pill tone={u.role === 'admin' ? 'purple' : u.role === 'tutor' ? 'info' : 'neutral'}>{t(roleLabel[u.role])}</Pill>
                        </td>
                        <td>
                            <Pill tone={u.active ? 'success' : 'danger'}>{t(u.active ? 'Habilitado' : 'Deshabilitado')}</Pill>
                        </td>
                        <td>
                            <button type="button" className="miniButton" onClick={() => { setEditing({ ...u }); setError(''); }}>
                                <UserCog size={14} /> {t(" Editar")}</button>
                        </td>
                    </tr>)}</tbody>
                </table>{!shown.length && <EmptyState />}</div>
        </Panel>
        <div className="sectionSpacer" />
        <Notice tone="warning">
            <strong>{t("Acceso simulado:")}</strong> {t(" este prototipo almacena usuarios, contraseñas y permisos en el navegador. No es seguro para cuentas reales ni para datos personales. En producción se requiere autenticación y autorización en servidor.")}</Notice>
        {editing && <Modal
            title={t(editing.id ? 'Editar usuario' : 'Crear usuario de prueba')}
            subtitle={t("Estas credenciales no deben reutilizarse en sistemas reales.")}
            onClose={() => setEditing(null)}
        >
            <form className="formStack" onSubmit={save}>
                <TextInput
                    required
                    label={t("Nombre y apellido")}
                    value={editing.name}
                    onChange={v => setEditing({ ...editing, name: v })}
                />
                <TextInput
                    required
                    type="email"
                    label={t("Correo electrónico")}
                    value={editing.email}
                    onChange={v => setEditing({ ...editing, email: v })}
                />
                <TextInput
                    required
                    label={t("Contraseña ficticia")}
                    value={editing.password}
                    onChange={v => setEditing({ ...editing, password: v })}
                />
                <SelectInput
                    label={t("Rol")}
                    value={editing.role}
                    onChange={v => setEditing({ ...editing, role: v as Role, studentId: v === 'student' ? (editing.studentId ?? data.students[0]?.id) : undefined })}
                    options={(['admin', 'tutor', 'student'] as Role[]).map(v => ({ value: v, label: roleLabel[v] }))}
                />{editing.role === 'student' && <SelectInput
                    label={t("Alumno asociado")}
                    value={editing.studentId ?? data.students[0]?.id ?? ''}
                    onChange={v => setEditing({ ...editing, studentId: v })}
                    options={data.students.map(s => ({ value: s.id, label: s.name }))}
                />}<SelectInput
                    label={t("Acceso")}
                    value={String(editing.active)}
                    onChange={v => setEditing({ ...editing, active: v === 'true' })}
                    options={[{ value: 'true', label: 'Habilitado' }, { value: 'false', label: 'Deshabilitado' }]}
                />{error && <p role="alert" className="helpLine" className="formError">{t(error)}</p>}<div className="formActions">
                    <Button variant="secondary" onClick={() => setEditing(null)}>{t("Cancelar")}</Button>
                    <Button type="submit">
                        <KeyRound size={15} /> {t(" Guardar usuario")}</Button>
                </div>
            </form>
        </Modal>}
    </>;
}
