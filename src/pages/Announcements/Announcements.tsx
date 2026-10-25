/** Announcements view: role-aware academic workflows and UI presentation. */
import { t } from '../../i18n/Translations';
import { useState } from 'react';
import { Megaphone, Plus, Trash2 } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { dateLabel, isoDay, uid } from '../../lib/Utils';
import type { Announcement } from '../../Types';
import { Avatar, Button, EmptyState, Modal, PageTitle, Panel, Pill, SelectInput, TextArea, TextInput } from '../../components/Common/Common';
import SharedStyles from '../../styles/PageShared.module.css';
import PageStyles from './Announcements.module.css';

const Styles = { ...SharedStyles, ...PageStyles };
// Publish audience-specific announcements within the demo.
export function Announcements() {
    const { data, user, update } = useDemo();
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [audience, setAudience] = useState<Announcement['audience']>('all');
    if (!user)
        return null;
    const canPost = user.role === 'admin' || user.role === 'tutor';
    const visible = data.announcements.filter(a => user.role === 'admin' || a.audience === 'all' || a.audience === (user.role === 'student' ? 'students' : 'tutors')).slice().sort((a, b) => b.date.localeCompare(a.date));
    const post = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canPost || !title.trim() || !body.trim())
            return;
        const msg: Announcement = { id: uid('announcement'), title: title.trim(), body: body.trim(), audience, authorId: user.id, date: isoDay() };
        update('Publicó un comunicado', prev => ({ ...prev, announcements: [msg, ...prev.announcements] }));
        setOpen(false);
        setTitle('');
        setBody('');
    };
    const remove = (id: string) => {
        const ann = data.announcements.find(a => a.id === id); if (!ann || (user.role !== 'admin' && ann.authorId !== user.id))
            return; if (window.confirm('¿Eliminar este comunicado ficticio?'))
            update('Eliminó un comunicado', prev => ({ ...prev, announcements: prev.announcements.filter(a => a.id !== id) }));
    };
    return <>
        <PageTitle
            kicker={t("COMUNICACIÓN INSTITUCIONAL")}
            title={t("Comunicados")}
            description={t("Anuncios, recordatorios y novedades para la comunidad académica.")}
            action={canPost ? <Button onClick={() => setOpen(true)}>
                <Plus size={16} /> {t(" Nuevo comunicado")}</Button> : undefined}
        />
        <div className="sectionGrid">
            <div className="listStack">{visible.map(a => <Panel key={a.id}>
                <div className={Styles.announcementHeader}>
                    <div className={Styles.tagRow}>
                        <Pill tone={a.audience === 'all' ? 'info' : a.audience === 'students' ? 'success' : 'purple'}>{t(a.audience === 'all' ? 'Todos' : a.audience === 'students' ? 'Alumnos' : 'Tutores')}</Pill>
                        <span className="muted">{t(dateLabel(a.date))}</span>
                    </div>{canPost && (user.role === 'admin' || a.authorId === user.id) && <button type="button" className="miniButton" aria-label={t("Eliminar comunicado")} onClick={() => remove(a.id)}>
                        <Trash2 size={14} />
                    </button>}</div>
                <h3 className={Styles.announcementTitle}>{t(a.title)}</h3>
                <p className={Styles.announcementBody}>{t(a.body)}</p>
                <div className={Styles.announcementAuthor}>
                    <Avatar name={data.users.find(u => u.id === a.authorId)?.name ?? 'Equipo académico'} size="small" />
                    <span className="muted">{t(data.users.find(u => u.id === a.authorId)?.name ?? 'Equipo académico')}</span>
                </div>
            </Panel>)}{!visible.length && <EmptyState />}</div>
            <div>
                <Panel title={t("Tablón informativo")} subtitle={t("Comunicación clara, en un solo lugar")}>
                    <div className={Styles.mutedBox}>
                        <Megaphone size={21} className={Styles.announcementIcon} />{t("Los comunicados son visibles según el perfil del usuario. En esta demo no se envían correos ni notificaciones reales.")}</div>
                    <div className="sectionSpacer" />
                    <div className="infoRow">
                        <strong>{t("Para toda la academia")}</strong>
                        <span>{t(data.announcements.filter(a => a.audience === 'all').length)}</span>
                    </div>
                    <div className="infoRow">
                        <strong>{t("Para alumnos")}</strong>
                        <span>{t(data.announcements.filter(a => a.audience === 'students').length)}</span>
                    </div>
                    <div className="infoRow">
                        <strong>{t("Para tutores")}</strong>
                        <span>{t(data.announcements.filter(a => a.audience === 'tutors').length)}</span>
                    </div>
                </Panel>
            </div>
        </div>
        {open && <Modal title={t("Publicar comunicado")} onClose={() => setOpen(false)}>
            <form className="formStack" onSubmit={post}>
                <TextInput required label={t("Título")} value={title} onChange={setTitle} />
                <TextArea label={t("Mensaje")} value={body} onChange={setBody} placeholder={t("Escribí el comunicado...")} />
                <SelectInput
                    label={t("Destinatarios")}
                    value={audience}
                    onChange={v => setAudience(v as Announcement['audience'])}
                    options={[{ value: 'all', label: 'Toda la academia' }, { value: 'students', label: 'Alumnos' }, { value: 'tutors', label: 'Tutores y docentes' }]}
                />
                <div className="formActions">
                    <Button variant="secondary" onClick={() => setOpen(false)}>{t("Cancelar")}</Button>
                    <Button type="submit" disabled={!title.trim() || !body.trim()}>{t("Publicar comunicado")}</Button>
                </div>
            </form>
        </Modal>}
    </>;
}
