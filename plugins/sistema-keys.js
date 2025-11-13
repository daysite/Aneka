// sistema-keys.js - Sistema simple de gestión de keys
import fs from 'fs';

// Configuración
const KEYS_FILE = './keys_database.json';
const OWNER_NUMBER = '51999999999'; // TU NÚMERO SIN + (ejemplo: 51987654321)

// Base de datos simple
let keysDB = {};

// Cargar base de datos
function loadDB() {
    try {
        if (fs.existsSync(KEYS_FILE)) {
            const data = fs.readFileSync(KEYS_FILE, 'utf8');
            keysDB = JSON.parse(data);
        }
    } catch (e) {
        keysDB = {};
    }
}

// Guardar base de datos
function saveDB() {
    try {
        fs.writeFileSync(KEYS_FILE, JSON.stringify(keysDB, null, 2));
    } catch (e) {
        console.error('Error guardando DB:', e);
    }
}

// Sistema de Keys
const KeySystem = {
    // Generar nueva key
    generateKey(clientName, days = 30, dailyLimit = 50) {
        const key = 'KEY_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        
        const expiration = new Date();
        expiration.setDate(expiration.getDate() + days);
        
        keysDB[key] = {
            client: clientName,
            created: new Date().toISOString(),
            expires: expiration.toISOString(),
            days: days,
            dailyLimit: dailyLimit,
            usedToday: 0,
            totalUses: 0,
            active: true,
            lastReset: new Date().toDateString(),
            lastUse: null
        };
        
        saveDB();
        return key;
    },

    // Verificar key
    verifyKey(key) {
        if (!keysDB[key]) {
            return { valid: false, error: 'Key no existe' };
        }
        
        const keyInfo = keysDB[key];
        
        if (!keyInfo.active) {
            return { valid: false, error: 'Key desactivada' };
        }
        
        // Verificar expiración
        if (new Date() > new Date(keyInfo.expires)) {
            return { valid: false, error: 'Key expirada' };
        }
        
        // Reset diario
        const today = new Date().toDateString();
        if (keyInfo.lastReset !== today) {
            keyInfo.usedToday = 0;
            keyInfo.lastReset = today;
        }
        
        // Verificar límite
        if (keyInfo.usedToday >= keyInfo.dailyLimit) {
            return { valid: false, error: `Límite diario alcanzado (${keyInfo.dailyLimit})` };
        }
        
        // Actualizar uso
        keyInfo.usedToday++;
        keyInfo.totalUses++;
        keyInfo.lastUse = new Date().toISOString();
        saveDB();
        
        return {
            valid: true,
            info: keyInfo,
            remaining: keyInfo.dailyLimit - keyInfo.usedToday,
            daysLeft: Math.ceil((new Date(keyInfo.expires) - new Date()) / (1000 * 60 * 60 * 24))
        };
    },

    // Listar keys
    listKeys() {
        return keysDB;
    },

    // Activar/Desactivar
    setKeyStatus(key, status) {
        if (keysDB[key]) {
            keysDB[key].active = status;
            saveDB();
            return true;
        }
        return false;
    },

    // Eliminar key
    deleteKey(key) {
        if (keysDB[key]) {
            delete keysDB[key];
            saveDB();
            return true;
        }
        return false;
    },

    // Estadísticas
    getStats() {
        const keys = Object.keys(keysDB);
        return {
            total: keys.length,
            active: keys.filter(k => keysDB[k].active).length,
            expired: keys.filter(k => new Date(keysDB[k].expires) < new Date()).length
        };
    }
};

// Cargar base de datos al inicio
loadDB();

// Handler principal
let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Verificar si es el owner
    const sender = m.sender;
    if (!sender.includes(OWNER_NUMBER)) {
        return conn.sendMessage(m.chat, { 
            text: '❌ Solo el propietario puede usar este comando.' 
        }, { quoted: m });
    }

    if (!text) {
        return showHelp(conn, m, usedPrefix, command);
    }

    const args = text.split(' ');
    const action = args[0].toLowerCase();

    try {
        switch (action) {
            case 'generar':
            case 'crear':
                return await generateKey(conn, m, args, usedPrefix, command);
            
            case 'listar':
            case 'lista':
                return await listKeys(conn, m);
            
            case 'activar':
                return await setKeyStatus(conn, m, args[1], true);
            
            case 'desactivar':
                return await setKeyStatus(conn, m, args[1], false);
            
            case 'eliminar':
                return await deleteKey(conn, m, args[1]);
            
            case 'estadisticas':
            case 'stats':
                return await showStats(conn, m);
            
            default:
                return showHelp(conn, m, usedPrefix, command);
        }
    } catch (error) {
        console.error(error);
        return conn.sendMessage(m.chat, { 
            text: `❌ Error: ${error.message}` 
        }, { quoted: m });
    }
};

