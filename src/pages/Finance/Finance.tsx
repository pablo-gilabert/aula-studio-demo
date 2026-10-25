/** Finance view: role-aware academic workflows and UI presentation. */
import { t } from '../../i18n/Translations';
import { useState } from 'react';
import { CreditCard, HandCoins, Plus, Search, Wallet } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { groupName, outstanding, studentName } from '../../lib/Permissions';
import { dateLabel, isoDay, money, uid } from '../../lib/Utils';
import type { Charge, Payment } from '../../Types';
import { Avatar, Button, EmptyState, Modal, PageTitle, Panel, Pill, SelectInput, TextInput } from '../../components/Common/Common';
import Styles from '../../styles/PageShared.module.css';
const feeStatus = (charge: Charge, due: number): 'success' | 'warning' | 'danger' => due === 0 ? 'success' : charge.dueDate < isoDay() ? 'danger' : 'warning';
// Simulate tuition charges, partial payments, and outstanding balances.
export function Finance() {
    const { data, user, update } = useDemo();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [chargeOpen, setChargeOpen] = useState(false);
    const [payCharge, setPayCharge] = useState<Charge | null>(null);
    const [studentId, setStudentId] = useState('');
    const [enrollmentId, setEnrollmentId] = useState('');
    const [concept, setConcept] = useState('Cuota mensual');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState(isoDay(10));
    const [payAmount, setPayAmount] = useState('');
    const [method, setMethod] = useState<Payment['method']>('Transferencia');
    const [error, setError] = useState('');
    if (!user || user.role === 'tutor')
        return null;
    const admin = user.role === 'admin';
    const charges = data.charges.filter(ch => (admin || ch.studentId === user.studentId) && `${studentName(ch.studentId, data)} ${ch.concept}`.toLowerCase().includes(search.toLowerCase())).filter(ch => filter === 'all' || (filter === 'paid' ? outstanding(ch.id, data) === 0 : filter === 'pending' ? outstanding(ch.id, data) > 0 : ch.dueDate < isoDay() && outstanding(ch.id, data) > 0)).slice().sort((a, b) => b.dueDate.localeCompare(a.dueDate));
    const all = data.charges.filter(ch => admin || ch.studentId === user.studentId);
    const total = all.reduce((sum, ch) => sum + ch.amount, 0);
    const paid = all.reduce((sum, ch) => sum + ch.amount - outstanding(ch.id, data), 0);
    const pending = total - paid;
    const availableEnrollment = data.enrollments.filter(e => e.studentId === (studentId || data.students[0]?.id) && e.status === 'active');
    const effectiveEnrollment = availableEnrollment.some(e => e.id === enrollmentId) ? enrollmentId : (availableEnrollment[0]?.id ?? '');
    const newCharge = (e: React.FormEvent) => {
        e.preventDefault();
        if (!admin || !effectiveEnrollment || !(Number(amount) > 0) || !concept.trim())
            return;
        const enroll = data.enrollments.find(en => en.id === effectiveEnrollment)!;
        const ch: Charge = { id: uid('charge'), studentId: enroll.studentId, enrollmentId: enroll.id, concept: concept.trim(), amount: Math.round(Number(amount) * 100) / 100, dueDate };
        update('Generó un nuevo cargo administrativo', prev => ({ ...prev, charges: [...prev.charges, ch] }));
        setChargeOpen(false);
        setAmount('');
        setError('');
    };
    const newPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!admin || !payCharge)
            return;
        const due = outstanding(payCharge.id, data);
        const n = Number(payAmount);
        if (!Number.isFinite(n) || n <= 0 || Math.round(n * 100) / 100 > due) {
            setError(`El pago debe ser mayor que cero y no superar ${money(due)}.`);
            return;
        }
        const payment: Payment = { id: uid('payment'), chargeId: payCharge.id, amount: Math.round(n * 100) / 100, method, date: isoDay() };
        update('Registró un pago administrativo', prev => ({ ...prev, payments: [...prev.payments, payment] }));
        setPayCharge(null);
        setError('');
    };
    return <>
        <PageTitle
            kicker={t("GESTIÓN ADMINISTRATIVA")}
            title={t(admin ? 'Cuotas y pagos' : 'Mis cuotas')}
            description={t(admin ? 'Registrá importes, vencimientos y pagos. No se realizan cobros reales.' : 'Consultá el estado de tus cuotas y los pagos registrados por administración.')}
            action={admin ? <Button onClick={() => { setStudentId(data.students[0]?.id ?? ''); setEnrollmentId(''); setChargeOpen(true); }}>
                <Plus size={16} /> {t(" Generar cuota")}</Button> : undefined}
        />
        <div className="statsGrid">
            <div className={Styles.statCard}>
                <div className={Styles.statLabel}>{t("Total facturado (simulado)")}</div>
                <div className={Styles.statValue} style={{ fontSize: 25 }}>{t(money(total))}</div>
                <span className="subText">{t("Importes cargados en el sistema")}</span>
            </div>
            <div className={Styles.statCard}>
                <div className={Styles.statLabel}>{t("Pagos registrados")}</div>
                <div className={Styles.statValue} style={{ fontSize: 25 }}>{t(money(paid))}</div>
                <span className="subText">{t("No representan dinero real")}</span>
            </div>
            <div className={Styles.statCard}>
                <div className={Styles.statLabel}>{t("Saldo pendiente")}</div>
                <div className={Styles.statValue} style={{ fontSize: 25 }}>{t(money(pending))}</div>
                <span className="subText">{t("Cargos con saldo abierto")}</span>
            </div>
            <div className={Styles.statCard}>
                <div className={Styles.statLabel}>{t("Cuotas pendientes")}</div>
                <div className={Styles.statValue}>{t(all.filter(ch => outstanding(ch.id, data) > 0).length)}</div>
                <span className="subText">{t("Pagos parciales o sin pagar")}</span>
            </div>
        </div>
        <div className="sectionSpacer" />
        <Panel
            title={t(admin ? 'Detalle de cuentas corrientes' : 'Mi cuenta corriente')}
            subtitle={t("Consulta detallada de cargos y pagos ficticios")}
        >
            <div className="filters">{admin && <div className="searchWrap">
                <Search size={16} />
                <input
                    aria-label={t("Buscar cargos")}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={t("Buscar alumno o concepto...")}
                />
            </div>}<select aria-label={t("Filtrar cuotas")} className="filterSelect" value={filter} onChange={e => setFilter(e.target.value)}>
                    <option value="all">{t("Todas las cuotas")}</option>
                    <option value="paid">{t("Pagadas")}</option>
                    <option value="pending">{t("Con saldo pendiente")}</option>
                    <option value="overdue">{t("Vencidas")}</option>
                </select>
            </div>
            <div className="tableWrap">
                <table className="dataTable">
                    <thead>
                        <tr>{admin && <th>{t("Alumno")}</th>}<th>{t("Concepto")}</th>
                            <th>{t("Vencimiento")}</th>
                            <th>{t("Importe")}</th>
                            <th>{t("Saldo")}</th>
                            <th>{t("Estado")}</th>{admin && <th>{t("Acciones")}</th>}</tr>
                    </thead>
                    <tbody>{charges.map(ch => {
                        const due = outstanding(ch.id, data); const tone = feeStatus(ch, due); return <tr key={ch.id}>{admin && <td>
                            <div className="tablePerson">
                                <Avatar name={studentName(ch.studentId, data)} size="small" />
                                <strong>{t(studentName(ch.studentId, data))}</strong>
                            </div>
                        </td>}<td>
                                <strong>{t(ch.concept)}</strong>
                                <div className="muted">{t(groupName(data.enrollments.find(e => e.id === ch.enrollmentId)?.groupId ?? '', data))}</div>
                            </td>
                            <td>{t(dateLabel(ch.dueDate))}</td>
                            <td>{t(money(ch.amount))}</td>
                            <td>
                                <strong>{t(money(due))}</strong>
                            </td>
                            <td>
                                <Pill tone={tone}>{t(due === 0 ? 'Pagada' : due < ch.amount ? 'Parcial' : tone === 'danger' ? 'Vencida' : 'Pendiente')}</Pill>
                            </td>{admin && <td>{due > 0 ? <button className="miniButton" type="button" onClick={() => { setPayCharge(ch); setPayAmount(String(due)); setError(''); }}>
                                <HandCoins size={14} /> {t(" Registrar pago")}</button> : <span className="muted">{t("Completa")}</span>}</td>}</tr>;
                    })}</tbody>
                </table>{!charges.length && <EmptyState title={t("No hay cuotas")} message={t("No encontramos importes para mostrar.")} />}</div>
        </Panel>
        <div className="sectionSpacer" />
        <p className="helpLine">
            <CreditCard size={14} style={{ verticalAlign: 'middle' }} /> {t(" Demostración administrativa sin cobros, integraciones bancarias ni emisión de comprobantes fiscales.")}</p>
        {chargeOpen && <Modal
            title={t("Generar nueva cuota")}
            subtitle={t("Creá un cargo ficticio para una inscripción activa.")}
            onClose={() => setChargeOpen(false)}
        >
            <form className="formStack" onSubmit={newCharge}>
                <SelectInput
                    label={t("Alumno")}
                    value={studentId || data.students[0]?.id || ''}
                    onChange={v => { setStudentId(v); setEnrollmentId(''); }}
                    options={data.students.filter(s => data.enrollments.some(e => e.studentId === s.id && e.status === 'active')).map(s => ({ value: s.id, label: s.name }))}
                />
                <SelectInput
                    label={t("Inscripción")}
                    value={effectiveEnrollment}
                    onChange={setEnrollmentId}
                    options={availableEnrollment.map(en => ({ value: en.id, label: groupName(en.groupId, data) }))}
                />
                <TextInput required label={t("Concepto")} value={concept} onChange={setConcept} />
                <div className="formGrid">
                    <TextInput required type="number" min={1} label={t("Importe (ARS)")} value={amount} onChange={setAmount} />
                    <TextInput required type="date" label={t("Vencimiento")} value={dueDate} onChange={setDueDate} />
                </div>{error && <p className="helpLine" className="formError">{t(error)}</p>}<div className="formActions">
                    <Button variant="secondary" onClick={() => setChargeOpen(false)}>{t("Cancelar")}</Button>
                    <Button type="submit" disabled={!effectiveEnrollment || !(Number(amount) > 0)}>
                        <Wallet size={15} /> {t(" Guardar cuota")}</Button>
                </div>
            </form>
        </Modal>}
        {payCharge && <Modal
            title={t("Registrar pago")}
            subtitle={t(`${studentName(payCharge.studentId, data)} · ${payCharge.concept}`)}
            onClose={() => setPayCharge(null)}
        >
            <form className="formStack" onSubmit={newPayment}>
                <div className={Styles.alertCard}>{t("Saldo a cancelar: ")}<strong>{t(money(outstanding(payCharge.id, data)))}</strong>
                </div>
                <TextInput
                    required
                    type="number"
                    min={0.01}
                    step={0.01}
                    max={outstanding(payCharge.id, data)}
                    label={t("Monto recibido (ARS)")}
                    value={payAmount}
                    onChange={setPayAmount}
                />
                <SelectInput
                    label={t("Medio de pago")}
                    value={method}
                    onChange={v => setMethod(v as Payment['method'])}
                    options={['Transferencia', 'Efectivo', 'Tarjeta'].map(v => ({ value: v, label: v }))}
                />{error && <p className="helpLine" role="alert" className="formError">{t(error)}</p>}<div className="formActions">
                    <Button variant="secondary" onClick={() => setPayCharge(null)}>{t("Cancelar")}</Button>
                    <Button type="submit">{t("Registrar pago ficticio")}</Button>
                </div>
            </form>
        </Modal>}
    </>;
}
