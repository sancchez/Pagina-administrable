import { ArrowRight, Play, CreditCard } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-green-500">
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-800/30 to-green-800/30"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Título principal */}
          <h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            data-editable-type="titulo-principal"
            data-movable="true"
            data-gradient-editable="true"
            data-background-editable="true"
          >
            <span 
              className="text-white"
              data-editable-type="titulo-parte1"
              data-movable="true"
              data-gradient-editable="true"
              contentEditable
              suppressContentEditableWarning
            >
              Agua Pura para
            </span>
            <br />
            <span 
              className="text-blue-100"
              data-editable-type="titulo-parte2"
              data-movable="true"
              data-gradient-editable="true"
              contentEditable
              suppressContentEditableWarning
            >
              Tu Comunidad
            </span>
          </h1>

          {/* Subtítulo */}
          <p 
            className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed"
            data-editable-type="subtitulo"
            data-movable="true"
            data-gradient-editable="true"
            contentEditable
            suppressContentEditableWarning
          >
            Comprometidos con brindar el mejor servicio de acueducto, 
            garantizando agua potable de calidad las 24 horas del día para toda la comunidad.
          </p>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-4 rounded-full transition-all duration-300 flex items-center space-x-2 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
              <CreditCard className="h-5 w-5" />
              <span>Pagar Factura</span>
            </button>
            
            <button className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 flex items-center space-x-2 hover:bg-white/30 hover:border-white/50 hover:shadow-lg">
              <span>Conoce Nuestros Servicios</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {/* Video demo */}
          <div className="relative max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <button className="group flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 hover:scale-110 transition-transform duration-300 shadow-xl">
                <Play className="h-8 w-8 text-white ml-1 group-hover:scale-110 transition-transform" />
              </button>
              <p className="text-white font-medium">Ver video institucional</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}