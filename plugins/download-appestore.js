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

// Verificar tamaño grande
const appSize = appInfo.fileSizeBytes ? appInfo.fileSizeBytes / (1024 * 1024) : 0;
if (appSize > 300) {
    return m.reply(`*${xdownload} ⚠️ APP DEMASIADO GRANDE*\n\n` +
        `📦 Tamaño: ${appSize.toFixed(2)} MB\n` +
        `📏 Límite: 300 MB\n\n` +
        `💡 Intenta con una aplicación más pequeña`);
}

// Mostrar info inicial
await conn.sendMessage(m.chat, {
    text: `*⏳ DESCARGANDO...*\n\n` +
          `📱 *${appInfo.trackName}*\n` +
          `👨‍💻 ${appInfo.artistName}\n` +
          `🅅 v${appInfo.version}\n` +
          `📦 ${formatSize(appInfo.fileSizeBytes)}\n\n` +
          `_Tiempo estimado: ${Math.max(1, Math.floor(appSize / 10))} min_`
}, { quoted: fkontak });

// Descargar app con timeout adaptativo
const timeout = Math.min(300000, Math.max(120000, appSize * 2000)); // Timeout adaptativo
const downloadResult = await downloadAppIPA(appId, appInfo, timeout);

if (!downloadResult.success) {
    await handleDownloadError(m, downloadResult.error, appInfo);
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

// Función mejorada de descarga
async function downloadAppIPA(appId, appInfo, customTimeout = 180000) {
    const tempDir = './temp_apps/';
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    const filePath = path.join(tempDir, `app_${appId}_${Date.now()}.ipa`);
    
    try {
        // Servicios de descarga con prioridad
        const services = [
            {
                url: `https://ipadownload-api.com/v1/ipa/${appId}`,
                name: 'IPADownloadAPI',
                timeout: customTimeout
            },
            {
                url: `https://app.ioserver.com/download/${appId}`,
                name: 'iOServer',
                timeout: customTimeout
            },
            {
                url: `https://ipa.getapp.net/download/${appId}`,
                name: 'GetApp',
                timeout: customTimeout
            },
            {
                url: `https://iosapp.download/api/get.php?id=${appId}`,
                name: 'iOSAppDownload',
                timeout: customTimeout
            }
        ];
        
        for (const service of services) {
            try {
                console.log(`Intentando servicio: ${service.name}`);
                
                const response = await axios({
                    method: 'GET',
                    url: service.url,
                    responseType: 'stream',
                    timeout: service.timeout,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': '*/*',
                        'Connection': 'keep-alive'
                    },
                    maxContentLength: 500 * 1024 * 1024, // 500MB máximo
                });
                
                // Descarga con progreso
                let downloaded = 0;
                response.data.on('data', (chunk) => {
                    downloaded += chunk.length;
                    console.log(`Descargados: ${(downloaded / (1024 * 1024)).toFixed(2)} MB`);
                });
                
                await streamPipeline(response.data, fs.createWriteStream(filePath));
                
                // Verificar archivo
                const stats = fs.statSync(filePath);
                if (stats.size > 50000) { // Mayor a 50KB
                    console.log(`✅ Descarga exitosa: ${service.name}, Tamaño: ${formatSize(stats.size)}`);
                    return { success: true, filePath, size: stats.size, service: service.name };
                }
                
                fs.unlinkSync(filePath);
                console.log(`❌ Archivo muy pequeño: ${stats.size} bytes`);
                
            } catch (error) {
                console.log(`❌ Servicio ${service.name} falló:`, error.message);
                continue;
            }
        }
        
        throw new Error('Todos los servicios de descarga fallaron o timeout');
        
    } catch (error) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return { 
            success: false, 
            error: error.message,
            isTimeout: error.message.includes('timeout')
        };
    }
}

// Manejo de errores mejorado
async function handleDownloadError(m, error, appInfo) {
    if (error.includes('timeout')) {
        await m.reply(`*⏰ TIMEOUT EN DESCARGA*\n\n` +
            `📱 *${appInfo.trackName}*\n` +
            `📦 ${formatSize(appInfo.fileSizeBytes)}\n\n` +
            `💡 *Soluciones:*\n` +
            `• La app es muy grande (>300MB)\n` +
            `• Servidor lento\n` +
            `• Intenta con apps más pequeñas\n` +
            `• Reintenta más tarde`);
    } else if (error.includes('fallaron')) {
        await m.reply(`*❌ SERVICIOS NO DISPONIBLES*\n\n` +
            `📱 *${appInfo.trackName}*\n\n` +
            `💡 *Posibles causas:*\n` +
            `• App muy nueva\n` +
            `• Servicios de descarga offline\n` +
            `• App no disponible para descarga\n` +
            `• Intenta con otra app`);
    } else {
        await m.reply(`*❌ ERROR EN DESCARGA*\n\n${error}`);
    }
    m.react('❌');
}

// Función para enviar archivo
async function sendAppFile(conn, m, filePath, appInfo) {
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
                `📦 ${formatSize(fileStats.size)}\n\n` +
                `⚡ *Lista para instalar*`
    }, { quoted: fkontak });
}

// Funciones auxiliares (mantener igual)
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
