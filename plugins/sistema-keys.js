// sistema-keys.js - Sistema independiente de gestión de API Keys
import fs from 'fs';
import path from 'path';

// Configuración inicial
const KEYS_FILE = './keys_database.json';
const PROPRIETARIO_PRINCIPAL = '5493884086954@c.us'; // Tu número de bot

// Estructura de la base de datos de keys
let keysDatabase = {
    ultimaActualizacion: new Date().toISOString(),
    keys: {}
};

// Cargar base de datos existente
function cargarBaseDeDatos() {
    try {
        if (fs.existsSync(KEYS_FILE)) {
            const data = fs.readFileSync(KEYS_FILE, 'utf8');
            keysDatabase = JSON.parse(data);
            console.log('✅ Base de datos de keys cargada correctamente');
        }
    } catch (error) {
        console.log('📁 Creando nueva base de datos de keys...');
        guardarBaseDeDatos();
    }
}

// Guardar base de datos
function guardarBaseDeDatos() {
    try {
        keysDatabase.ultimaActualizacion = new Date().toISOString();
        fs.writeFileSync(KEYS_FILE, JSON.stringify(keysDatabase, null, 2));
    } catch (error) {
        console.error('Error guardando base de datos:', error);
    }
}

// Generar key única
function generarKeyUnica() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `KEY_${timestamp}_${random}`.toUpperCase();
}

// SISTEMA PRINCIPAL DE GESTIÓN DE KEYS
const SistemaKeys = {
    // Inicializar sistema
    inicializar: function() {
        cargarBaseDeDatos();
        this.limpiarKeysExpiradas();
    },

    // Generar nueva key
    generarKey: function(nombreCliente, diasValidez = 30, limiteDiario = 50, notas = '') {
        const key = generarKeyUnica();
        const fechaCreacion = new Date();
        const fechaExpiracion = new Date();
        fechaExpiracion.setDate(fechaExpiracion.getDate() + diasValidez);

        keysDatabase.keys[key] = {
            nombreCliente: nombreCliente,
            fechaCreacion: fechaCreacion.toISOString(),
            fechaExpiracion: fechaExpiracion.toISOString(),
            diasValidez: diasValidez,
            limiteDiario: limiteDiario,
            usosHoy: 0,
            totalUsos: 0,
            ultimoUso: null,
            activa: true,
            notas: notas,
            ultimoReset: new Date().toDateString()
        };

        guardarBaseDeDatos();
        return key;
    },

    // Verificar key
    verificarKey: function(key) {
        const keyInfo = keysDatabase.keys[key];
        
        // Verificar si la key existe
        if (!keyInfo) {
            return { valida: false, error: 'Key no existe' };
        }
        
        // Verificar si está activa
        if (!keyInfo.activa) {
            return { valida: false, error: 'Key desactivada' };
        }
        
        // Verificar expiración
        const ahora = new Date();
        const expiracion = new Date(keyInfo.fechaExpiracion);
        if (ahora > expiracion) {
            return { valida: false, error: 'Key expirada' };
        }
        
        // Verificar reset diario
        const hoy = new Date().toDateString();
        if (keyInfo.ultimoReset !== hoy) {
            keyInfo.usosHoy = 0;
            keyInfo.ultimoReset = hoy;
            guardarBaseDeDatos();
        }
        
        // Verificar límite diario
        if (keyInfo.usosHoy >= keyInfo.limitDiario) {
            return { 
                valida: false, 
                error: `Límite diario alcanzado (${keyInfo.limiteDiario} usos)` 
            };
        }
        
        // Actualizar contadores
        keyInfo.usosHoy++;
        keyInfo.totalUsos++;
        keyInfo.ultimoUso = new Date().toISOString();
        guardarBaseDeDatos();
        
        return {
            valida: true,
            info: keyInfo,
            usosRestantes: keyInfo.limiteDiario - keyInfo.usosHoy,
            diasRestantes: Math.ceil((expiracion - ahora) / (1000 * 60 * 60 * 24))
        };
    },

    // Listar todas las keys
    listarKeys: function() {
        return keysDatabase.keys;
    },

    // Desactivar key
    desactivarKey: function(key) {
        if (keysDatabase.keys[key]) {
            keysDatabase.keys[key].activa = false;
            guardarBaseDeDatos();
            return true;
        }
        return false;
    },

    // Activar key
    activarKey: function(key) {
        if (keysDatabase.keys[key]) {
            keysDatabase.keys[key].activa = true;
            guardarBaseDeDatos();
            return true;
        }
        return false;
    },

    // Eliminar key
    eliminarKey: function(key) {
        if (keysDatabase.keys[key]) {
            delete keysDatabase.keys[key];
            guardarBaseDeDatos();
            return true;
        }
        return false;
    },

    // Renovar key
    renovarKey: function(key, diasExtra) {
        const keyInfo = keysDatabase.keys[key];
        if (keyInfo) {
            const nuevaExpiracion = new Date(keyInfo.fechaExpiracion);
            nuevaExpiracion.setDate(nuevaExpiracion.getDate() + diasExtra);
            keyInfo.fechaExpiracion = nuevaExpiracion.toISOString();
            keyInfo.diasValidez += diasExtra;
            guardarBaseDeDatos();
            return true;
        }
        return false;
    },

    // Limpiar keys expiradas automáticamente
    limpiarKeysExpiradas: function() {
        const ahora = new Date();
        let keysEliminadas = 0;
        
        for (const [key, info] of Object.entries(keysDatabase.keys)) {
            if (new Date(info.fechaExpiracion) < ahora) {
                delete keysDatabase.keys[key];
                keysEliminadas++;
            }
        }
        
        if (keysEliminadas > 0) {
            guardarBaseDeDatos();
            console.log(`🧹 ${keysEliminadas} keys expiradas eliminadas`);
        }
    },

    // Estadísticas del sistema
    obtenerEstadisticas: function() {
        const totalKeys = Object.keys(keysDatabase.keys).length;
        const keysActivas = Object.values(keysDatabase.keys).filter(k => k.activa).length;
        const keysExpiradas = Object.values(keysDatabase.keys).filter(k => 
            new Date(k.fechaExpiracion) < new Date()
        ).length;
        
        return {
            totalKeys,
            keysActivas,
            keysExpiradas,
            ultimaActualizacion: keysDatabase.ultimaActualizacion
        };
    }
};

