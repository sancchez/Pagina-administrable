import { Clock, Award, Users, Leaf, Shield, Zap } from 'lucide-react';

export default function StatsCards() {
  const stats = [
    {
      icon: Clock,
      title: 'Servicio 24/7',
      value: '365 días',
      description: 'Disponibilidad continua',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Award,
      title: 'Calidad Certificada',
      value: '99.8%',
      description: 'Agua potable garantizada',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Users,
      title: 'Usuarios Conectados',
      value: '15,000+',
      description: 'Familias beneficiadas',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Leaf,
      title: 'Compromiso Ambiental',
      value: '100%',
      description: 'Procesos eco-sostenibles',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      icon: Shield,
      title: 'Seguridad Hídrica',
      value: '24/7',
      description: 'Monitoreo constante',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: Zap,
      title: 'Eficiencia Energética',
      value: '95%',
      description: 'Optimización de recursos',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-r from-green-500 to-blue-500">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Nuestros Números Hablan
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Comprometidos con la excelencia en cada aspecto de nuestro servicio
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${stat.color} rounded-full mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  {stat.value}
                </h3>
                
                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                  {stat.title}
                </h4>
                
                <p className="text-gray-600 text-sm">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}