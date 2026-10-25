/** Reports view: role-aware academic workflows and UI presentation. */
import { t } from '../../i18n/Translations';
import { useMemo, useState } from 'react';
import { BarChart3, Download, FileSpreadsheet, UsersRound } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { outstanding } from '../../lib/Permissions';
import { money, percent } from '../../lib/Utils';
import { Button, EmptyState, PageTitle, Panel, Pill } from '../../components/Common/Common';
import Styles from '../../styles/PageShared.module.css';
type ReportRow = {
    groupId: string;
    course: string;
    group: string;
    tutor: string;
    active: number;
    capacity: number;
    attendance: number;
    average: string;
    pending: number;
};
function csvCell(value: string | number): string {
    let str = String(value);
    // Prevent spreadsheet formula injection if fake records have user-entered values.
    if (/^[\s]*[=+\-@]/.test(str))
        str = `'${str}`;
    return `"${str.replace(/"/g, '""')}"`;
}
function exportCsv(rows: ReportRow[]) {
    const cols = ['Curso', 'Comisión', 'Tutor', 'Alumnos activos', 'Capacidad', 'Asistencia (%)', 'Promedio (/10)', 'Saldo pendiente (ARS)'];
    const content = [cols, ...rows.map(r => [r.course, r.group, r.tutor, r.active, r.capacity, r.attendance, r.average, r.pending])].map(row => row.map(csvCell).join(';')).join('\r\n');
    const blob = new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'informe-academico-demo.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
// Calculate management metrics and export a local CSV report.
export function Reports() {
    const { data, user } = useDemo();
    const [courseId, setCourseId] = useState('all');
    const rows = useMemo<ReportRow[]>(() => data.groups.map(g => {
        const course = data.courses.find(c => c.id === g.courseId);
        const enrollments = data.enrollments.filter(en => en.groupId === g.id);
        const active = enrollments.filter(en => en.status === 'active').length;
        const sessions = data.sessions.filter(s => s.groupId === g.id);
        const attendance = data.attendance.filter(a => sessions.some(s => s.id === a.sessionId));
        const relevantEvals = data.evaluations.filter(ev => ev.groupId === g.id);
        const grades = data.grades.filter(gr => relevantEvals.some(ev => ev.id === gr.evaluationId));
        const normalized = grades.map(gr => { const ev = data.evaluations.find(ev => ev.id === gr.evaluationId)!; return gr.score / ev.maxScore * 10; });
        return { groupId: g.id, course: course?.name ?? 'Curso', group: g.name, tutor: data.users.find(u => u.id === g.tutorId)?.name ?? 'Sin asignar', active, capacity: g.capacity, attendance: percent(attendance.filter(a => a.status !== 'absent').length, attendance.length), average: normalized.length ? (normalized.reduce((sum, n) => sum + n, 0) / normalized.length).toFixed(1) : '—', pending: data.charges.filter(ch => enrollments.some(en => en.id === ch.enrollmentId)).reduce((sum, ch) => sum + outstanding(ch.id, data), 0) };
    }), [data]);
    if (!user || user.role !== 'admin')
        return null;
    const shown = rows.filter(r => courseId === 'all' || data.groups.find(g => g.id === r.groupId)?.courseId === courseId);
    const totalStudents = shown.reduce((n, r) => n + r.active, 0);
    const totalPending = shown.reduce((n, r) => n + r.pending, 0);
    return <>
        <PageTitle
            kicker={t("ANÁLISIS Y SEGUIMIENTO")}
            title={t("Reportes de dirección")}
            description={t("Una vista consolidada de comisiones, asistencia y situación administrativa. Exportá datos ficticios para evaluar el formato de informe.")}
            action={<Button onClick={() => exportCsv(shown)} disabled={!shown.length}>
                <Download size={16} /> {t(" Exportar CSV")}</Button>}
        />
        <div className="statsGrid">
            <div className={Styles.statCard}>
                <div className={Styles.statLabel}>{t("Comisiones")}</div>
                <div className={Styles.statValue}>{t(shown.length)}</div>
                <span className="subText">{t("Incluidas en el informe")}</span>
            </div>
            <div className={Styles.statCard}>
                <div className={Styles.statLabel}>{t("Inscripciones activas")}</div>
                <div className={Styles.statValue}>{t(totalStudents)}</div>
                <span className="subText">{t("Una persona puede tener más de una inscripción")}</span>
            </div>
            <div className={Styles.statCard}>
                <div className={Styles.statLabel}>{t("Saldo pendiente")}</div>
                <div className={Styles.statValue} style={{ fontSize: 25 }}>{t(money(totalPending))}</div>
                <span className="subText">{t("Importes de demostración")}</span>
            </div>
        </div>
        <div className="sectionSpacer" />
        <Panel title={t("Informe por comisión")} subtitle={t("Comparativa académica y administrativa")}>
            <div className="filters">
                <select
                    className="filterSelect"
                    aria-label={t("Filtrar reporte por curso")}
                    value={courseId}
                    onChange={e => setCourseId(e.target.value)}
                >
                    <option value="all">{t("Todos los cursos")}</option>{data.courses.map(c => <option key={c.id} value={c.id}>{t(c.name)}</option>)}</select>
                <span className="muted">{t("La asistencia incluye faltas justificadas como positivas (solo a modo de ejemplo).")}</span>
            </div>
            <div className="tableWrap">
                <table className="dataTable">
                    <thead>
                        <tr>
                            <th>{t("Curso y comisión")}</th>
                            <th>{t("Tutor")}</th>
                            <th>{t("Alumnos")}</th>
                            <th>{t("Asistencia")}</th>
                            <th>{t("Promedio")}</th>
                            <th>{t("Saldo pendiente")}</th>
                        </tr>
                    </thead>
                    <tbody>{shown.map(r => <tr key={r.groupId}>
                        <td>
                            <strong>{t(r.course)}</strong>
                            <div className="muted">{t(r.group)}</div>
                        </td>
                        <td>{t(r.tutor)}</td>
                        <td>{t(r.active)} {t(" / ")}{t(r.capacity)}</td>
                        <td>
                            <Pill tone={r.attendance >= 75 ? 'success' : 'warning'}>{t(r.attendance)}{t("%")}</Pill>
                        </td>
                        <td>{t(r.average)} {t(" / 10")}</td>
                        <td>
                            <strong>{t(money(r.pending))}</strong>
                        </td>
                    </tr>)}</tbody>
                </table>{!shown.length && <EmptyState />}</div>
        </Panel>
        <div className="sectionSpacer" />
        <div className="cardGrid">
            <Panel title={t("Información académica")}>
                <div className={Styles.mutedBox}>
                    <UsersRound size={22} style={{ display: 'block', marginBottom: 11 }} />{t("Este reporte cuenta inscripciones activas por comisión. Para contar alumnos únicos, se agrupan las inscripciones por persona.")}</div>
            </Panel>
            <Panel title={t("Exportación CSV")}>
                <div className={Styles.mutedBox}>
                    <FileSpreadsheet size={22} style={{ display: 'block', marginBottom: 11 }} />{t("El archivo exportado se abre en Excel, LibreOffice y otras herramientas. No requiere un servidor externo.")}</div>
            </Panel>
            <Panel title={t("Indicadores de ejemplo")}>
                <div className={Styles.mutedBox}>
                    <BarChart3 size={22} style={{ display: 'block', marginBottom: 11 }} />{t("Los promedios y tasas son solo demostrativos. Las reglas reales de aprobación y asistencia deberán definirse con dirección.")}</div>
            </Panel>
        </div>
    </>;
}
