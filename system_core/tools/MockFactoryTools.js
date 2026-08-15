// Archivo: system_core/tools/MockFactoryTools.js
class MockFactoryTools {
    static generateId(prefix = 'mock') {
        const rand = Math.random().toString(36).substring(2, 9);
        return `${prefix}_${Date.now()}_${rand}`;
    }

    static mockUser(customFields = {}) {
        return {
            id: this.generateId('usr'),
            name: 'Usuario Demo',
            email: 'usuario.demo@nexus.local',
            role: 'DEVELOPER',
            isActive: true,
            createdAt: new Date().toISOString(),
            ...customFields
        };
    }

    static mockCollection(schemaName, count = 5, template = {}) {
        const items = [];
        for (let i = 0; i < count; i++) {
            items.push({
                id: this.generateId(schemaName.toLowerCase()),
                index: i + 1,
                title: `Elemento de Prueba #${i + 1} para ${schemaName}`,
                status: i % 2 === 0 ? 'ACTIVE' : 'PENDING',
                createdAt: new Date(Date.now() - i * 3600000).toISOString(),
                ...template
            });
        }
        return {
            schema: schemaName,
            total: count,
            data: items
        };
    }

    static mockApiResponse(payload, status = 200, message = 'Operación simulada con éxito') {
        return {
            status,
            success: status >= 200 && status < 300,
            message,
            timestamp: new Date().toISOString(),
            data: payload
        };
    }
}

module.exports = MockFactoryTools;
