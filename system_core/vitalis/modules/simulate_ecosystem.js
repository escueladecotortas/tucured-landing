// Archivo: simulate_ecosystem.js
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

async function simulateEcosystem(baseDir) {
    const results = {
        module: 'ECOSYSTEM_SIMULATION',
        status: 'HEALTHY',
        issues: [],
        details: []
    };

    console.log(`[VITALIS] Simulando flujo de energía vital (Conectividad)...`);

    // 1. Chequeo de Constantes Vitales (.env)
    const envPath = path.join(baseDir, '.env');
    let envVars = {};
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key) envVars[key.trim()] = value ? value.trim() : '';
        });
        results.details.push(`Environment loaded: ${Object.keys(envVars).length} variables`);
    } else {
        results.status = 'CRITICAL';
        results.issues.push({ severity: 'CRITICAL', code: 'MISSING_ENV', message: 'No se encontró archivo .env. El sistema está hipotérmico.' });
        return results;
    }

    // 2. Ping Backend (Si está corriendo)
    const PORT = envVars.AGENT_PORT || 8080;
    try {
        await new Promise((resolve) => {
            const req = http.get(`http://localhost:${PORT}/status`, (res) => {
                if (res.statusCode === 200) {
                    results.details.push(`Backend Pulse: STRONG (Status ${res.statusCode})`);
                    resolve();
                } else {
                    if (results.status === 'HEALTHY') results.status = 'WARNING';
                    results.issues.push({ severity: 'MEDIUM', code: 'BACKEND_SICK', message: `El Backend responde con status ${res.statusCode} en /status.` });
                    resolve(); // Resuelto pero con warning
                }
            });
            req.on('error', (e) => {
                // Es normal si no está prendido
                results.details.push(`Backend Pulse: WEAK/NONE (Server not running on ${PORT})`);
                resolve(); 
            });
            req.setTimeout(2000, () => {
                 req.destroy();
                 resolve();
            });
        });
    } catch (e) {
        // Ignorar
    }

    // 3. Chequeo de DB Cloud (Simulación de Conexión Opcional)
    if (envVars.GOOGLE_APPLICATION_CREDENTIALS) {
         const credPath = path.resolve(baseDir, envVars.GOOGLE_APPLICATION_CREDENTIALS);
         if (fs.existsSync(credPath)) {
             results.details.push(`Cloud DB Key: DETECTED (${envVars.GOOGLE_APPLICATION_CREDENTIALS})`);
         } else {
             if (results.status === 'HEALTHY') results.status = 'WARNING';
             results.issues.push({ severity: 'MEDIUM', code: 'MISSING_CLOUD_KEY', message: `La llave Cloud apunta al vacío: ${envVars.GOOGLE_APPLICATION_CREDENTIALS} no existe. Operando en modo Local-First puro.` });
         }
    } else {
         results.details.push(`Cloud DB Key: No configurada. Operando en Local-First.`);
    }

    return results;
}

module.exports = { simulateEcosystem };
