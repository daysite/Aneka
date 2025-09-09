import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {

// Comando de ayuda
if (!text || text === 'help') {
    return m.reply(`*${xsearch} APP STORE SEARCH*\n\n° *Uso:* ${usedPrefix}appstore <nombre app>\n° *Ejemplo:* ${usedPrefix}appstore WhatsApp\n° *Alias:* appsearch, iosapp\n\n° *Búsqueda por ID:* ${usedPrefix}appstore id <app_id>\n° *Top apps:* ${usedPrefix}appstore top <categoría>`);
}

try {
let result;
let txt = '';

// Búsqueda por ID de app
if (text.startsWith('id ')) {
    const appId = text.split(' ')[1];
    let api = `https://itunes.apple.com/lookup?id=${appId}&country=US`;
    
    let response = await fetch(api);
    let json = await response.json();
    result = json.results[0];
    
    if (!result) return m.reply(`*${xsearch} No se encontró app con ID: ${appId}*`);

// Búsqueda de top apps por categoría
} else if (text.startsWith('top ')) {
    const category = text.split(' ')[1] || 'all';
    let api = `https://itunes.apple.com/us/rss/toppaidapplications/limit=10/json`;
    
    let response = await fetch(api);
    let json = await response.json();
    let entries = json.feed.entry.slice(0, 5);
    
    txt = `\`\`\`乂 TOP APPS - APP STORE\`\`\`\n\n`;
    entries.forEach((app, index) => {
        txt += `° ${index + 1}. *${app['im:name'].label}*\n`;
        txt += `   💰 ${app['im:price'].label} | ⭐ ${app['im:rating']?.label || 'N/A'}\n`;
        txt += `   🔗 ${app.link.attributes.href}\n\n`;
    });
    
    return conn.sendMessage(m.chat, { text: txt }, { quoted: fkontak });

// Búsqueda normal por nombre
} else {
    let api = `https://itunes.apple.com/search?term=${encodeURIComponent(text)}&media=software&entity=software&limit=5&country=US`;
    
    let response = await fetch(api);
    let json = await response.json();
    result = json.results[0];
    
    if (!result) return m.reply(`*${xsearch} No se encontraron resultados para "${text}"*`);
}

// Formatear la información de la app
let releaseDate = new Date(result.releaseDate).toLocaleDateString('es-ES');
let fileSize = result.fileSizeBytes ? (result.fileSizeBytes / (1024 * 1024)).toFixed(2) + ' MB' : 'N/A';
let rating = result.averageUserRating ? `⭐ ${result.averageUserRating.toFixed(1)}/5 (${result.userRatingCount} reseñas)` : 'Sin calificaciones';

txt = `\`\`\`乂 APP STORE - SEARCH\`\`\`\n\n
° 📱 *\`Nombre:\`* ${result.trackName}
° 👨‍💻 *\`Desarrollador:\`* ${result.artistName}
° 💰 *\`Precio:\`* ${result.price === 0 ? '🆓 Gratis' : '💲 $' + result.price}
° ${rating}
° 🗂️ *\`Género:\`* ${result.primaryGenreName}
° 📦 *\`Tamaño:\`* ${fileSize}
° 📅 *\`Actualizado:\`* ${releaseDate}
° 🌐 *\`Versión:\`* ${result.version || 'N/A'}
° 🔞 *\`Edad:\`* ${result.contentAdvisoryRating || '4+'}
° 📝 *\`Descripción:\`*\n> ${result.description ? result.description.substring(0, 150) + '...' : 'Sin descripción'}\n
° 🔗 *\`Enlace App Store:\`* ${result.trackViewUrl}
° 🆔 *\`App ID:\`* ${result.trackId}`;

// Enviar mensaje de texto
await conn.sendMessage(m.chat, { text: txt }, { quoted: fkontak });

// Enviar imagen en alta calidad
if (result.artworkUrl512) {
    await conn.sendMessage(m.chat, { 
        image: { url: result.artworkUrl512.replace('512x512', '1024x1024') }, 
        caption: `🎨 ${result.trackName}` 
    }, { quoted: fkontak });
}

m.react('✅');

} catch (error) {
console.error(error);
m.reply(`*${xsearch} Error en la búsqueda: ${error.message}*`);
m.react('✖️');
}
};

handler.help = ['appstore', 'appsearch', 'iosapp'];
handler.tags = ['search', 'apps', 'tools'];
handler.command = ['appstore', 'appsearch', 'iosapp'];

export default handler;
