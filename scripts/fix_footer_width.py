import os
import re

def apply_fix():
    # 1. Fix Layout.tsx
    layout_path = r'd:\paginaadmin\project\frontend\src\components\Layout.tsx'
    if os.path.exists(layout_path):
        with open(layout_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Nueva función de scope robusta que NO aplasta selectores ya prefijados
        new_fn = """  const scopeCSS = (css: string, scopeId: string): string => {
    if (!css) return '';
    return css.replace(/(^|\\}|\\{)\\s*([^@}{][^{]+)\\{/g, (match, p1, selectors) => {
      const trimmedSelectors = selectors.trim();
      if (!trimmedSelectors) return match;
      const scoped = trimmedSelectors.split(',').map(sel => {
        const s = sel.trim();
        if (!s) return '';
        const cleanSel = s.toLowerCase();
        // Si es raíz, mapear al contenedor
        if (cleanSel === 'body' || cleanSel === 'html' || cleanSel === ':root' || cleanSel === '.wrapper') {
          return `#${scopeId}`;
        }
        // SI YA EMPIEZA CON EL ID, NO VOLVER A PREFIJAR NI APLASTAR
        if (s.startsWith(`#${scopeId}`)) {
          return s;
        }
        return `#${scopeId} ${s}`;
      }).join(', ');
      return `${p1} ${scoped} {`;
    });
  };"""
        
        pattern = r'const scopeCSS = \(css: string, scopeId: string\): string => \{[\s\S]*?return css\.replace[\s\S]*?\}\);[\s\S]*?\};'
        if re.search(pattern, content):
            content = content.replace(re.search(pattern, content).group(0), new_fn)
            with open(layout_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print("Layout.tsx updated with correct CSS scoping logic")

    # 2. Fix PageRenderer.tsx
    renderer_path = r'd:\paginaadmin\project\frontend\src\components\PageRenderer.tsx'
    if os.path.exists(renderer_path):
        with open(renderer_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_renderer_fn = """function scopeCssToContent(css: string, containerSelector: string): string {
  if (!css) return css;
  try {
    return css.replace(/(^|\\}|\\{)\\s*([^@}{][^{]+)\\{/g, (match, p1, selectors) => {
      const trimmedSelectors = selectors.trim();
      if (!trimmedSelectors) return match;
      const scoped = trimmedSelectors.split(',').map(sel => {
        const s = sel.trim();
        if (!s) return '';
        const cleanSel = s.toLowerCase();
        if (cleanSel === 'body' || cleanSel === 'html' || cleanSel === ':root' || cleanSel === '.wrapper') {
          return containerSelector;
        }
        if (s.startsWith(containerSelector)) {
          return s;
        }
        return `${containerSelector} ${s}`;
      }).join(', ');
      return `${p1} ${scoped} {`;
    });
  } catch {
    return css;
  }
}"""
        pattern = r'function scopeCssToContent\(css: string, containerSelector: string\): string \{[\s\S]*?return css\.replace[\s\S]*?\}\);[\s\S]*?\}'
        if re.search(pattern, content):
            content = content.replace(re.search(pattern, content).group(0), new_renderer_fn)
            with open(renderer_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print("PageRenderer.tsx updated with correct CSS scoping logic")

if __name__ == "__main__":
    apply_fix()
