import { execSync } from 'child_process';

const port = process.argv[2] || 4000;

console.log(`🔍 Buscando proceso en el puerto ${port}...`);

try {
    let command = '';
    if (process.platform === 'win32') {
        command = `netstat -ano | findstr :${port}`;
    } else {
        command = `lsof -i tcp:${port} | grep LISTEN`;
    }

    const output = execSync(command).toString().trim();
    const lines = output.split('\n');

    lines.forEach(line => {
        const parts = line.split(/\s+/);
        const pid = process.platform === 'win32' ? parts[parts.length - 1] : parts[1];

        if (pid && !isNaN(pid)) {
            console.log(`🛑 Matando proceso PID ${pid} en puerto ${port}...`);
            try {
                process.kill(pid, 'SIGKILL');
                console.log(`✅ Proceso ${pid} eliminado.`);
            } catch (e) {
                // En Windows, a veces process.kill falla si no es admin, intentamos con taskkill
                if (process.platform === 'win32') {
                    execSync(`taskkill /F /PID ${pid}`);
                    console.log(`✅ Proceso ${pid} eliminado con taskkill.`);
                } else {
                    throw e;
                }
            }
        }
    });
} catch (error) {
    if (error.status === 1) {
        console.log(`ℹ️ No se encontró ningún proceso escuchando en el puerto ${port}.`);
    } else {
        console.error(`❌ Error al intentar liberar el puerto ${port}:`, error.message);
    }
}
