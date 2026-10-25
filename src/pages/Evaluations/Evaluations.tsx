/** Evaluations view: role-aware academic workflows and UI presentation. */
import { t } from '../../i18n/Translations';
import { useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, Plus, Save } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { canTeachGroup, groupName, scopedGroupIds, studentName } from '../../lib/Permissions';
import { dateLabel, isoDay, uid } from '../../lib/Utils';
import type { Evaluation, Grade } from '../../Types';
import { Avatar, Button, EmptyState, Modal, PageTitle, Panel, Pill, SelectInput, TextInput } from '../../components/Common/Common';
import SharedStyles from '../../styles/PageShared.module.css';
import PageStyles from './Evaluations.module.css';

const Styles = { ...SharedStyles, ...PageStyles };
// Enter assessment grades and expose results to enrolled students.
export function Evaluations() {
    const { data, user, update } = useDemo();
    const [groupId, setGroupId] = useState('');
    const [evalId, setEvalId] = useState('');
    const [scores, setScores] = useState<Record<string, string>>({});
    const [saved, setSaved] = useState(false);
    const [newOpen, setNewOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(isoDay(7));
    const [subjectId, setSubjectId] = useState('');
    const [maxScore, setMaxScore] = useState('10');
    const ids = useMemo(() => user ? scopedGroupIds(user, data) : [], [user, data]);
    const activeGroup = ids.includes(groupId) ? groupId : (ids[0] ?? '');
    const evaluations = data.evaluations.filter(e => e.groupId === activeGroup).slice().sort((a, b) => b.date.localeCompare(a.date));
    const selected = evaluations.find(e => e.id === evalId) ?? evaluations[0];
    const enrollees = data.enrollments.filter(en => en.groupId === activeGroup && en.status !== 'completed').map(en => data.students.find(s => s.id === en.studentId)).filter((s): s is NonNullable<typeof s> => !!s);
    const subjects = data.subjects.filter(s => s.courseId === data.groups.find(g => g.id === activeGroup)?.courseId);
    useEffect(() => {
        const v: Record<string, string> = {};
        if (selected)
            enrollees.forEach(s => { const gr = data.grades.find(g => g.evaluationId === selected.id && g.studentId === s.id); v[s.id] = gr ? String(gr.score) : ''; });
        setScores(v); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected?.id, data.grades, data.enrollments]);
    if (!user)
        return null;
    const student = user.role === 'student';
    const canEdit = !student && canTeachGroup(user, activeGroup, data);
    if (student) {
        const linked = data.evaluations.filter(ev => ids.includes(ev.groupId)).slice().sort((a, b) => b.date.localeCompare(a.date));
        const evaluated = linked.map(ev => ({ ...ev, grade: data.grades.find(gr => gr.evaluationId === ev.id && gr.studentId === user.studentId) }));
        const graded = evaluated.filter(ev => !!ev.grade);
        const avg = graded.length ? (graded.reduce((n, ev) => n + (ev.grade!.score / ev.maxScore) * 10, 0) / graded.length).toFixed(1) : '—';
        return <>
            <PageTitle
                kicker={t("MI PROGRESO")}
                title={t("Mis calificaciones")}
                description={t("Consultá tus evaluaciones, resultados y próximas fechas.")}
            />
            <div className="statsGrid">
                <div className={Styles.statCard}>
                    <div className={Styles.statLabel}>{t("Promedio sobre 10")}</div>
                    <div className={Styles.statValue}>{t(avg)}</div>
                    <span className="subText">{t("Promedio normalizado")}</span>
                </div>
                <div className={Styles.statCard}>
                    <div className={Styles.statLabel}>{t("Notas publicadas")}</div>
                    <div className={Styles.statValue}>{t(graded.length)}</div>
                    <span className="subText">{t("Evaluaciones calificadas")}</span>
                </div>
                <div className={Styles.statCard}>
                    <div className={Styles.statLabel}>{t("Próximas evaluaciones")}</div>
                    <div className={Styles.statValue}>{t(linked.filter(ev => ev.date > isoDay()).length)}</div>
                    <span className="subText">{t("Programadas a futuro")}</span>
                </div>
            </div>
            <div className="sectionSpacer" />
            <Panel title={t("Mi historial de evaluaciones")}>
                <div className="tableWrap">
                    <table className="dataTable">
                        <thead>
                            <tr>
                                <th>{t("Evaluación")}</th>
                                <th>{t("Curso y comisión")}</th>
                                <th>{t("Fecha")}</th>
                                <th>{t("Calificación")}</th>
                            </tr>
                        </thead>
                        <tbody>{evaluated.map(ev => <tr key={ev.id}>
                            <td>
                                <strong>{t(ev.title)}</strong>
                                <div className="muted">{t(data.subjects.find(s => s.id === ev.subjectId)?.name)}</div>
                            </td>
                            <td>{t(groupName(ev.groupId, data))}</td>
                            <td>{t(dateLabel(ev.date))}</td>
                            <td>{ev.grade ? <Pill tone={ev.grade.score / ev.maxScore >= .6 ? 'success' : 'warning'}>{t(ev.grade.score)} {t(" / ")}{t(ev.maxScore)}</Pill> : <Pill>{t("Sin calificar")}</Pill>}</td>
                        </tr>)}</tbody>
                    </table>{!evaluated.length && <EmptyState />}</div>
            </Panel></>;
    }
    const saveGrades = () => {
        if (!selected || !canEdit)
            return;
        const additions: Grade[] = [];
        for (const s of enrollees) {
            const value = scores[s.id];
            if (value === undefined || value.trim() === '')
                continue;
            const n = Number(value);
            if (!Number.isFinite(n) || n < 0 || n > selected.maxScore)
                return;
            additions.push({ id: uid('grade'), evaluationId: selected.id, studentId: s.id, score: n, feedback: '' });
        }
        update('Guardó las calificaciones de una evaluación', prev => ({ ...prev, grades: [...prev.grades.filter(g => !(g.evaluationId === selected.id && enrollees.some(s => s.id === g.studentId))), ...additions] }));
        setSaved(true);
    };
    const createEvaluation = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canEdit || !title.trim() || !activeGroup || !(Number(maxScore) > 0))
            return;
        const subj = subjects.find(s => s.id === subjectId) ?? subjects[0];
        if (!subj)
            return;
        const item: Evaluation = { id: uid('evaluation'), groupId: activeGroup, subjectId: subj.id, title: title.trim(), date, maxScore: Number(maxScore) };
        update('Creó una evaluación académica', prev => ({ ...prev, evaluations: [...prev.evaluations, item] }));
        setEvalId(item.id);
        setNewOpen(false);
        setTitle('');
    };
    return <>
        <PageTitle
            kicker={t("SEGUIMIENTO ACADÉMICO")}
            title={t("Evaluaciones")}
            description={t("Organizá las evaluaciones y registrá calificaciones de tus comisiones.")}
            action={<Button onClick={() => { setSubjectId(subjects[0]?.id ?? ''); setNewOpen(true); }} disabled={!canEdit || !subjects.length}>
                <Plus size={16} /> {t(" Nueva evaluación")}</Button>}
        />
        <Panel title={t("Libro de calificaciones")} subtitle={t("Las notas registradas se reflejan en el portal del alumno.")}>
            <div className="formGrid" style={{ marginBottom: 23 }}>
                <SelectInput
                    label={t("Comisión")}
                    value={activeGroup}
                    onChange={v => { setGroupId(v); setEvalId(''); setSaved(false); }}
                    options={ids.map(id => ({ value: id, label: groupName(id, data) }))}
                />
                <SelectInput
                    label={t("Evaluación")}
                    value={selected?.id ?? ''}
                    onChange={v => { setEvalId(v); setSaved(false); }}
                    options={evaluations.length ? evaluations.map(ev => ({ value: ev.id, label: `${ev.title} · ${dateLabel(ev.date)}` })) : [{ value: '', label: 'No hay evaluaciones' }]}
                />
            </div>
            {selected ? <>
                <div className={Styles.alertCard} style={{ marginBottom: 18 }}>
                    <strong>{t(selected.title)}</strong>
                    <div>{t(data.subjects.find(s => s.id === selected.subjectId)?.name)} {t(" · ")}{t(dateLabel(selected.date))} {t(" · Calificación máxima: ")}{t(selected.maxScore)}</div>
                </div>
                <div className="tableWrap">
                    <table className="dataTable">
                        <thead>
                            <tr>
                                <th>{t("Alumno")}</th>
                                <th>{t("Nota")}</th>
                                <th>{t("Sobre")}</th>
                                <th>{t("Resultado")}</th>
                            </tr>
                        </thead>
                        <tbody>{enrollees.map(s => {
                            const score = scores[s.id] ?? ''; const value = score === '' ? null : Number(score); return <tr key={s.id}>
                                <td>
                                    <div className="tablePerson">
                                        <Avatar name={s.name} size="small" />
                                        <strong>{t(studentName(s.id, data))}</strong>
                                    </div>
                                </td>
                                <td>
                                    <input
                                        aria-label={t(`Nota de ${s.name}`)}
                                        type="number"
                                        min="0"
                                        max={selected.maxScore}
                                        step="0.1"
                                        className={Styles.gradesInput}
                                        value={score}
                                        onChange={e => { setScores({ ...scores, [s.id]: e.target.value }); setSaved(false); }}
                                        placeholder={t("—")}
                                    />
                                </td>
                                <td>{t(selected.maxScore)}</td>
                                <td>{value === null ? <Pill>{t("Pendiente")}</Pill> : value < 0 || value > selected.maxScore ? <Pill tone="danger">{t("Fuera de rango")}</Pill> : <Pill tone={value / selected.maxScore >= .6 ? 'success' : 'warning'}>{t(value / selected.maxScore >= .6 ? 'Aprobado*' : 'A revisar*')}</Pill>}</td>
                            </tr>;
                        })}</tbody>
                    </table>{!enrollees.length && <EmptyState title={t("No hay alumnos en esta comisión")} />}</div>
                <div className="formActions" style={{ alignItems: 'center' }}>{saved && <span className="helpLine formSuccess">{t("✓ Calificaciones guardadas")}</span>}<Button
                    onClick={saveGrades}
                    disabled={!enrollees.length || Object.values(scores).some(v => v !== '' && (!Number.isFinite(Number(v)) || Number(v) < 0 || Number(v) > selected.maxScore))}
                >
                    <Save size={15} /> {t(" Guardar notas")}</Button>
                </div>
                <p className="helpLine">{t("* El umbral de 60% es solo ilustrativo; las reglas de aprobación reales deben definirse con la institución.")}</p></> : <EmptyState title={t("Sin evaluaciones")} message={t("Creá una evaluación para poder cargar calificaciones.")} />}
        </Panel>
        {newOpen && <Modal title={t("Nueva evaluación")} subtitle={t(groupName(activeGroup, data))} onClose={() => setNewOpen(false)}>
            <form className="formStack" onSubmit={createEvaluation}>
                <TextInput
                    required
                    label={t("Nombre de la evaluación")}
                    value={title}
                    onChange={setTitle}
                    placeholder={t("Parcial práctico 1")}
                />
                <SelectInput
                    label={t("Materia")}
                    value={subjects.some(s => s.id === subjectId) ? subjectId : subjects[0]?.id ?? ''}
                    onChange={setSubjectId}
                    options={subjects.map(s => ({ value: s.id, label: s.name }))}
                />
                <div className="formGrid">
                    <TextInput required label={t("Fecha")} type="date" value={date} onChange={setDate} />
                    <TextInput
                        required
                        type="number"
                        min={1}
                        max={100}
                        label={t("Calificación máxima")}
                        value={maxScore}
                        onChange={setMaxScore}
                    />
                </div>
                <div className="formActions">
                    <Button variant="secondary" onClick={() => setNewOpen(false)}>{t("Cancelar")}</Button>
                    <Button type="submit">
                        <ClipboardCheck size={15} /> {t(" Crear evaluación")}</Button>
                </div>
            </form>
        </Modal>}
    </>;
}
