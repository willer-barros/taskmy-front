import TaskmySidebar from '../../components/TaskmySidebar';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <TaskmySidebar>{children}</TaskmySidebar>
    </ProtectedRoute>

  );
}