// Función para generar key
async function generateKey(conn, m, args, usedPrefix, command) {
    if (args.length < 2) {
        return conn.sendMessage(m.chat, { 
            text: `❌ Formato: ${usedPrefix + command} generar [nombre] [días] [límite]\n💡 Ejemplo: ${usedPrefix + command} generar "Mi Bot" 30 100` 
        }, { quoted: m });
    }

    const name = args[1];
    const days = parseInt(args[2]) || 30;
    const limit = parseInt(args[3]) || 50;

    const newKey = KeySystem.generateKey(name, days, limit);

    const message = `🔑 *NUEVA KEY CREADA* 🔑\n\n` +
                   `👤 *Cliente:* ${name}\n` +
                   `🔑 *Key:* \`${newKey}\`\n` +
                   `📅 *Válida por:* ${days} días\n` +
                   `📊 *Límite diario:* ${limit} usos\n\n` +
                   `💡 *Comparte esta key con el desarrollador*`;

    return conn.sendMessage(m.chat, { text: message }, { quoted: m });
}

// Función para listar keys
async function listKeys(conn, m) {
    const keys = KeySystem.listKeys();
    const keyList = Object.keys(keys);

    if (keyList.length === 0) {
        return conn.sendMessage(m.chat, { 
            text: '📭 No hay keys registradas.' 
        }, { quoted: m });
    }

    let message = `📋 *KEYS REGISTRADAS* 📋\n\n`;
    
    keyList.forEach(key => {
        const info = keys[key];
        const status = info.active ? '🟢' : '🔴';
        const daysLeft = Math.ceil((new Date(info.expires) - new Date()) / (1000 * 60 * 60 * 24));
        
        message += `${status} *${info.client}*\n`;
        message += `🔑 ${key}\n`;
        message += `📅 Días restantes: ${daysLeft}\n`;
        message += `📊 Usos hoy: ${info.usedToday}/${info.dailyLimit}\n`;
        message += `🔧 Estado: ${info.active ? 'Activa' : 'Inactiva'}\n\n`;
    });

    return conn.sendMessage(m.chat, { text: message }, { quoted: m });
}

// Función para activar/desactivar
async function setKeyStatus(conn, m, key, status) {
    if (!key) {
        return conn.sendMessage(m.chat, { 
            text: `❌ Debes especificar una key.` 
        }, { quoted: m });
    }

    if (KeySystem.setKeyStatus(key, status)) {
        const action = status ? 'activada' : 'desactivada';
        return conn.sendMessage(m.chat, { 
            text: `✅ Key ${action} correctamente.` 
        }, { quoted: m });
    } else {
        return conn.sendMessage(m.chat, { 
            text: `❌ Key no encontrada.` 
        }, { quoted: m });
    }
}

// Función para eliminar key
async function deleteKey(conn, m, key) {
    if (!key) {
        return conn.sendMessage(m.chat, { 
            text: `❌ Debes especificar una key.` 
        }, { quoted: m });
    }

    if (KeySystem.deleteKey(key)) {
        return conn.sendMessage(m.chat, { 
            text: `✅ Key eliminada correctamente.` 
        }, { quoted: m });
    } else {
        return conn.sendMessage(m.chat, { 
            text: `❌ Key no encontrada.` 
        }, { quoted: m });
    }
}

// Función para estadísticas
async function showStats(conn, m) {
    const stats = KeySystem.getStats();
    const message = `📊 *ESTADÍSTICAS DEL SISTEMA* 📊\n\n` +
                   `🔑 *Total de keys:* ${stats.total}\n` +
                   `🟢 *Keys activas:* ${stats.active}\n` +
                   `🔴 *Keys expiradas:* ${stats.expired}\n` +
                   `📈 *Sistema funcionando correctamente*`;

    return conn.sendMessage(m.chat, { text: message }, { quoted: m });
}

// Función de ayuda
async function showHelp(conn, m, usedPrefix, command) {
    const help = `🔑 *SISTEMA DE GESTIÓN DE KEYS* 🔑\n\n` +
                `*Comandos disponibles:*\n\n` +
                `• ${usedPrefix + command} generar [nombre] [días] [límite]\n` +
                `  → Crear nueva key\n\n` +
                `• ${usedPrefix + command} listar\n` +
                `  → Ver todas las keys\n\n` +
                `• ${usedPrefix + command} activar [key]\n` +
                `  → Activar key\n\n` +
                `• ${usedPrefix + command} desactivar [key]\n` +
                `  → Desactivar key\n\n` +
                `• ${usedPrefix + command} eliminar [key]\n` +
                `  → Eliminar key\n\n` +
                `• ${usedPrefix + command} estadisticas\n` +
                `  → Ver estadísticas\n\n` +
                `💡 *Ejemplo práctico:*\n` +
                `${usedPrefix + command} generar "Bot Amigo" 30 100`;

    return conn.sendMessage(m.chat, { text: help }, { quoted: m });
}

// Configuración del handler
handler.help = ['keys'];
handler.tags = ['admin'];
handler.command = /^(keys|apikeys|gestionarkeys|sistemakeys)$/i;
handler.register = true;

export default handler;
export { KeySystem };
