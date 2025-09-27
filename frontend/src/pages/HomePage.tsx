import React from 'react';
import Layout from '../components/Layout';
import StatsCards from '../components/StatsCards';
import ServicesSection from '../components/ServicesSection';
import { Droplets, Shield, Clock, Users, ArrowRight, CheckCircle } from 'lucide-react';

// Hero Section moderno y profesional
const HeroSection = () => (
  <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 text-white py-24 overflow-hidden">
    {/* Elementos decorativos de fondo */}
    <div className="absolute inset-0 bg-black/10"></div>
    <div className="absolute top-0 left-0 w-full h-full">
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-green-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-blue-300/20 rounded-full blur-lg animate-pulse delay-500"></div>
    </div>
    
    <div className="relative container mx-auto px-4 text-center">
      <div className="max-w-4xl mx-auto">
        {/* Badge superior */}
        <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-8 border border-white/30">
          <CheckCircle className="w-4 h-4 mr-2 text-green-300" />
          <span className="text-sm font-medium">Servicio confiable desde 1990</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Agua Pura para
          <span className="block bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent">
            Tu Comunidad
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-blue-100 leading-relaxed">
          Brindamos servicios de agua potable de la más alta calidad, garantizando 
          el acceso continuo y confiable al recurso hídrico para todas las familias.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="group bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center">
            Conoce Nuestros Servicios
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="group bg-transparent border-2 border-white/50 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 hover:border-white transition-all duration-300 backdrop-blur-sm">
            Portal de Usuario
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Sección de características destacadas
const FeaturesSection = () => {
  const features = [
    {
      icon: Droplets,
      title: "Agua de Calidad",
      description: "Cumplimos con todos los estándares de calidad nacional e internacional",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Shield,
      title: "Servicio Confiable",
      description: "Más de 30 años garantizando el suministro continuo de agua potable",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Clock,
      title: "Disponibilidad 24/7",
      description: "Servicio ininterrumpido con monitoreo constante de la red",
      color: "from-blue-600 to-green-500"
    },
    {
      icon: Users,
      title: "Atención Personalizada",
      description: "Equipo especializado para resolver todas tus consultas y necesidades",
      color: "from-green-600 to-blue-500"
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            ¿Por qué elegir nuestro
            <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              servicio?
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nos comprometemos con la excelencia en cada gota de agua que llega a tu hogar
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="group bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-blue-100/50"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default function HomePage() {
  return (
    <Layout>
      <HeroSection />
      <FeaturesSection />
      <StatsCards />
      <ServicesSection />
    </Layout>
  );
}