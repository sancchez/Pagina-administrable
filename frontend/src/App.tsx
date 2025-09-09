import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import DynamicPage from './pages/DynamicPage';
import QuienesSomos from './pages/QuienesSomos';
import InformacionESAL from './pages/InformacionESAL';
import OperacionGestion from './pages/OperacionGestion';
import PortalUsuario from './pages/PortalUsuario';
import Normatividad from './pages/Normatividad';
import Contacto from './pages/Contacto';
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import ContentManagement from './admin/ContentManagement';
import InvoiceManagement from './admin/InvoiceManagement';
import PQRManagement from './admin/PQRManagement';
import UserManagement from './admin/UserManagement';
import ReportsAnalytics from './admin/ReportsAnalytics';
import SystemSettings from './admin/SystemSettings';
import AdminEditor from './admin/AdminEditor';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quienes-somos" element={<QuienesSomos />} />
        <Route path="/informacion-esal" element={<InformacionESAL />} />
        <Route path="/operacion-gestion" element={<OperacionGestion />} />
        <Route path="/portal-usuario" element={<PortalUsuario />} />
        <Route path="/normatividad" element={<Normatividad />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="content" element={<ContentManagement />} />
          <Route path="invoices" element={<InvoiceManagement />} />
          <Route path="pqr" element={<PQRManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="reports" element={<ReportsAnalytics />} />
          <Route path="settings" element={<SystemSettings />} />
          {/* Rutas del editor movidas aquí */}
          <Route path="editor/:id" element={<AdminEditor />} />
          <Route path="editor/new" element={<AdminEditor />} />
        </Route>
        {/* Eliminar estas rutas duplicadas */}
        {/* <Route path="/admin/editor/:id" element={<AdminEditor />} />
        <Route path="/admin/editor/new" element={<AdminEditor />} /> */}
      </Routes>
    </AuthProvider>
  );
}

export default App;