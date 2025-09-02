import React, { ReactNode } from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';

interface EditableLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function EditableLayout({ children, className = '' }: EditableLayoutProps) {
  return (
    <div 
      className={`min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-green-100 ${className}`}
      data-editable-type="layout-principal"
      data-background-editable="true"
      data-movable="true"
      style={{ minHeight: '100vh' }}
    >
      {/* Fondo editable con gradiente */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-blue-100 via-blue-50 to-green-100"
        data-editable-type="fondo-principal"
        data-background-editable="true"
        data-movable="true"
        style={{ zIndex: -1 }}
      ></div>
      
      {/* Navbar editable */}
      <div 
        data-editable-type="navbar-container"
        data-movable="true"
        className="relative z-10"
      >
        <Navbar />
      </div>
      
      {/* Contenido principal editable */}
      <main 
        data-editable-type="contenido-principal"
        data-movable="true"
        className="relative z-10"
      >
        {children}
      </main>
      
      {/* Footer editable */}
      <div 
        data-editable-type="footer-container"
        data-movable="true"
        className="relative z-10"
      >
        <Footer />
      </div>
    </div>
  );
}