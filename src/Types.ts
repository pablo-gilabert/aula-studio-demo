/** Domain models for fictional users, teaching operations, and fee records. */
export type Role = 'admin' | 'tutor' | 'student';
export type Status = 'active' | 'paused' | 'completed';
export type AttendanceStatus = 'present' | 'absent' | 'justified';
export interface User {
    id: string;
    name: string;
    email: string;
    password: string; // DEMO ONLY. Never store plain-text passwords in a real system.
    role: Role;
    studentId?: string;
    active: boolean;
}
export interface Student {
    id: string;
    name: string;
    email: string;
    phone: string;
    doc: string;
    status: 'active' | 'inactive';
    registeredAt: string;
}
export interface Course {
    id: string;
    name: string;
    code: string;
    category: string;
    modality: 'Presencial' | 'Híbrida' | 'Virtual';
    duration: string;
    monthlyFee: number;
    description: string;
    active: boolean;
}
export interface Subject {
    id: string;
    courseId: string;
    name: string;
    hours: number;
}
export interface Group {
    id: string;
    courseId: string;
    name: string;
    tutorId: string;
    schedule: string;
    capacity: number;
    startDate: string;
}
export interface Enrollment {
    id: string;
    studentId: string;
    groupId: string;
    date: string;
    status: Status;
}
export interface ClassSession {
    id: string;
    groupId: string;
    subjectId: string;
    date: string;
    topic: string;
}
export interface Attendance {
    id: string;
    sessionId: string;
    studentId: string;
    status: AttendanceStatus;
}
export interface Evaluation {
    id: string;
    groupId: string;
    subjectId: string;
    title: string;
    date: string;
    maxScore: number;
}
export interface Grade {
    id: string;
    evaluationId: string;
    studentId: string;
    score: number;
    feedback: string;
}
export interface Charge {
    id: string;
    studentId: string;
    enrollmentId: string;
    concept: string;
    amount: number;
    dueDate: string;
}
export interface Payment {
    id: string;
    chargeId: string;
    amount: number;
    method: 'Efectivo' | 'Transferencia' | 'Tarjeta';
    date: string;
}
export interface Announcement {
    id: string;
    title: string;
    body: string;
    audience: 'all' | 'students' | 'tutors';
    authorId: string;
    date: string;
}
export interface Activity {
    id: string;
    actor: string;
    message: string;
    date: string;
}
export interface DemoData {
    users: User[];
    students: Student[];
    courses: Course[];
    subjects: Subject[];
    groups: Group[];
    enrollments: Enrollment[];
    sessions: ClassSession[];
    attendance: Attendance[];
    evaluations: Evaluation[];
    grades: Grade[];
    charges: Charge[];
    payments: Payment[];
    announcements: Announcement[];
    activity: Activity[];
}
