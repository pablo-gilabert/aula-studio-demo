/** Profile view: role-aware academic workflows and UI presentation. */
import { t } from '../../i18n/Translations';
import { useState } from 'react';
import { Mail, Save, ShieldCheck, UserRound, UsersRound } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { roleLabel } from '../../lib/Utils';
import { Avatar, Button, Notice, PageTitle, Panel, TextInput } from '../../components/Common/Common';
import Styles from '../../styles/PageShared.module.css';
// Let visitors edit the account details allowed by their role.
export function Profile() {
    const { data, user, update } = useDemo();
    const student = data.students.find(s => s.id === user?.studentId);
    const [name, setName] = useState(user?.name ?? '');
    const [email, setEmail] = useState(student?.email ?? '');
    const [phone, setPhone] = useState(student?.phone ?? '');
    const [saved, setSaved] = useState(false);
    if (!user)
        return null;
    const save = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim())
            return;
        if (user.role === 'student' && student) {
            if (!email.trim())
                return;
            update('Actualizó sus datos de contacto de demostración', prev => ({ ...prev, students: prev.students.map(s => s.id === student.id ? { ...s, email: email.trim(), phone: phone.trim() } : s) }));
        }
        else {
            update('Actualizó su nombre de perfil', prev => ({ ...prev, users: prev.users.map(u => u.id === user.id ? { ...u, name: name.trim() } : u) }));
        }
        setSaved(true);
    };
    return <>
        <PageTitle
            kicker={t("MI ESPACIO PERSONAL")}
            title={t("Mi perfil")}
            description={t("Consultá tu cuenta de demostración y modificá los datos permitidos para tu perfil.")}
        />
        <div className="sectionGrid">
            <Panel title={t("Información personal")} subtitle={t("Los cambios se conservan durante la sesión de la pestaña.")}>
                <div className={Styles.profileTop} style={{ marginBottom: 24 }}>
                    <Avatar name={user.name} size="large" />
                    <div>
                        <h3>{t(user.name)}</h3>
                        <p className="subText">{t(roleLabel[user.role])}</p>
                    </div>
                </div>
                <form className="formStack" onSubmit={save}>
                    <TextInput
                        required
                        label={t("Nombre y apellido")}
                        value={name}
                        onChange={v => { setName(v); setSaved(false); }}
                        disabled={user.role === 'student'}
                    />
                    <TextInput label={t("Correo de acceso (demo)")} value={user.email} onChange={() => { }} disabled />
                    {user.role === 'student' && student && <>
                        <TextInput
                            required
                            label={t("Correo de contacto")}
                            type="email"
                            value={email}
                            onChange={v => { setEmail(v); setSaved(false); }}
                        />
                        <TextInput label={t("Teléfono de contacto")} value={phone} onChange={v => { setPhone(v); setSaved(false); }} /></>}
                    <div className="formActions">{saved && <span className="helpLine" className="formSuccess" style={{ alignSelf: 'center' }}>{t("✓ Cambios guardados")}</span>}<Button type="submit">
                        <Save size={15} /> {t(" Guardar cambios")}</Button>
                    </div>
                </form>
            </Panel>
            <div className="listStack">
                <Panel title={t("Acceso asignado")} subtitle={t("Así funciona tu perfil en la demo")}>
                    <div className={Styles.linkList}>
                        <div className={Styles.item}>
                            <div className={Styles.itemIcon}>
                                <UserRound size={17} />
                            </div>
                            <div className={Styles.itemMain}>
                                <strong>{t(roleLabel[user.role])}</strong>
                                <small>{t("Perfil activo")}</small>
                            </div>
                        </div>
                        <div className={Styles.item}>
                            <div className={Styles.itemIcon}>
                                <Mail size={17} />
                            </div>
                            <div className={Styles.itemMain}>
                                <strong>{t(user.email)}</strong>
                                <small>{t("Cuenta de demostración")}</small>
                            </div>
                        </div>
                        <div className={Styles.item}>
                            <div className={Styles.itemIcon}>
                                <ShieldCheck size={17} />
                            </div>
                            <div className={Styles.itemMain}>
                                <strong>{t(user.role === 'admin' ? 'Acceso a todas las secciones' : user.role === 'tutor' ? 'Acceso a comisiones asignadas' : 'Acceso a tus datos académicos')}</strong>
                                <small>{t("Permisos simulados")}</small>
                            </div>
                        </div>{student && <div className={Styles.item}>
                            <div className={Styles.itemIcon}>
                                <UsersRound size={17} />
                            </div>
                            <div className={Styles.itemMain}>
                                <strong>{t(data.enrollments.filter(en => en.studentId === student.id && en.status === 'active').length)} {t(" cursos activos")}</strong>
                                <small>{t("Inscripciones vinculadas")}</small>
                            </div>
                        </div>}</div>
                </Panel>
                <Notice tone="warning">{t("Los permisos de esta demostración se aplican en React y no constituyen seguridad real. No cargues información personal.")}</Notice>
            </div>
        </div>
    </>;
}
