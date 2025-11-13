// sistema-keys.js - CON DEBUG
import fs from 'fs';

console.log('🟢 SISTEMA-KEY: Archivo cargado correctamente');

// Configuración
const KEYS_FILE = './keys_database.json';
const OWNER_NUMBER = '51999999999'; // CAMBIA POR TU NÚMERO

console.log('🟢 SISTEMA-KEY: Variables configuradas');

// Base de datos simple
let keysDB = {};

// Cargar base de datos
function loadDB() {
    console.log('🟢 SISTEMA-KEY: Intentando cargar DB');
    try {
        if (fs.existsSync(KEYS_FILE)) {
            console.log('📁 SISTEMA-KEY: Archivo DB existe');
            const data = fs.readFileSync(KEYS_FILE, 'utf8');
            keysDB = JSON.parse(data);
            console.log('✅ SISTEMA-KEY: DB cargada correctamente');
        } else {
            console.log('📁 SISTEMA-KEY: Archivo DB no existe, se creará nuevo');
        }
    } catch (e) {
        console.log('❌ SISTEMA-KEY: Error cargando DB:', e.message);
        keysDB = {};
    }
}

// Sistema de Keys
const KeySystem = {
    generateKey(clientName, days = 30, dailyLimit = 50) {
        console.log('🔑 SISTEMA-KEY: Generando nueva key para:', clientName);
        const key = 'KEY_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        
        keysDB[key] = {
            client: clientName,
            created: new Date().toISOString(),
            dailyLimit: dailyLimit,
            usedToday: 0,
            active: true
        };
        
        console.log('✅ SISTEMA-KEY: Key generada:', key);
        return key;
    }
};

// Cargar base de datos al inicio
loadDB();
console.log('🟢 SISTEMA-KEY: DB inicializada');

// Handler principal
let handler = async (m, { conn, text, usedPrefix, command }) => {
    console.log('🎯 SISTEMA-KEY: Handler ejecutado');
    console.log('📝 SISTEMA-KEY: Texto recibido:', text);
    console.log('👤 SISTEMA-KEY: Sender:', m.sender);
    console.log('🔧 SISTEMA-KEY: Comando:', command);
    console.log('📞 SISTEMA-KEY: Owner configurado:', OWNER_NUMBER);

    try {
        // Verificar si es el owner
        const sender = m.sender;
        console.log('🔍 SISTEMA-KEY: Verificando owner...');
        console.log('🔍 SISTEMA-KEY: Sender contiene owner?', sender.includes(OWNER_NUMBER));
        
        if (!sender.includes(OWNER_NUMBER)) {
            console.log('❌ SISTEMA-KEY: No es owner, bloqueando');
            return conn.sendMessage(m.chat, { 
                text: '❌ Solo el propietario puede usar este comando.' 
            }, { quoted: m });
        }

        console.log('✅ SISTEMA-KEY: Es owner, continuando...');

        if (!text) {
            console.log('ℹ️ SISTEMA-KEY: Mostrando ayuda (sin texto)');
            return showHelp(conn, m, usedPrefix, command);
        }

        console.log('🔧 SISTEMA-KEY: Procesando texto:', text);
        const args = text.split(' ');
        const action = args[0].toLowerCase();
        console.log('🔧 SISTEMA-KEY: Acción detectada:', action);

        switch (action) {
            case 'generar':
            case 'crear':
                console.log('🔧 SISTEMA-KEY: Ejecutando generar');
                return await generateKey(conn, m, args, usedPrefix, command);
            
            case 'listar':
            case 'lista':
                console.log('🔧 SISTEMA-KEY: Ejecutando listar');
                return await listKeys(conn, m);
            
            default:
                console.log('🔧 SISTEMA-KEY: Acción no reconocida, mostrando ayuda');
                return showHelp(conn, m, usedPrefix, command);
        }
    } catch (error) {
        console.error('💥 SISTEMA-KEY: Error en handler:', error);
        return conn.sendMessage(m.chat, { 
            text: `❌ Error: ${error.message}` 
        }, { quoted: m });
    }
};

// Función para generar key
async function generateKey(conn, m, args, usedPrefix, command) {
    console.log('🔑 SISTEMA-KEY: Iniciando generación de key');
    
    if (args.length < 2) {
        console.log('❌ SISTEMA-KEY: Faltan argumentos para generar');
        return conn.sendMessage(m.chat, { 
            text: `❌ Formato: ${usedPrefix + command} generar [nombre]\n💡 Ejemplo: ${usedPrefix + command} generar "Mi Bot"` 
        }, { quoted: m });
    }

    const name = args[1];
    console.log('🔑 SISTEMA-KEY: Generando key para:', name);
    
    const newKey = KeySystem.generateKey(name);

    const message = `🔑 *KEY GENERADA* 🔑\n\n` +
                   `👤 Cliente: ${name}\n` +
                   `🔑 Key: \`${newKey}\`\n\n` +
                   `✅ Key creada exitosamente`;

    console.log('✅ SISTEMA-KEY: Key generada, enviando mensaje');
    return conn.sendMessage(m.chat, { text: message }, { quoted: m });
}

// Función para listar keys
async function listKeys(conn, m) {
    console.log('📋 SISTEMA-KEY: Listando keys');
    
    const keyList = Object.keys(keysDB);
    console.log('📋 SISTEMA-KEY: Keys encontradas:', keyList.length);

    if (keyList.length === 0) {
        console.log('📭 SISTEMA-KEY: No hay keys');
        return conn.sendMessage(m.chat, { 
            text: '📭 No hay keys registradas.' 
        }, { quoted: m });
    }

    let message = `📋 *KEYS REGISTRADAS* 📋\n\n`;
    
    keyList.forEach(key => {
        const info = keysDB[key];
        message += `👤 ${info.client}\n`;
        message += `🔑 ${key}\n`;
        message += `📊 Usos: ${info.usedToday}/${info.dailyLimit}\n\n`;
    });

    console.log('✅ SISTEMA-KEY: Lista de keys preparada');
    return conn.sendMessage(m.chat, { text: message }, { quoted: m });
}

// Función de ayuda
async function showHelp(conn, m, usedPrefix, command) {
    console.log('ℹ️ SISTEMA-KEY: Mostrando ayuda');
    
    const help = `🔑 *SISTEMA DE KEYS* 🔑\n\n` +
                `Comandos:\n` +
                `• ${usedPrefix + command} generar [nombre]\n` +
                `• ${usedPrefix + command} listar\n\n` +
                `Ejemplo:\n${usedPrefix + command} generar "Mi Bot"`;

    return conn.sendMessage(m.chat, { text: help }, { quoted: m });
}

// Configuración del handler
console.log('⚙️ SISTEMA-KEY: Configurando handler...');
handler.help = ['keys'];
handler.tags = ['admin'];
handler.command = /^(keys|apikeys|gestionarkeys)$/i;
handler.register = true;

console.log('✅ SISTEMA-KEY: Handler configurado, exportando...');

export default handler;