// HANDLER PARA COMANDOS DE GESTIÓN DE KEYS
let handler = async (m, { conn, text, usedPrefix, command, sender }) => {
    // Verificar si es el propietario
    if (!sender.includes(PROPRIETARIO_PRINCIPAL)) {
        return conn.sendMessage(m.chat, { 
            text: '❌ Solo el propietario puede gestionar las keys.' 
        }, { quoted: m });
    }

    const args = text.trim().split(' ');
    const subcomando = args[0]?.toLowerCase();

    try {
        switch (subcomando) {
            case 'generar':
            case 'crear':
                if (args.length < 2) {
                    return conn.sendMessage(m.chat, { 
                        text: `❌ Formato: ${usedPrefix + command} generar [nombre] [días] [límite]\n💡 Ejemplo: ${usedPrefix + command} generar "Mi Bot" 30 100` 
                    }, { quoted: m });
                }
                
                const nombre = args[1];
                const dias = parseInt(args[2]) || 30;
                const limite = parseInt(args[3]) || 50;
                const notas = args.slice(4).join(' ') || '';
                
                const nuevaKey = SistemaKeys.generarKey(nombre, dias, limite, notas);
                
                const mensajeKey = `🔑 *NUEVA KEY GENERADA* 🔑\n\n` +
                                 `👤 *Cliente:* ${nombre}\n` +
                                 `🔑 *Key:* \`${nuevaKey}\`\n` +
                                 `📅 *Válida por:* ${dias} días\n` +
                                 `📊 *Límite diario:* ${limite} usos\n` +
                                 `📝 *Notas:* ${notas || 'Ninguna'}\n\n` +
                                 `💡 *Comparte esta key con el desarrollador*`;
                
                return conn.sendMessage(m.chat, { text: mensajeKey }, { quoted: m });

            case 'listar':
            case 'lista':
                const keys = SistemaKeys.listarKeys();
                if (Object.keys(keys).length === 0) {
                    return conn.sendMessage(m.chat, { 
                        text: '📭 No hay keys registradas en el sistema.' 
                    }, { quoted: m });
                }
                
                let listaMensaje = `📋 *KEYS REGISTRADAS* 📋\n\n`;
                for (const [key, info] of Object.entries(keys)) {
                    const estado = info.activa ? '🟢' : '🔴';
                    const expiracion = new Date(info.fechaExpiracion);
                    const diasRestantes = Math.ceil((expiracion - new Date()) / (1000 * 60 * 60 * 24));
                    
                    listaMensaje += `${estado} *${info.nombreCliente}*\n`;
                    listaMensaje += `🔑 ${key}\n`;
                    listaMensaje += `📅 Expira en: ${diasRestantes} días\n`;
                    listaMensaje += `📊 Usos hoy: ${info.usosHoy}/${info.limiteDiario}\n`;
                    listaMensaje += `🔧 Estado: ${info.activa ? 'Activa' : 'Inactiva'}\n\n`;
                }
                
                return conn.sendMessage(m.chat, { text: listaMensaje }, { quoted: m });

            case 'desactivar':
                if (args.length < 2) {
                    return conn.sendMessage(m.chat, { 
                        text: `❌ Formato: ${usedPrefix + command} desactivar [key]` 
                    }, { quoted: m });
                }
                
                const keyDesactivar = args[1];
                if (SistemaKeys.desactivarKey(keyDesactivar)) {
                    return conn.sendMessage(m.chat, { 
                        text: `✅ Key desactivada correctamente.` 
                    }, { quoted: m });
                } else {
                    return conn.sendMessage(m.chat, { 
                        text: `❌ Key no encontrada.` 
                    }, { quoted: m });
                }

            case 'activar':
                if (args.length < 2) {
                    return conn.sendMessage(m.chat, { 
                        text: `❌ Formato: ${usedPrefix + command} activar [key]` 
                    }, { quoted: m });
                }
                
                const keyActivar = args[1];
                if (SistemaKeys.activarKey(keyActivar)) {
                    return conn.sendMessage(m.chat, { 
                        text: `✅ Key activada correctamente.` 
                    }, { quoted: m });
                } else {
                    return conn.sendMessage(m.chat, { 
                        text: `❌ Key no encontrada.` 
                    }, { quoted: m });
                }

            case 'renovar':
                if (args.length < 3) {
                    return conn.sendMessage(m.chat, { 
                        text: `❌ Formato: ${usedPrefix + command} renovar [key] [días]` 
                    }, { quoted: m });
                }
                
                const keyRenovar = args[1];
                const diasExtra = parseInt(args[2]);
                if (SistemaKeys.renovarKey(keyRenovar, diasExtra)) {
                    return conn.sendMessage(m.chat, { 
                        text: `✅ Key renovada por ${diasExtra} días adicionales.` 
                    }, { quoted: m });
                } else {
                    return conn.sendMessage(m.chat, { 
                        text: `❌ Key no encontrada.` 
                    }, { quoted: m });
                }

            case 'estadisticas':
            case 'stats':
                const stats = SistemaKeys.obtenerEstadisticas();
                const mensajeStats = `📊 *ESTADÍSTICAS DEL SISTEMA* 📊\n\n` +
                                   `🔑 *Total de keys:* ${stats.totalKeys}\n` +
                                   `🟢 *Keys activas:* ${stats.keysActivas}\n` +
                                   `🔴 *Keys expiradas:* ${stats.keysExpiradas}\n` +
                                   `🕐 *Última actualización:* ${new Date(stats.ultimaActualizacion).toLocaleString()}`;
                
                return conn.sendMessage(m.chat, { text: mensajeStats }, { quoted: m });

            default:
                const ayuda = `🔑 *SISTEMA DE GESTIÓN DE KEYS* 🔑\n\n` +
                            `*Comandos disponibles:*\n\n` +
                            `• ${usedPrefix + command} generar [nombre] [días] [límite]\n` +
                            `  → Crear nueva key\n\n` +
                            `• ${usedPrefix + command} listar\n` +
                            `  → Ver todas las keys\n\n` +
                            `• ${usedPrefix + command} activar [key]\n` +
                            `  → Activar key\n\n` +
                            `• ${usedPrefix + command} desactivar [key]\n` +
                            `  → Desactivar key\n\n` +
                            `• ${usedPrefix + command} renovar [key] [días]\n` +
                            `  → Extender validez\n\n` +
                            `• ${usedPrefix + command} estadisticas\n` +
                            `  → Ver estadísticas\n\n` +
                            `💡 *Ejemplo:*\n` +
                            `${usedPrefix + command} generar "Bot Amigo" 30 100`;
                
                return conn.sendMessage(m.chat, { text: ayuda }, { quoted: m });
        }
    } catch (error) {
        console.error(error);
        return conn.sendMessage(m.chat, { 
            text: `❌ Error: ${error.message}` 
        }, { quoted: m });
    }
};

// Inicializar sistema al cargar
SistemaKeys.inicializar();

// Exportar tanto el handler como el sistema para usar en otros comandos
handler.help = ['keys'];
handler.tags = ['admin'];
handler.command = /^(keys|apikeys|gestionarkeys)$/i;
handler.register = true;

export default handler;
export { SistemaKeys };
