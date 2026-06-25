# Directiva Operativa: Gemini Seed Socorro

## 1. Objetivo
Generar un diseño moderno, limpio y avanzado para el portal del Acueducto El Socorro ("seed"), asegurando compatibilidad con GrapesJS y TailwindCSS purgado de producción.

## 2. Entradas
- Lineamientos de `PARAMETROS_DISENO_SEED.md`.
- Reglas estipuladas para GrapesJS.

## 3. Salidas
- HTMLs guardados en `backend/temp/client-html/` (`home.html`, `_header.html`, `_footer.html`).
- Archivo de metadatos `backend/temp/client-html/pages.json`.
- Comando ejecutado para inyectar en la DB: `npm run import:pages` y `npm run db:seed`.

## 4. Restricciones y Casos Borde (Trampas Conocidas)
- **Alineación y Color explícitos:** Cada elemento de texto (`h1`-`h6`, `p`, `span`, `a`) DEBE tener `text-center`/`text-left`, y color `text-...` explícitos.
- **Paleta Segura:** Solo usar colores permitidos (ej. `blue`, `sky`, `cyan`, `emerald`, `teal`, `slate`, `white`).
- **Gradientes Visibles:** Prohibido usar `bg-clip-text` o texto transparente, y cualquier gradiente debe definir explícitamente `from-` y `to-` con la paleta.
- **Elementos de Texto Limpios:** Los bloques de texto no pueden tener iconos o spans anidados que rompan la edición de texto plano.
- **Seguridad:** Ningún `<script>` ni `onclick`.
- **Ejecución de Seed:** Nota: No hacer `npm run db:seed` en subprocess desde Python ni heredar variables de entorno globales si no han sido validadas. Causa el error "Error validating datasource db: the URL must start with the protocol file:" porque la variable `DATABASE_URL` global puede sobrescribir la del `.env`. En su lugar, asegúrate de eliminar `DATABASE_URL` del entorno (`os.environ`) antes del `subprocess.run` y usar `npx prisma db seed` para forzar la lectura del `.env` local. Todo se lanza desde `backend/`.
