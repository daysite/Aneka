import fetch from 'node-fetch';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';

const streamPipeline = promisify(pipeline);

let handler = async (m, { conn, text, usedPrefix, command }) => {

if (!text) {
    return m.reply(`*${xdownload} 📱 DESCARGADOR DE APPS*\n\n` +
        `° *Uso:* ${usedPrefix}appdownload <enlace|id>\n` +
        `° *Ejemplos:*\n` +
        `  ${usedPrefix}appdownload 310633997\n` +
        `  ${usedPrefix}appdownload https://apps.apple.com/us/app/whatsapp/id310633997`);
}

try {
let appId = extractAppId(text);
if (!appId) {
    return m.reply(`*${xdownload} ID/Enlace inválido.*\nEjemplo: 310633997`);
}

m.react('🔍');

// Obtener información
const appInfo = await getAppInfo(appId);
if (!appInfo) {
    return m.reply(`*${xdownload} App no encontrada en App Store.*`);
}

// Mostrar info inicial
await conn.sendMessage(m.chat, {
    text: `*⏳ BUSCANDO DESCARGAS...*\n\n` +
          `📱 *${appInfo.trackName}*\n` +
          `👨‍💻 ${appInfo.artistName}\n` +
          `🅅 v${appInfo.version}\n` +
          `📦 ${formatSize(appInfo.fileSizeBytes)}\n\n` +
          `_Escaneando servicios disponibles..._`
}, { quoted: fkontak });

// Intentar descarga con múltiples métodos
const downloadResult = await tryAllDownloadMethods(appId, appInfo);

if (!downloadResult.success) {
    // Ofrecer enlaces manuales como alternativa
    await offerAlternativeLinks(m, appInfo, appId);
    return;
}

m.react('📦');

// Enviar archivo
await sendAppFile(conn, m, downloadResult.filePath, appInfo);

// Limpiar archivo
setTimeout(() => {
    if (fs.existsSync(downloadResult.filePath)) {
        fs.unlinkSync(downloadResult.filePath);
    }
}, 60000);

m.react('✅');

} catch (error) {
console.error('Error general:', error);
m.reply(`*❌ ERROR:* ${error.message}`);
m.react('❌');
}
};

// MÉTODO PRINCIPAL MEJORADO
async function tryAllDownloadMethods(appId, appInfo) {
    const tempDir = './temp_apps/';
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    const filePath = path.join(tempDir, `app_${appId}_${Date.now()}.ipa`);
    
    // 1. PRIMERO: Servicios directos confiables
    const directServices = [
        {
            url: `https://api.ipa.download/?id=${appId}`,
            name: 'IPADownloadAPI',
            timeout: 30000
        },
        {
            url: `https://ipas.io/api/download/${appId}`,
            name: 'IPAs.io',
            timeout: 25000
        },
        {
            url: `https://appdb.to/api/v1.2/apps/${appId}/download`,
            name: 'AppDB',
            timeout: 35000
        }
    ];
    
    for (const service of directServices) {
        try {
            console.log(`🔄 Intentando servicio directo: ${service.name}`);
            const result = await tryDownloadService(service, filePath);
            if (result.success) return result;
        } catch (error) {
            console.log(`❌ ${service.name} falló:`, error.message);
        }
    }
    
    // 2. SEGUNDO: Servicios de repositorios conocidos
    const repoServices = [
        {
            url: `https://iosninja.io/ipa/api/download/${appId}`,
            name: 'iOSNinja',
            timeout: 40000
        },
        {
            url: `https://ipaspot.com/download/${appId}`,
            name: 'IPASpot',
            timeout: 30000
        },
        {
            url: `https://ipa.cypwn.xyz/api.php?id=${appId}`,
            name: 'CypwnIPA',
            timeout: 35000
        }
    ];
    
    for (const service of repoServices) {
        try {
            console.log(`🔄 Intentando repositorio: ${service.name}`);
            const result = await tryDownloadService(service, filePath);
            if (result.success) return result;
        } catch (error) {
            console.log(`❌ ${service.name} falló:`, error.message);
        }
    }
    
    // 3. TERCERO: Método de respaldo con web scraping simulado
    try {
        console.log('🔄 Intentando método de respaldo...');
        const backupResult = await backupDownloadMethod(appId, filePath);
        if (backupResult.success) return backupResult;
    } catch (error) {
        console.log('❌ Método de respaldo falló:', error.message);
    }
    
    return { 
        success: false, 
        error: 'Todos los métodos de descarga fallaron',
        service: 'all' 
    };
}

