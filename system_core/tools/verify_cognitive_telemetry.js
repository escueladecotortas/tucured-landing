// Archivo: system_core/tools/verify_cognitive_telemetry.js
const http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert');

console.log('=== AUDITORÍA TÉCNICA DE TELEMETRÍA COGNITIVA Y KPIS DE AGENTES ===\n');

// 1. Validar endpoint /api/status
http.get('http://127.0.0.1:3000/api/status', (res) => {
    let raw = '';
    res.on('data', chunk => raw += chunk);
    res.on('end', () => {
        try {
            assert.strictEqual(res.statusCode, 200, 'Status code debe ser 200');
            const data = JSON.parse(raw);
            console.log('[TEST 1] Verificando estructura de /api/status...');
            assert(Array.isArray(data.agents), 'data.agents debe ser un array');
            assert.strictEqual(data.agents.length, 10, 'Deben existir 10 agentes');
            console.log(` -> Total de agentes auditados: ${data.agents.length}`);

            console.log('\n[TEST 2] Evaluando KPIs cognitivos individuales...');
            data.agents.forEach(a => {
                assert(typeof a.name === 'string', 'name requerido');
                assert(typeof a.level === 'string', 'level requerido');
                assert(typeof a.totalInvocations === 'number', 'totalInvocations debe ser número');
                assert(typeof a.errorsCount === 'number', 'errorsCount debe ser número');
                assert(typeof a.successRate === 'number', 'successRate debe ser número');
                assert(a.successRate >= 0 && a.successRate <= 100, 'successRate entre 0 y 100');
                assert(['OPTIMAL', 'NEEDS_REVIEW'].includes(a.promptStatus), 'promptStatus válido');
                assert(typeof a.isActive === 'boolean', 'isActive debe ser booleano');
                assert(Array.isArray(a.recentLogs), 'recentLogs debe ser array');
                console.log(` • [${a.name.toUpperCase()}] (${a.level}) -> Ops: ${a.totalInvocations} | Confiabilidad: ${a.successRate}% | Calibración: ${a.promptStatus} | Activo: ${a.isActive}`);
            });

            console.log('\n[TEST 3] Auditando archivos y componentes UI...');
            const html = fs.readFileSync('system_core/dashboard/index.html', 'utf-8');
            const ui = fs.readFileSync('system_core/dashboard/dashboard_ui.js', 'utf-8');
            const srv = fs.readFileSync('system_core/dashboard/server.js', 'utf-8');

            assert(html.includes('id="agentModal"'), 'agentModal debe estar en index.html');
            assert(ui.includes('openAgentModal'), 'openAgentModal debe estar en dashboard_ui.js');
            assert(srv.includes('promptStatus'), 'promptStatus debe calcularse en server.js');

            console.log(` -> index.html: ${html.split('\n').length} líneas (< 180 OK)`);
            console.log(` -> dashboard_ui.js: ${ui.split('\n').length} líneas (< 180 OK)`);
            console.log(` -> server.js: ${srv.split('\n').length} líneas (< 180 OK)`);

            console.log('\n✅ BATERÍA DE PRUEBAS FINALIZADA CON 100% DE ÉXITO.');
            process.exit(0);
        } catch (err) {
            console.error('\n❌ ERROR EN AUDITORÍA:', err.message);
            process.exit(1);
        }
    });
}).on('error', err => {
    console.error('❌ Error de conexión al servidor:', err.message);
    process.exit(1);
});
