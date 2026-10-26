import { execSync } from 'child_process';

const port = process.argv[2] || 4000;

console.log(`🔍 Buscando proceso en el puerto ${port}...`);

// Solo procesos ESCUCHANDO en ese puerto local. Antes se tomaba cualquier
// línea de netstat que contuviera ":4000" (conexiones TIME_WAIT con PID 0,
// clientes conectados al puerto, etc.). process.kill(0) en Node mata al propio
// proceso, así que el script se suicidaba y `&& nodemon` nunca arrancaba.
function findListeningPids() {
    const pids = new Set();
    let output = '';
    try {
        output = process.platform === 'win32'
            ? execSync('netstat -ano -p tcp').toString()
            : execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN -t`).toString();
    } catch {
        return pids; // lsof sale con código 1 si no hay nada
    }

    for (const raw of output.split(/\r?\n/)) {
        const line = raw.trim();
        if (!line) continue;
        if (process.platform === 'win32') {
            const parts = line.split(/\s+/);
            // Proto  Local  Remota  Estado  PID
            if (parts.length < 5 || parts[3] !== 'LISTENING') continue;
            if (!parts[1].endsWith(`:${port}`)) continue;
            pids.add(Number(parts[4]));
        } else {
            pids.add(Number(line));
        }
    }
    pids.delete(0);
    pids.delete(process.pid);
    for (const pid of pids) if (!Number.isInteger(pid) || pid <= 0) pids.delete(pid);
    return pids;
}

const pids = findListeningPids();
if (pids.size === 0) {
    console.log(`ℹ️ No se encontró ningún proceso escuchando en el puerto ${port}.`);
}

for (const pid of pids) {
    console.log(`🛑 Matando proceso PID ${pid} en puerto ${port}...`);
    try {
        if (process.platform === 'win32') {
            execSync(`taskkill /F /T /PID ${pid}`, { stdio: 'ignore' });
        } else {
            process.kill(pid, 'SIGKILL');
        }
        console.log(`✅ Proceso ${pid} eliminado.`);
    } catch (e) {
        console.error(`❌ No se pudo terminar el proceso ${pid}:`, e.message);
    }
}
