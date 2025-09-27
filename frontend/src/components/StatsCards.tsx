import React from 'react';
import { TrendingUp, Users, Droplets, Award } from 'lucide-react';

const StatsCards = () => {
  const stats = [
    {
      icon: Users,
      number: "15,000+",
      label: "Familias Atendidas",
      description: "Hogares con acceso continuo al servicio",
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100"
    },
    {
      icon: Droplets,
      number: "99.8%",
      label: "Calidad del Agua",
      description: "Cumplimiento de estándares internacionales",
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100"
    },
    {
      icon: TrendingUp,
      number: "24/7",
      label: "Disponibilidad",
      description: "Servicio ininterrumpido durante todo el año",
      color: "from-blue-600 to-green-500",
      bgColor: "from-blue-50 to-green-50"
    },
    {
      icon: Award,
      number: "30+",
      label: "Años de Experiencia",
      description: "Décadas sirviendo a la comunidad",
      color: "from-green-600 to-blue-500",
      bgColor: "from-green-50 to-blue-50"
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Nuestros
            <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Resultados
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Cifras que reflejan nuestro compromiso con la excelencia y el servicio a la comunidad
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className={`group relative bg-gradient-to-br ${stat.bgColor} rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-white/50 backdrop-blur-sm overflow-hidden`}
              >
                {/* Elemento decorativo de fondo */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl transform translate-x-8 -translate-y-8"></div>
                
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg relative z-10`}>
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">
                    {stat.number}
                  </h3>
                  <h4 className="text-lg font-semibold text-gray-700 mb-3">
                    {stat.label}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsCards;