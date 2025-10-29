# guarda como check_balance.py y ejecútalo: python3 check_balance.py
from collections import deque

path = "src/admin/GrapesEditor.tsx"

opens = {"(":")", "{":"}", "[":"]"}
close_for = {v:k for k,v in opens.items()}

stack = deque()
lines = open(path,'r', encoding='utf8').read().splitlines()

for i, line in enumerate(lines, start=1):
    # ignorar comentarios simples para no romper strings /*...*/ y // ...
    # (es simple: se analizan caracteres - suficiente para detectar balance)
    j = 0
    while j < len(line):
        ch = line[j]
        # skip strings (simple): ' " `
        if ch in "\"'`":
            q = ch
            j += 1
            while j < len(line) and line[j] != q:
                # skip escaped
                if line[j] == "\\":
                    j += 2
                else:
                    j += 1
        else:
            if ch in opens:
                stack.append((ch, i, line.strip()[:200]))
            elif ch in close_for:
                if stack and stack[-1][0] == close_for[ch]:
                    stack.pop()
                else:
                    # unmatched closing
                    print(f"UNMATCHED closing {ch!r} at line {i}: {line.strip()[:200]}")
            j += 1

if not stack:
    print("✔ No unmatched opening tokens found (balance ok).")
else:
    print("✖ Unmatched opening tokens (need to close). Count:", len(stack))
    for tok, ln, ctx in list(stack)[-20:]:
        print(f"  - {tok!r} opened at line {ln}: {ctx}")
