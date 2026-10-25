/** App view: role-aware academic workflows and UI presentation. */
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Shell } from './components/Shell/Shell';
import { useDemo } from './context/DemoContext';
import { usePreferences } from './i18n/Preferences';
import { canSee, type Section } from './lib/Permissions';
import { Login } from './pages/Login/Login';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Students } from './pages/Students/Students';
import { Courses } from './pages/Courses/Courses';
import { Enrollments } from './pages/Enrollments/Enrollments';
import { Attendance } from './pages/Attendance/Attendance';
import { Evaluations } from './pages/Evaluations/Evaluations';
import { Finance } from './pages/Finance/Finance';
import { Reports } from './pages/Reports/Reports';
import { Announcements } from './pages/Announcements/Announcements';
import { Users } from './pages/Users/Users';
import { Profile } from './pages/Profile/Profile';
// The route registry contains every academic feature page.
const SECTIONS: Record<Section, ReactNode> = {
    dashboard: <Dashboard />,
    students: <Students />,
    courses: <Courses />,
    enrollments: <Enrollments />,
    attendance: <Attendance />,
    evaluations: <Evaluations />,
    finance: <Finance />,
    reports: <Reports />,
    announcements: <Announcements />,
    users: <Users />,
    profile: <Profile />,
};
// The route guard redirects users away from modules they cannot access.
function SectionPage() {
    const { user } = useDemo();
    const { section } = useParams();
    if (!user)
        return <Navigate to="/login" replace />;
    if (!section || !(section in SECTIONS) || !canSee(user.role, section as Section))
        return <Navigate to="/app/dashboard" replace />;
    return SECTIONS[section as Section];
}
function Guard({ children }: {
    children: ReactNode;
}) {
    const { user } = useDemo();
    return user ? <>{children}</> : <Navigate to="/login" replace />;
}
function Guest() { const { user } = useDemo(); return user ? <Navigate to="/app/dashboard" replace /> : <Login />; }
export default function App() {
    const { locale } = usePreferences();
    return <Routes key={locale}>
        <Route path="/login" element={<Guest />} />
        <Route path="/app" element={<Guard>
            <Shell />
        </Guard>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path=":section" element={<SectionPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>;
}
