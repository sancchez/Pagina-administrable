@@ .. @@
 import { Routes, Route } from 'react-router-dom';
+import { AuthProvider } from './context/AuthContext';
 import HomePage from './pages/HomePage';
 import QuienesSomos from './pages/QuienesSomos';
 import InformacionESAL from './pages/InformacionESAL';
@@ .. @@
 import PortalUsuario from './pages/PortalUsuario';
 import Normatividad from './pages/Normatividad';
 import Contacto from './pages/Contacto';
-import AdminLogin from './pages/AdminLogin';
+import AdminLogin from './admin/AdminLogin';
+import AdminLayout from './admin/AdminLayout';
+import AdminDashboard from './admin/AdminDashboard';
+import ContentManagement from './admin/ContentManagement';
+import InvoiceManagement from './admin/InvoiceManagement';
+import PQRManagement from './admin/PQRManagement';
+import UserManagement from './admin/UserManagement';
+import ReportsAnalytics from './admin/ReportsAnalytics';
+import SystemSettings from './admin/SystemSettings';
 
 function App() {
   return (
-    <Routes>
-      <Route path="/" element={<HomePage />} />
-      <Route path="/quienes-somos" element={<QuienesSomos />} />
-      <Route path="/informacion-esal" element={<InformacionESAL />} />
-      <Route path="/operacion-gestion" element={<OperacionGestion />} />
-      <Route path="/portal-usuario" element={<PortalUsuario />} />
-      <Route path="/normatividad" element={<Normatividad />} />
-      <Route path="/contacto" element={<Contacto />} />
-      <Route path="/admin" element={<AdminLogin />} />
-    </Routes>
+    <AuthProvider>
+      <Routes>
+        <Route path="/" element={<HomePage />} />
+        <Route path="/quienes-somos" element={<QuienesSomos />} />
+        <Route path="/informacion-esal" element={<InformacionESAL />} />
+        <Route path="/operacion-gestion" element={<OperacionGestion />} />
+        <Route path="/portal-usuario" element={<PortalUsuario />} />
+        <Route path="/normatividad" element={<Normatividad />} />
+        <Route path="/contacto" element={<Contacto />} />
+        <Route path="/admin" element={<AdminLogin />} />
+        <Route path="/admin/dashboard" element={<AdminLayout />}>
+          <Route index element={<AdminDashboard />} />
+          <Route path="content" element={<ContentManagement />} />
+          <Route path="invoices" element={<InvoiceManagement />} />
+          <Route path="pqr" element={<PQRManagement />} />
+          <Route path="users" element={<UserManagement />} />
+          <Route path="reports" element={<ReportsAnalytics />} />
+          <Route path="settings" element={<SystemSettings />} />
+        </Route>
+      </Routes>
+    </AuthProvider>
   );
 }
 
 export default App;