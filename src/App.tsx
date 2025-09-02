import { Routes, Route } from 'react-router-dom';
import DynamicPage from './components/DynamicPage';
import InvoiceQuery from './pages/InvoiceQuery';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import PageEditor from './pages/PageEditor';
import PortalUsuario from './pages/PortalUsuario';

function App() {
  return (
    <Routes>
      {/* Página de inicio dinámica */}
      <Route path="/" element={<DynamicPage />} />
      
      {/* Rutas dinámicas con /page/ prefix */}
      <Route path="/page/:slug" element={<DynamicPage />} />
      
      {/* Rutas directas para compatibilidad */}
      <Route path="/quienes-somos" element={<DynamicPage />} />
      <Route path="/informacion-esal" element={<DynamicPage />} />
      <Route path="/operacion-gestion" element={<DynamicPage />} />
      <Route path="/portal-usuario" element={<PortalUsuario />} />
      <Route path="/page/portal-usuario" element={<PortalUsuario />} />
      <Route path="/normatividad" element={<DynamicPage />} />
      <Route path="/contacto" element={<DynamicPage />} />
      
      {/* Consulta de facturas */}
      <Route path="/consulta-facturas" element={<InvoiceQuery />} />
      
      {/* Rutas de administración */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/editor/:id" element={<PageEditor />} />
      <Route path="/admin/editor/new" element={<PageEditor />} />
    </Routes>
  );
}

export default App;