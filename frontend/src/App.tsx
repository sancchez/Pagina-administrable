import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PageRenderer from './components/PageRenderer';
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import ContentManagement from './admin/ContentManagement';
import InvoiceManagement from './admin/InvoiceManagement';
import PQRManagement from './admin/PQRManagement';
import UserManagement from './admin/UserManagement';
import ReportsAnalytics from './admin/ReportsAnalytics';
import PaymentsBilling from './admin/PaymentsBilling';
import SystemSettings from './admin/SystemSettings';
import GrapesEditor from './admin/GrapesEditor';
import PageMigrator from './admin/PageMigrator';
import PageMigration from './admin/PageMigration';
import BackupManager from './admin/BackupManager';
import PreviewFrame from './components/PreviewFrame';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas administrativas */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="content" element={<ContentManagement />} />
            <Route path="invoices" element={<InvoiceManagement />} />
            <Route path="pqr" element={<PQRManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="reports" element={<ReportsAnalytics />} />
            <Route path="payments" element={<PaymentsBilling />} />
            <Route path="settings" element={<SystemSettings />} />
            <Route path="migrator" element={<PageMigrator />} />
            <Route path="migration" element={<PageMigration />} />
            <Route path="backups" element={<BackupManager />} />
            {/* Rutas del editor unificadas por slug */}
            <Route path="editor/:slug" element={<GrapesEditor />} />
            <Route path="editor" element={<Navigate to="/admin/dashboard/editor/home" replace />} />
          </Route>
          
          {/* Ruta para vista previa de páginas */}
          <Route path="/preview/:slug" element={<PreviewFrame />} />
          
          {/* Rutas públicas dinámicas - PageRenderer maneja todas las páginas desde la DB */}
          <Route path="/" element={<PageRenderer />} />
          <Route path="/:slug" element={<PageRenderer />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;