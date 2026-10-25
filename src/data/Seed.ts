/** Stable demo fixtures representing a small, fictional teaching institution. */
import type { DemoData, Student, AttendanceStatus } from '../Types';
import { isoDay } from '../lib/Utils';
export function createSeed(): DemoData {
    // Student and account fixtures establish linked identities across the demo.
    const names = ['Martina González', 'Lucas Fernández', 'Sofía Martínez', 'Facundo Pérez', 'Valentina Ramírez', 'Agustín López', 'Camila Torres', 'Joaquín Castro', 'Julieta Álvarez', 'Tomás Romero', 'Milagros Herrera', 'Nicolás Benítez', 'Florencia Molina', 'Matías Duarte', 'Abril Sánchez', 'Bruno Medina', 'Lucía Rojas', 'Pilar Gómez'];
    const students: Student[] = names.map((name, i) => ({
        id: `s${i + 1}`, name, email: `${name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ /g, '.')}@ejemplo.demo`,
        phone: `11 5000-${String(1100 + i)}`, doc: `40.${String(100 + i)}.${String(200 + i)}`, status: i === 15 ? 'inactive' : 'active', registeredAt: isoDay(-110 + i * 3),
    }));
    const users: DemoData['users'] = [
        { id: 'u-admin', name: 'Victoria Salvatierra', email: 'admin@demo.academia', password: 'Demo2026!', role: 'admin', active: true },
        { id: 'u-tutor', name: 'Gabriel Ortega', email: 'tutor@demo.academia', password: 'Demo2026!', role: 'tutor', active: true },
        { id: 'u-tutor2', name: 'Valeria Paz', email: 'valeria@demo.academia', password: 'Demo2026!', role: 'tutor', active: true },
        { id: 'u-student', name: names[0], email: 'alumno@demo.academia', password: 'Demo2026!', role: 'student', studentId: 's1', active: true },
        { id: 'u-student2', name: names[1], email: 'lucas@demo.academia', password: 'Demo2026!', role: 'student', studentId: 's2', active: true },
    ];
    // Course offerings, subjects, groups, and enrollments form the catalog.
    const courses: DemoData['courses'] = [
        { id: 'c1', name: 'Estilismo profesional', code: 'EST-101', category: 'Carrera profesional', modality: 'Presencial', duration: '24 meses', monthlyFee: 92000, description: 'Formación integral en corte, color y estilismo.', active: true },
        { id: 'c2', name: 'Colorimetría avanzada', code: 'COL-204', category: 'Especialización', modality: 'Híbrida', duration: '5 meses', monthlyFee: 76000, description: 'Técnicas de color, diagnóstico y corrección.', active: true },
        { id: 'c3', name: 'Barbería profesional', code: 'BAR-110', category: 'Formación inicial', modality: 'Presencial', duration: '8 meses', monthlyFee: 68000, description: 'Fundamentos de barbería, afeitado y diseño.', active: true },
        { id: 'c4', name: 'Peinados editoriales', code: 'PEI-320', category: 'Taller', modality: 'Presencial', duration: '6 semanas', monthlyFee: 54000, description: 'Tendencias y técnicas de peinados de alta moda.', active: true },
    ];
    const subjects: DemoData['subjects'] = [
        { id: 'sub1', courseId: 'c1', name: 'Fundamentos del corte', hours: 64 },
        { id: 'sub2', courseId: 'c1', name: 'Color y diagnóstico', hours: 52 },
        { id: 'sub3', courseId: 'c1', name: 'Técnicas de peinado', hours: 42 },
        { id: 'sub4', courseId: 'c2', name: 'Teoría del color', hours: 48 },
        { id: 'sub5', courseId: 'c2', name: 'Corrección de color', hours: 36 },
        { id: 'sub6', courseId: 'c3', name: 'Corte masculino', hours: 64 },
        { id: 'sub7', courseId: 'c3', name: 'Barba y afeitado', hours: 38 },
        { id: 'sub8', courseId: 'c4', name: 'Peinados de editorial', hours: 32 },
    ];
    const groups: DemoData['groups'] = [
        { id: 'g1', courseId: 'c1', name: 'Turno mañana · A', tutorId: 'u-tutor', schedule: 'Lun. y mié. · 09:00', capacity: 22, startDate: isoDay(-105) },
        { id: 'g2', courseId: 'c1', name: 'Turno tarde · B', tutorId: 'u-tutor2', schedule: 'Mar. y jue. · 15:00', capacity: 20, startDate: isoDay(-94) },
        { id: 'g3', courseId: 'c2', name: 'Coloristas · A', tutorId: 'u-tutor2', schedule: 'Vie. · 14:00', capacity: 14, startDate: isoDay(-75) },
        { id: 'g4', courseId: 'c3', name: 'Barbería · A', tutorId: 'u-tutor', schedule: 'Sáb. · 10:00', capacity: 18, startDate: isoDay(-86) },
        { id: 'g5', courseId: 'c4', name: 'Editorial · A', tutorId: 'u-tutor', schedule: 'Mar. · 18:00', capacity: 12, startDate: isoDay(-24) },
    ];
    const groupByStudent = ['g1', 'g1', 'g1', 'g1', 'g1', 'g1', 'g2', 'g2', 'g2', 'g2', 'g3', 'g3', 'g3', 'g4', 'g4', 'g4', 'g5', 'g5'];
    const enrollments: DemoData['enrollments'] = students.map((s, i) => ({ id: `en${i + 1}`, studentId: s.id, groupId: groupByStudent[i], date: isoDay(-76 + i), status: s.status === 'inactive' ? 'paused' : 'active' }));
    // Second enrollment shows students can belong to more than one course.
    enrollments.push({ id: 'en19', studentId: 's1', groupId: 'g3', date: isoDay(-43), status: 'active' });
    // Class meetings and assessments feed teacher and student workflows.
    const sessions: DemoData['sessions'] = [
        { id: 'cl1', groupId: 'g1', subjectId: 'sub1', date: isoDay(-14), topic: 'Técnicas fundamentales de corte' },
        { id: 'cl2', groupId: 'g1', subjectId: 'sub1', date: isoDay(-7), topic: 'Cortes estructurados' },
        { id: 'cl3', groupId: 'g1', subjectId: 'sub2', date: isoDay(-2), topic: 'Diagnóstico capilar' },
        { id: 'cl4', groupId: 'g2', subjectId: 'sub1', date: isoDay(-6), topic: 'Práctica de secciones' },
        { id: 'cl5', groupId: 'g3', subjectId: 'sub4', date: isoDay(-5), topic: 'Bases de colorimetría' },
        { id: 'cl6', groupId: 'g4', subjectId: 'sub6', date: isoDay(-4), topic: 'Degradados clásicos' },
        { id: 'cl7', groupId: 'g5', subjectId: 'sub8', date: isoDay(-1), topic: 'Texturas y volumen' },
    ];
    const attendance: DemoData['attendance'] = sessions.flatMap((session, idx) => {
        return enrollments.filter(en => en.groupId === session.groupId && en.status !== 'completed').map((en, si) => {
            const status: AttendanceStatus = (si + idx) % 9 === 0 ? 'justified' : (si + idx) % 6 === 0 ? 'absent' : 'present';
            return { id: `at-${session.id}-${en.studentId}`, sessionId: session.id, studentId: en.studentId, status };
        });
    });
    const evaluations: DemoData['evaluations'] = [
        { id: 'ev1', groupId: 'g1', subjectId: 'sub1', title: 'Evaluación práctica I', date: isoDay(-8), maxScore: 10 },
        { id: 'ev2', groupId: 'g1', subjectId: 'sub2', title: 'Diagnóstico y teoría', date: isoDay(9), maxScore: 10 },
        { id: 'ev3', groupId: 'g2', subjectId: 'sub1', title: 'Práctica de corte', date: isoDay(-5), maxScore: 10 },
        { id: 'ev4', groupId: 'g3', subjectId: 'sub4', title: 'Colorimetría · parcial', date: isoDay(-3), maxScore: 10 },
        { id: 'ev5', groupId: 'g4', subjectId: 'sub6', title: 'Degradado técnico', date: isoDay(6), maxScore: 10 },
    ];
    const grades: DemoData['grades'] = evaluations.filter(ev => ev.date <= isoDay()).flatMap((ev, idx) => enrollments.filter(en => en.groupId === ev.groupId).map((en, i) => ({
        id: `gr-${ev.id}-${en.studentId}`, evaluationId: ev.id, studentId: en.studentId, score: 6 + (i + idx) % 5, feedback: ''
    })));
    // Fictional charges and payments provide an administrative use case.
    const charges: DemoData['charges'] = enrollments.filter(en => en.status === 'active').flatMap((en, i) => {
        const group = groups.find(g => g.id === en.groupId)!;
        const course = courses.find(c => c.id === group.courseId)!;
        return [
            { id: `ch-${en.id}-prev`, studentId: en.studentId, enrollmentId: en.id, concept: `Cuota anterior · ${course.name}`, amount: course.monthlyFee, dueDate: isoDay(-18) },
            { id: `ch-${en.id}-now`, studentId: en.studentId, enrollmentId: en.id, concept: `Cuota actual · ${course.name}`, amount: course.monthlyFee, dueDate: isoDay(12 + i % 7) },
        ];
    });
    const payments: DemoData['payments'] = charges.flatMap((ch, i) => {
        if (i % 7 === 0)
            return [];
        if (i % 5 === 0)
            return [{ id: `pay-${ch.id}`, chargeId: ch.id, amount: Math.round(ch.amount * .5), method: 'Transferencia' as const, date: isoDay(-7) }];
        if (ch.dueDate > isoDay() && i % 3 === 0)
            return [];
        return [{ id: `pay-${ch.id}`, chargeId: ch.id, amount: ch.amount, method: 'Transferencia' as const, date: isoDay(-6) }];
    });
    // News and audit items complete the management overview.
    const announcements: DemoData['announcements'] = [
        { id: 'ann1', title: 'Inscripciones al próximo ciclo', body: 'Ya se encuentra habilitada la preinscripción al próximo período académico. Consultá en administración para conocer las opciones disponibles.', audience: 'all', authorId: 'u-admin', date: isoDay(-1) },
        { id: 'ann2', title: 'Materiales para el taller', body: 'Recordamos traer herramientas de corte y el kit de trabajo para las prácticas de esta semana.', audience: 'students', authorId: 'u-tutor', date: isoDay(-3) },
        { id: 'ann3', title: 'Reunión de docentes', body: 'El próximo encuentro de coordinación será el viernes a las 18:00.', audience: 'tutors', authorId: 'u-admin', date: isoDay(-4) },
    ];
    const activity: DemoData['activity'] = [
        { id: 'ac1', actor: 'Victoria Salvatierra', message: 'Actualizó los datos de una inscripción', date: isoDay(-1) },
        { id: 'ac2', actor: 'Gabriel Ortega', message: 'Cargó las asistencias del turno mañana', date: isoDay(-2) },
        { id: 'ac3', actor: 'Valeria Paz', message: 'Publicó las calificaciones de una evaluación', date: isoDay(-3) },
    ];
    return { users, students, courses, subjects, groups, enrollments, sessions, attendance, evaluations, grades, charges, payments, announcements, activity };
}
