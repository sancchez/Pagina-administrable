#!/usr/bin/env python3
"""
Analiza la estructura de llaves y paréntesis del archivo GrapesEditor.tsx
Muestra exactamente dónde se abren y cierran los bloques principales
"""
from collections import deque

path = "src/admin/GrapesEditor.tsx"

opens = {"(":")", "{":"}", "[":"]"}
close_for = {v:k for k,v in opens.items()}

stack = deque()
lines = open(path,'r', encoding='utf8').read().splitlines()

# Rastrear funciones importantes
important_patterns = [
    'const GrapesEditor',
    'const initializeEditor',
    'useCallback',
    'useEffect',
    'gEditor.on(',
    'try {',
    'return (',
]

print("=" * 80)
print("ANÁLISIS DE ESTRUCTURA - GrapesEditor.tsx")
print("=" * 80)

# Primera pasada: encontrar funciones principales
print("\n📍 FUNCIONES Y BLOQUES PRINCIPALES:\n")
for i, line in enumerate(lines, start=1):
    stripped = line.strip()
    for pattern in important_patterns:
        if pattern in line and not line.strip().startswith('//'):
            indent = len(line) - len(line.lstrip())
            print(f"  Línea {i:4d} [{indent:2d} esp]: {stripped[:100]}")
            break

# Segunda pasada: analizar balance
print("\n" + "=" * 80)
print("ANÁLISIS DE BALANCE DE TOKENS")
print("=" * 80)

stack = deque()
errors = []

for i, line in enumerate(lines, start=1):
    j = 0
    while j < len(line):
        ch = line[j]
        # skip strings
        if ch in "\"'`":
            q = ch
            j += 1
            while j < len(line) and line[j] != q:
                if line[j] == "\\":
                    j += 2
                else:
                    j += 1
        else:
            if ch in opens:
                stack.append((ch, i, line.strip()[:80]))
            elif ch in close_for:
                if stack and stack[-1][0] == close_for[ch]:
                    stack.pop()
                else:
                    errors.append((i, f"Cierre {ch!r} sin apertura correspondiente", line.strip()[:80]))
        j += 1

print(f"\n📊 RESUMEN:")
print(f"  - Total de aperturas sin cerrar: {len(stack)}")
print(f"  - Total de cierres sin apertura: {len(errors)}")

if stack:
    print(f"\n⚠️  TOKENS ABIERTOS SIN CERRAR (primeros 30):")
    for tok, ln, ctx in list(stack)[:30]:
        print(f"  Línea {ln:4d}: {tok!r} -> {ctx}")

if errors:
    print(f"\n⚠️  CIERRES SIN APERTURA (primeros 30):")
    for ln, msg, ctx in errors[:30]:
        print(f"  Línea {ln:4d}: {msg} -> {ctx}")

# Análisis específico de la zona problemática (líneas 2800-2900)
print("\n" + "=" * 80)
print("ANÁLISIS DETALLADO: ZONA PROBLEMÁTICA (líneas 2800-2900)")
print("=" * 80)

balance_parens = 0
balance_braces = 0
balance_brackets = 0

for i in range(2799, min(2900, len(lines))):
    line = lines[i]
    
    # Contar en esta línea
    p_open = line.count('(')
    p_close = line.count(')')
    b_open = line.count('{')
    b_close = line.count('}')
    br_open = line.count('[')
    br_close = line.count(']')
    
    balance_parens += p_open - p_close
    balance_braces += b_open - b_close
    balance_brackets += br_open - br_close
    
    # Mostrar líneas con cambios significativos o líneas clave
    if (abs(p_open - p_close) > 0 or abs(b_open - b_close) > 0 or 
        'gEditor.on' in line or 'catch' in line or 'return' in line):
        indent = len(line) - len(line.lstrip())
        print(f"  {i+1:4d} [{indent:2d}esp] ( {balance_parens:+2d} ) {{ {balance_braces:+2d} }} [ {balance_brackets:+2d} ] {line.rstrip()[:70]}")

print(f"\n📊 Balance final en línea 2900:")
print(f"  Paréntesis: {balance_parens:+d}")
print(f"  Llaves: {balance_braces:+d}")
print(f"  Corchetes: {balance_brackets:+d}")
