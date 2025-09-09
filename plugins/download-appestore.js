import fetch from 'node-fetch';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, text, usedPrefix, command }) => {

if (!text) {
    return m.reply(`*${xdownload} APP STORE DOWNLOAD*\n\n` +
        `° *Uso:* ${usedPrefix}appdownload <enlace|id>\n` +
        `° *Ejemplos:*\n` +
        `  ${usedPrefix}appdownload https://apps.apple.com/us/app/whatsapp/id310633997\n` +
        `  ${usedPrefix}appdownload 310633997`);
}

try {
let appId = text.trim();

// Extraer ID de la URL
if (appId.includes('apps.apple.com')) {
    const idMatch = appId.match(/id(\d+)/);
    if (idMatch) appId = idMatch[1];
}

if (!/^\d+$/.test(appId)) {
    return m.reply(`*${xdownload} ID inválido. Debe ser numérico.*`);
}

m.react('🔍');

// Obtener información de la app
const appInfo = await getAppInfo(appId);
if (!appInfo) {
    return m.reply(`*${xdownload} Aplicación no encontrada.*`);
}

// Información inicial
let infoTxt = `\`\`\`乂 DESCARGANDO APP\`\`\`\n\n` +
`° 📱 *${appInfo.trackName}*\n` +
`° 👨‍💻 ${appInfo.artistName}\n` +
`° 🅅 v${appInfo.version}\n` +
`° 📦 ${appInfo.fileSizeBytes ? (appInfo.fileSizeBytes / (1024 * 1024)).toFixed(2) + ' MB' : 'N/A'}\n\n` +
`° ⏳ *Descargando...* Por favor espere.`;

await conn.sendMessage(m.chat, { text: infoTxt }, { quoted: fkontak });

// Descargar la aplicación
const downloadResult = await downloadApp(appId, appInfo.trackName);

if (!downloadResult.success) {
    return m.reply(`*${xdownload} Error al descargar: ${downloadResult.error}*`);
}

m.react('📦');

// Enviar el archivo IPA
const filePath = downloadResult.filePath;
const fileName = `${appInfo.trackName.replace(/[^a-zA-Z0-9]/g, '_')}_v${appInfo.version}.ipa`;

await conn.sendMessage(m.chat, {
    document: { url: `file://${filePath}` },
    fileName: fileName,
    mimetype: 'application/octet-stream',
    caption: `*${appInfo.trackName}* v${appInfo.version}\n` +
            `📦 Tamaño: ${(fs.statSync(filePath).size / (1024 * 1024)).toFixed(2)} MB\n` +
            `⚡ Listo para instalar via AltStore/Sideloadly`
}, { quoted: fkontak });

// Limpiar archivo temporal después de enviar
setTimeout(() => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}, 30000);

m.react('✅');

} catch (error) {
console.error('Download error:', error);
m.reply(`*${xdownload} Error: ${error.message}*`);
m.react('❌');
}
};

// Función para obtener información de la app
async function getAppInfo(appId) {
    try {
        const response = await fetch(`https://itunes.apple.com/lookup?id=${appId}&country=US`);
        const data = await response.json();
        return data.results[0];
    } catch (error) {
        console.error('App info error:', error);
        return null;
    }
}

// Función principal para descargar la app
async function downloadApp(appId, appName) {
    try {
        // Primero intentar con servicios directos
        const directDownload = await tryDirectDownload(appId);
        if (directDownload.success) {
            return directDownload;
        }

        // Si falla, intentar con servicios alternativos
        const alternativeDownload = await tryAlternativeServices(appId, appName);
        if (alternativeDownload.success) {
            return alternativeDownload;
        }

        throw new Error('No se pudo descargar la aplicación');

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Intentar descarga directa
async function tryDirectDownload(appId) {
    const tempDir = './temp/';
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const filePath = path.join(tempDir, `${appId}_${Date.now()}.ipa`);

    try {
        // Servicio 1: IPA Download directo
        const downloadUrl = `https://ipa.getapp.net/download/${appId}`;
        
        const response = await axios({
            method: 'GET',
            url: downloadUrl,
            responseType: 'stream',
            timeout: 120000
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve({
                success: true,
                filePath: filePath,
                size: fs.statSync(filePath).size
            }));
            writer.on('error', reject);
        });

    } catch (error) {
        // Si falla, limpiar archivo
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw error;
    }
}

// Intentar con servicios alternativos
async function tryAlternativeServices(appId, appName) {
    const tempDir = './temp/';
    const filePath = path.join(tempDir, `${appId}_${Date.now()}.ipa`);

    try {
        // Lista de servicios de descarga
        const services = [
            `https://ipadownload.now.sh/api/ipa/${appId}`,
            `https://iosapp.download/api/get.php?id=${appId}`,
            `https://app.ioserver.com/download/${appId}`
        ];

        for (const serviceUrl of services) {
            try {
                const response = await axios({
                    method: 'GET',
                    url: serviceUrl,
                    responseType: 'stream',
                    timeout: 60000
                });

                const writer = fs.createWriteStream(filePath);
                response.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                // Verificar que el archivo sea válido
                const stats = fs.statSync(filePath);
                if (stats.size > 1024) { // Archivo mayor a 1KB
                    return {
                        success: true,
                        filePath: filePath,
                        size: stats.size
                    };
                } else {
                    fs.unlinkSync(filePath);
                }

            } catch (e) {
                // Continuar con el siguiente servicio
                continue;
            }
        }

        throw new Error('Todos los servicios fallaron');

    } catch (error) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw error;
    }
}

handler.help = ['appdownload', 'ipadownload', 'descargarapp'];
handler.tags = ['download', 'apps', 'tools'];
handler.command = ['appdownload', 'ipadownload', 'descargarapp', 'appdl'];

// Configuración adicional
handler.limit = true;
handler.premium = false;
handler.register = true;

export default handler;
