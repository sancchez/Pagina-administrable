import os
import json
import subprocess

def main():
    base_dir = r"d:\paginaadmin\project"
    client_html_dir = os.path.join(base_dir, "backend", "temp", "client-html")
    
    if not os.path.exists(client_html_dir):
        os.makedirs(client_html_dir)

    header_html = """<div class="bg-blue-800 border-b border-blue-700">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
    <div class="flex items-center gap-3">
      <span class="text-3xl">💧</span>
      <span class="text-xl font-bold text-white text-left">Acueducto El Socorro</span>
    </div>
    <div class="hidden md:flex gap-6">
      <a href="/" class="text-blue-100 hover:text-white font-medium text-base text-center">Inicio</a>
      <a href="/servicios" class="text-blue-100 hover:text-white font-medium text-base text-center">Servicios</a>
      <a href="/contacto" class="text-blue-100 hover:text-white font-medium text-base text-center">Contacto</a>
    </div>
    <div>
      <a href="/portal" data-action-type="portal" class="inline-flex items-center px-5 py-2 rounded-lg bg-emerald-500 text-white font-bold hover:bg-emerald-400 text-center">Mi Cuenta</a>
    </div>
  </div>
</div>"""

    footer_html = """<div class="bg-slate-900 pt-16 pb-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
      <div>
        <div class="flex items-center gap-3 mb-6">
          <span class="text-4xl">💧</span>
          <span class="text-2xl font-bold text-white text-left">El Socorro</span>
        </div>
        <p class="text-slate-400 text-base text-left mb-6">Agua potable y saneamiento básico de alta calidad, garantizando el bienestar de nuestra comunidad para el futuro.</p>
      </div>
      <div>
        <h4 class="text-lg font-bold text-white text-left mb-6">Enlaces Rápidos</h4>
        <div class="flex flex-col gap-3">
          <a href="/" class="text-slate-400 hover:text-white text-left text-base">Inicio</a>
          <a href="/portal" class="text-slate-400 hover:text-white text-left text-base">Pagar Factura</a>
          <a href="/tramites" class="text-slate-400 hover:text-white text-left text-base">Trámites en Línea</a>
        </div>
      </div>
      <div>
        <h4 class="text-lg font-bold text-white text-left mb-6">Contacto</h4>
        <div class="flex flex-col gap-3">
          <p class="text-slate-400 text-left text-base">📍 Calle Principal #12-34, El Socorro</p>
          <p class="text-slate-400 text-left text-base">📞 (607) 123 4567</p>
          <p class="text-slate-400 text-left text-base">✉️ contacto@acueductosocorro.com</p>
        </div>
      </div>
    </div>
    <div class="border-t border-slate-800 pt-8 mt-8">
      <p class="text-slate-500 text-center text-sm">© 2024 Acueducto El Socorro. Todos los derechos reservados.</p>
    </div>
  </div>
</div>"""

    home_html = """<div class="bg-slate-50">
  <!-- HERO -->
  <section class="bg-gradient-to-br from-blue-800 to-sky-700 relative overflow-hidden">
    <div class="absolute inset-0 bg-blue-900 opacity-20"></div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10 flex flex-col md:flex-row items-center gap-12">
      <div class="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
        <span class="inline-block px-4 py-1.5 rounded-full bg-emerald-500 text-white text-sm font-bold tracking-wider mb-6 text-center">TRABAJAMOS POR TI</span>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white text-center md:text-left leading-tight mb-6">El Agua, <br/>Fuente de Vida para El Socorro</h1>
        <p class="text-lg md:text-xl text-blue-100 text-center md:text-left max-w-lg mb-10">Llevamos agua potable y servicios de saneamiento con excelencia y responsabilidad ambiental a cada hogar de nuestra región.</p>
        <div class="flex flex-col sm:flex-row gap-4 w-full justify-center md:justify-start">
          <a href="/portal" class="px-8 py-4 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 shadow-lg shadow-emerald-500/30 text-center text-lg transition-transform hover:-translate-y-1">Pagar mi Factura</a>
          <a href="/servicios" class="px-8 py-4 rounded-xl bg-white text-blue-800 font-bold hover:bg-blue-50 shadow-lg text-center text-lg transition-transform hover:-translate-y-1">Nuestros Servicios</a>
        </div>
      </div>
      <div class="w-full md:w-1/2 flex justify-center">
        <!-- Visual decorativo en lugar de imagen para ser 100% nativo Tailwind/CSS -->
        <div class="w-72 h-72 md:w-96 md:h-96 rounded-full bg-gradient-to-tr from-sky-400 to-emerald-300 shadow-2xl flex items-center justify-center p-8 border-8 border-white/20">
          <span class="text-9xl text-center">💧</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ACCESOS RÁPIDOS -->
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 mb-20">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <a href="/tramites" class="block p-8 rounded-2xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-blue-300 transition-colors group">
        <div class="w-16 h-16 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">📄</div>
        <h3 class="text-xl font-bold text-slate-800 text-left mb-3">Trámites en Línea</h3>
        <p class="text-slate-600 text-left text-base">Realiza solicitudes, PQRS y certificaciones sin salir de casa.</p>
      </a>
      <a href="/cortes" class="block p-8 rounded-2xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-amber-300 transition-colors group">
        <div class="w-16 h-16 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">⚠️</div>
        <h3 class="text-xl font-bold text-slate-800 text-left mb-3">Avisos y Cortes</h3>
        <p class="text-slate-600 text-left text-base">Infórmate sobre suspensiones programadas y mantenimientos.</p>
      </a>
      <a href="/cultura" class="block p-8 rounded-2xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-emerald-300 transition-colors group">
        <div class="w-16 h-16 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🌱</div>
        <h3 class="text-xl font-bold text-slate-800 text-left mb-3">Cultura del Agua</h3>
        <p class="text-slate-600 text-left text-base">Consejos prácticos para el ahorro y uso eficiente del líquido vital.</p>
      </a>
    </div>
  </section>

  <!-- SECCIÓN: NUESTROS SERVICIOS -->
  <section class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16 max-w-3xl mx-auto">
        <h2 class="text-sm font-bold text-blue-600 tracking-widest uppercase mb-3 text-center">Qué Hacemos</h2>
        <h3 class="text-3xl md:text-4xl font-extrabold text-slate-900 text-center mb-6">Comprometidos con la Calidad</h3>
        <p class="text-lg text-slate-600 text-center">Ofrecemos soluciones integrales para garantizar el abastecimiento seguro y continuo en nuestra comunidad.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div class="order-2 md:order-1 flex flex-col gap-8">
          <div class="flex gap-6">
            <div class="flex-shrink-0 w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">1</div>
            <div>
              <h4 class="text-xl font-bold text-slate-900 text-left mb-2">Acueducto</h4>
              <p class="text-slate-600 text-left text-base">Captación, tratamiento y distribución de agua potable bajo los más estrictos estándares de calidad.</p>
            </div>
          </div>
          <div class="flex gap-6">
            <div class="flex-shrink-0 w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold">2</div>
            <div>
              <h4 class="text-xl font-bold text-slate-900 text-left mb-2">Alcantarillado</h4>
              <p class="text-slate-600 text-left text-base">Recolección, transporte y tratamiento de aguas residuales para proteger nuestros ecosistemas.</p>
            </div>
          </div>
          <div class="flex gap-6">
            <div class="flex-shrink-0 w-14 h-14 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-2xl font-bold">3</div>
            <div>
              <h4 class="text-xl font-bold text-slate-900 text-left mb-2">Laboratorio</h4>
              <p class="text-slate-600 text-left text-base">Análisis fisicoquímicos y microbiológicos para garantizar la pureza del recurso hídrico.</p>
            </div>
          </div>
        </div>
        <div class="order-1 md:order-2 bg-gradient-to-br from-blue-100 to-emerald-50 rounded-3xl p-8 lg:p-12 border border-blue-200">
          <h4 class="text-2xl font-bold text-blue-900 text-left mb-6">Indicadores de Calidad</h4>
          <div class="space-y-6">
            <div>
              <div class="flex justify-between mb-2">
                <span class="text-slate-700 font-semibold text-left">Cobertura de Acueducto</span>
                <span class="text-blue-700 font-bold text-right">98%</span>
              </div>
              <div class="w-full bg-blue-200 rounded-full h-3">
                <div class="bg-blue-600 h-3 rounded-full" style="width: 98%"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between mb-2">
                <span class="text-slate-700 font-semibold text-left">Continuidad del Servicio</span>
                <span class="text-emerald-700 font-bold text-right">99.5%</span>
              </div>
              <div class="w-full bg-emerald-200 rounded-full h-3">
                <div class="bg-emerald-600 h-3 rounded-full" style="width: 99.5%"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between mb-2">
                <span class="text-slate-700 font-semibold text-left">Índice de Riesgo (IRCA)</span>
                <span class="text-sky-700 font-bold text-right">0.2%</span>
              </div>
              <div class="w-full bg-sky-200 rounded-full h-3">
                <div class="bg-sky-500 h-3 rounded-full" style="width: 95%"></div>
              </div>
              <p class="text-xs text-slate-500 text-left mt-2">* Sin riesgo / Apta para consumo humano.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- LLAMADO A LA ACCIÓN (CTA) -->
  <section class="py-24 bg-gradient-to-r from-emerald-600 to-teal-700 relative overflow-hidden">
    <div class="absolute inset-0 bg-black opacity-10"></div>
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
      <h2 class="text-3xl md:text-4xl font-extrabold text-white text-center mb-6">Actualiza tus datos y recibe tu factura por correo</h2>
      <p class="text-xl text-teal-100 text-center mb-10 max-w-2xl mx-auto">Súmate a la iniciativa "Cero Papel". Es rápido, seguro y ayudas a proteger el medio ambiente.</p>
      <a href="/portal" class="inline-block px-10 py-4 rounded-xl bg-white text-teal-800 font-bold text-xl hover:bg-slate-50 shadow-2xl transition-transform hover:scale-105 text-center">Ir a Mi Cuenta</a>
    </div>
  </section>
</div>"""

    pages = [
        {"slug": "home", "title": "Inicio"},
        {"slug": "_header", "title": "Header Global"},
        {"slug": "_footer", "title": "Footer Global"}
    ]

    with open(os.path.join(client_html_dir, "home.html"), "w", encoding="utf-8") as f:
        f.write(home_html)
    with open(os.path.join(client_html_dir, "_header.html"), "w", encoding="utf-8") as f:
        f.write(header_html)
    with open(os.path.join(client_html_dir, "_footer.html"), "w", encoding="utf-8") as f:
        f.write(footer_html)
    
    with open(os.path.join(client_html_dir, "pages.json"), "w", encoding="utf-8") as f:
        json.dump(pages, f, indent=2, ensure_ascii=False)
        
    print("HTML files generated. Running NPM commands...")
    
    backend_dir = os.path.join(base_dir, "backend")
    
    env = os.environ.copy()
    if "DATABASE_URL" in env:
        del env["DATABASE_URL"]
    
    res_import = subprocess.run(["npm", "run", "import:pages"], shell=True, cwd=backend_dir, env=env)
    if res_import.returncode != 0:
        print("Error in import:pages")
        return
        
    res_seed = subprocess.run(["npx", "prisma", "db", "seed"], shell=True, cwd=backend_dir, env=env)
    if res_seed.returncode != 0:
        print("Error in db:seed")
        return
        
    print("Seed process completed successfully!")

if __name__ == "__main__":
    main()
