/** Client-side role rules and scoped queries for demonstration purposes only. */
import type { DemoData, Role, User } from '../Types';
export type Section = 'dashboard' | 'students' | 'courses' | 'enrollments' | 'attendance' | 'evaluations' | 'finance' | 'reports' | 'announcements' | 'users' | 'profile';
const access: Record<Section, Role[]> = {
    dashboard: ['admin', 'tutor', 'student'],
    students: ['admin', 'tutor'],
    courses: ['admin', 'tutor', 'student'],
    enrollments: ['admin', 'tutor', 'student'],
    attendance: ['admin', 'tutor', 'student'],
    evaluations: ['admin', 'tutor', 'student'],
    finance: ['admin', 'student'],
    reports: ['admin'],
    announcements: ['admin', 'tutor', 'student'],
    users: ['admin'],
    profile: ['admin', 'tutor', 'student'],
};
export const canSee = (role: Role, section: Section) => access[section].includes(role);
export const canTeachGroup = (user: User, groupId: string, data: DemoData) => user.role === 'admin' || (user.role === 'tutor' && data.groups.some(g => g.id === groupId && g.tutorId === user.id));
export const scopedGroupIds = (user: User, data: DemoData): string[] => user.role === 'admin' ? data.groups.map(g => g.id) : user.role === 'tutor' ? data.groups.filter(g => g.tutorId === user.id).map(g => g.id) : data.enrollments.filter(en => en.studentId === user.studentId).map(en => en.groupId);
export const groupName = (id: string, data: DemoData) => {
    const g = data.groups.find(x => x.id === id);
    return g ? `${data.courses.find(c => c.id === g.courseId)?.name ?? 'Curso'} · ${g.name}` : 'Sin comisión';
};
export const courseName = (id: string, data: DemoData) => data.courses.find(c => c.id === id)?.name ?? 'Curso';
export const studentName = (id: string, data: DemoData) => data.students.find(s => s.id === id)?.name ?? 'Alumno';
export const tutorName = (id: string, data: DemoData) => data.users.find(u => u.id === id)?.name ?? 'Sin tutor';
export const outstanding = (chargeId: string, data: DemoData): number => {
    const charge = data.charges.find(c => c.id === chargeId);
    return charge ? Math.max(0, charge.amount - data.payments.filter(p => p.chargeId === chargeId).reduce((sum, p) => sum + p.amount, 0)) : 0;
};
