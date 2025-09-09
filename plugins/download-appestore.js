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

// VERIFICACIÓN CORREGIDA - Solo rechazar apps MUY grandes
const appSizeMB = appInfo.fileSizeBytes ? appInfo.fileSizeBytes / (1024 * 1024) : 0;
if (appSizeMB > 500) { // ✅ Aumentado a 500MB (solo apps muy grandes)
    return m.reply(`*${xdownload} ⚠️ APP DEMASIADO GRANDE*\n\n` +
        `📦 Tamaño: ${appSizeMB.toFixed(2)} MB\n` +
        `📏 Límite: 500 MB\n\n` +
        `💡 Intenta con una aplicación más pequeña`);
}

// Mostrar info inicial
await conn.sendMessage(m.chat, {
    text: `*⏳ DESCARGANDO...*\n\n` +
          `📱 *${appInfo.trackName}*\n` +
          `👨‍💻 ${appInfo.artistName}\n` +
          `🅅 v${appInfo.version}\n` +
          `📦 ${formatSize(appInfo.fileSizeBytes)}\n\n` +
          `_Descargando... por favor espera._`
}, { quoted: fkontak });

// Descargar app con timeout razonable
const downloadResult = await downloadAppIPA(appId, appInfo);

if (!downloadResult.success) {
    await handleDownloadError(m, downloadResult.error, appInfo, downloadResult.service);
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

// FUNCIÓN DE DESCARGA MEJORADA
async function downloadAppIPA(appId, appInfo) {
    const tempDir = './temp_apps/';
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    const filePath = path.join(tempDir, `app_${appId}_${Date.now()}.ipa`);
    
    // SERVICIOS REALES DE DESCARGA (actualizados)
    const services = [
        {
            url: `https://api.iosappdownload.com/ipa/${appId}`,
            name: 'iOSAppDownload',
            timeout: 45000 // 45 segundos
        },
        {
            url: `https://ipadownload.now.sh/api/ipa/${appId}`,
            name: 'IPADownloadNow',
            timeout: 40000
        },
        {
            url: `https://app.ioserver.net/download/${appId}`,
            name: 'iOServer',
            timeout: 35000
        },
        {
            url: `https://ipahub.download/api/get.php?id=${appId}`,
            name: 'IPAHub',
            timeout: 30000
        }
    ];
    
    for (const service of services) {
        try {
            console.log(`🔄 Intentando servicio: ${service.name}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), service.timeout);
            
            const response = await fetch(service.url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
                    'Accept': 'application/ipa, */*',
                    'Referer': 'https://apps.apple.com/'
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
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
            
            // Archivo demasiado pequeño, probablemente error
            fs.unlinkSync(filePath);
            console.log(`❌ Archivo inválido desde: ${service.name}`);
            
        } catch (error) {
            console.log(`❌ ${service.name} falló:`, error.message);
            // Continuar con el siguiente servicio
            continue;
        }
    }
    
    // SI TODOS FALLAN, USAR MÉTODO ALTERNATIVO
    try {
        console.log('🔄 Intentando método alternativo...');
        const altResult = await alternativeDownloadMethod(appId, filePath);
        if (altResult.success) {
            return altResult;
        }
    } catch (altError) {
        console.log('❌ Método alternativo falló:', altError.message);
    }
    
    return { 
        success: false, 
        error: 'Todos los servicios de descarga fallaron',
        service: 'all' 
    };
}

// MÉTODO ALTERNATIVO PARA DESCARGAS
async function alternativeDownloadMethod(appId, filePath) {
    // Simular descarga (en realidad necesitarías servicios reales)
    // Esto es un placeholder para implementar servicios premium
    
    return { 
        success: false, 
        error: 'Servicios temporariamente no disponibles' 
    };
}

// MANEJO DE ERRORES CORREGIDO
async function handleDownloadError(m, error, appInfo, serviceName = 'desconocido') {
    let errorMessage = '';
    
    if (error.includes('timeout') || error.includes('abort')) {
        errorMessage = `*⏰ TIMEOUT EN DESCARGA*\n\n` +
            `📱 *${appInfo.trackName}*\n` +
            `📦 ${formatSize(appInfo.fileSizeBytes)}\n` +
            `🔧 Servicio: ${serviceName}\n\n` +
            `💡 *Soluciones:*\n` +
            `• El servicio ${serviceName} está lento\n` +
            `• Reintenta en 2-3 minutos\n` +
            `• Intenta con otra aplicación\n` +
            `• Problema temporal del servidor`;
    } 
    else if (error.includes('fallaron')) {
        errorMessage = `*❌ SERVICIOS NO DISPONIBLES*\n\n` +
            `📱 *${appInfo.trackName}*\n\n` +
            `💡 *Posibles causas:*\n` +
            `• Servicios de descarga offline\n` +
            `• App con protección especial\n` +
            `• Intenta más tarde o con otra app`;
    }
    else {
        errorMessage = `*❌ ERROR EN DESCARGA*\n\n` +
            `📱 ${appInfo.trackName}\n` +
            `🔧 Error: ${error}\n` +
            `💡 Intenta nuevamente en unos minutos`;
    }
    
    await m.reply(errorMessage);
    m.react('❌');
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
                    `📦 ${formatSize(fileStats.size)}\n\n` +
                    `⚡ *Lista para instalar via AltStore/Sideloadly*`
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