// FUNCIÓN PARA INTENTAR UN SERVICIO
async function tryDownloadService(service, filePath) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), service.timeout);
    
    try {
        const response = await fetch(service.url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
                'Accept': 'application/ipa, */*',
                'Referer': 'https://apps.apple.com/',
                'Origin': 'https://apps.apple.com'
            }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        // Verificar que sea un archivo IPA
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/octet-stream')) {
            throw new Error('Respuesta no es un archivo IPA');
        }
        
        // Guardar archivo
        const fileStream = fs.createWriteStream(filePath);
        await streamPipeline(response.body, fileStream);
        
        // Verificar que el archivo sea válido
        const stats = fs.statSync(filePath);
        if (stats.size > 1000000) { // Mayor a 1MB
            console.log(`✅ Descarga exitosa desde: ${service.name}`);
            return { 
                success: true, 
                filePath, 
                size: stats.size, 
                service: service.name 
            };
        }
        
        // Archivo demasiado pequeño
        fs.unlinkSync(filePath);
        throw new Error('Archivo inválido');
        
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

// MÉTODO DE RESpaldo
async function backupDownloadMethod(appId, filePath) {
    // Este método simula obtener enlaces de respaldo
    // En una implementación real, harías web scraping o usarías APIs alternativas
    
    return { 
        success: false, 
        error: 'Método de respaldo no disponible' 
    };
}

// OFRECER ENLACES ALTERNATIVOS CUANDO FALLAN LAS DESCARGAS AUTOMÁTICAS
async function offerAlternativeLinks(m, appInfo, appId) {
    const alternativeLinks = [
        {
            name: 'iOSGods',
            url: `https://iosgods.com/search/?q=${encodeURIComponent(appInfo.trackName)}`,
            quality: 'Mods Premium'
        },
        {
            name: 'AppCake',
            url: `https://www.iphonecake.com/app_${appId}.html`,
            quality: 'Versiones Antiguas'
        },
        {
            name: 'IPARhino',
            url: `https://iparhino.com/app/${appId}`,
            quality: 'Direct Download'
        },
        {
            name: 'iOSEmus',
            url: `https://iosem.us/ipa/${appId}`,
            quality: 'Free IPA'
        }
    ];
    
    let message = `*📱 ENLACES ALTERNATIVOS PARA ${appInfo.trackName}*\n\n`;
    
    alternativeLinks.forEach((link, index) => {
        message += `° ${index + 1}. *${link.name}* [${link.quality}]\n`;
        message += `   🔗 ${link.url}\n\n`;
    });
    
    message += `*💡 INSTRUCCIONES:*\n`;
    message += `• Visita alguno de estos sitios\n`;
    message += `• Descarga el archivo .ipa manualmente\n`;
    message += `• Instala con AltStore o Sideloadly\n\n`;
    message += `*⚠️ NOTA:* Los servicios automáticos están temporalmente offline`;
    
    await m.reply(message);
    m.react('ℹ️');
}

// FUNCIÓN PARA ENVIAR ARCHIVO
async function sendAppFile(conn, m, filePath, appInfo) {
    try {
        const fileStats = fs.statSync(filePath);
        const fileName = generateFileName(appInfo);
        
        await conn.sendMessage(m.chat, {
            document: { url: `file://${filePath}` },
            fileName: fileName,
            mimetype: 'application/octet-stream',
            caption: `*✅ DESCARGA COMPLETADA*\n\n` +
                    `📱 *${appInfo.trackName}*\n` +
                    `👨‍💻 ${appInfo.artistName}\n` +
                    `🅅 v${appInfo.version}\n` +
                    `📦 ${formatSize(fileStats.size)}\n` +
                    `⚡ *Lista para instalar*`
        }, { quoted: fkontak });
        
    } catch (sendError) {
        console.error('Error enviando archivo:', sendError);
        await m.reply(`*⚠️ Error al enviar archivo:* ${sendError.message}`);
    }
}

// FUNCIONES AUXILIARES
function extractAppId(input) {
    if (/^\d+$/.test(input)) return input;
    const match = input.match(/id(\d+)/);
    return match ? match[1] : null;
}

async function getAppInfo(appId) {
    try {
        const response = await fetch(`https://itunes.apple.com/lookup?id=${appId}&country=US`);
        const data = await response.json();
        return data.results[0];
    } catch (error) {
        console.error('Error getting app info:', error);
        return null;
    }
}

function formatSize(bytes) {
    if (!bytes) return 'N/A';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function generateFileName(appInfo) {
    return `${appInfo.trackName.replace(/[^a-zA-Z0-9]/g, '_')}_v${appInfo.version}.ipa`;
}

handler.help = ['appdownload', 'ipadownload'];
handler.tags = ['download', 'apps'];
handler.command = ['appdownload', 'ipadownload', 'descargarapp'];
handler.limit = true;

export default handler;
