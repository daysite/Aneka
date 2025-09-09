import fetch from 'node-fetch';
import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {

if (!text) {
    return m.reply(`*${xdownload} APP STORE DOWNLOAD*\n\n` +
        `° *Uso:* ${usedPrefix}appdownload <enlace|id>\n` +
        `° *Ejemplos:*\n` +
        `  ${usedPrefix}appdownload https://apps.apple.com/us/app/whatsapp/id310633997\n` +
        `  ${usedPrefix}appdownload 310633997\n\n` +
        `° *Servicios soportados:* iOSEmus, AppAddict, IPARhino`);
}

try {
let appId = text.trim();

// Extraer ID de diferentes formatos de enlace
if (appId.includes('apps.apple.com')) {
    const idMatch = appId.match(/id(\d+)/);
    if (idMatch) appId = idMatch[1];
} else if (appId.includes('itunes.apple.com')) {
    const idMatch = appId.match(/\/(id)(\d+)/);
    if (idMatch) appId = idMatch[2];
}

// Validar ID
if (!/^\d+$/.test(appId)) {
    return m.reply(`*${xdownload} ID inválido. Debe ser numérico.*\nEjemplo: 310633997`);
}

m.react('🔍');

// Obtener información de la app
const [appInfo, downloadInfo] = await Promise.all([
    getAppInfo(appId),
    getDownloadInfo(appId)
]);

if (!appInfo) {
    return m.reply(`*${xdownload} Aplicación no encontrada.*`);
}

// Mensaje de información
let infoTxt = `\`\`\`乂 APP STORE DOWNLOAD\`\`\`\n\n` +
`° 📱 *${appInfo.trackName}* v${appInfo.version}\n` +
`° 👨‍💻 ${appInfo.artistName}\n` +
`️° 💰 ${appInfo.price === 0 ? '🆓 Gratis' : '💲 $' + appInfo.price}\n` +
`° ⭐ ${appInfo.averageUserRating ? appInfo.averageUserRating.toFixed(1) + '/5' : 'Sin rating'}\n` +
`° 📦 ${appInfo.fileSizeBytes ? (appInfo.fileSizeBytes / (1024 * 1024)).toFixed(2) + ' MB' : 'N/A'}\n\n` +
`° 📥 *PROCESSING DOWNLOAD...*`;

await conn.sendMessage(m.chat, { text: infoTxt }, { quoted: fkontak });

// Enlaces de descarga
if (!downloadInfo || downloadInfo.length === 0) {
    return m.reply(`*${xdownload} No hay enlaces disponibles para esta app.*`);
}

let downloadTxt = `\`\`\`乂 ENLACES DE DESCARGA\`\`\`\n\n` +
`° 📱 *${appInfo.trackName}*\n\n` +
`° 🔗 *Enlaces disponibles:*\n`;

downloadInfo.forEach((link, index) => {
    downloadTxt += `° ${index + 1}. *${link.service}* [${link.quality}]\n`;
    downloadTxt += `   📥 ${link.url}\n`;
    if (link.password) downloadTxt += `   🔐 Pass: ${link.password}\n`;
    downloadTxt += `\n`;
});

downloadTxt += `° ⚠️ *Nota:* Requiere instalación manual via AltStore, Sideloadly, etc.`;

await conn.sendMessage(m.chat, { text: downloadTxt }, { quoted: fkontak });

// Enviar imagen
if (appInfo.artworkUrl512) {
    await conn.sendMessage(m.chat, {
        image: { url: appInfo.artworkUrl512 },
        caption: `🎨 ${appInfo.trackName}`
    }, { quoted: fkontak });
}

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

// Función para obtener información de descarga
async function getDownloadInfo(appId) {
    const services = [
        {
            name: 'iOSEmus',
            url: `https://api.iosem.us/ipa/${appId}`,
            processor: data => data.url ? [{ service: 'iOSEmus', quality: 'High', url: data.url }] : []
        },
        {
            name: 'AppAddict',
            url: `https://appaddict.org/api/app/${appId}`,
            processor: data => data.downloadUrl ? [{ service: 'AppAddict', quality: 'Medium', url: data.downloadUrl }] : []
        }
    ];

    const results = [];

    for (const service of services) {
        try {
            const response = await axios.get(service.url, { timeout: 8000 });
            const links = service.processor(response.data);
            results.push(...links);
        } catch (error) {
            console.log(`Service ${service.name} failed:`, error.message);
        }
    }

    // Enlaces de respaldo
    if (results.length === 0) {
        results.push(
            {
                service: 'iOSGods',
                quality: 'Modded',
                url: `https://iosgods.com/app/${appId}`
            },
            {
                service: 'AppCake',
                quality: 'Original',
                url: `https://www.iphonecake.com/app_${appId}.html`
            },
            {
                service: 'IPARhino',
                quality: 'Premium',
                url: `https://iparhino.com/dl/${appId}`
            }
        );
    }

    return results.slice(0, 5); // Limitar a 5 enlaces
}

handler.help = ['appdownload', 'ipadownload', 'iosdownload'];
handler.tags = ['download', 'apps', 'tools'];
handler.command = ['appdownload', 'ipadownload', 'iosdownload', 'descargarapp', 'appdl'];

export default handler;
