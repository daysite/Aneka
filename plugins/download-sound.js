import fetch from 'node-fetch';

// Múltiples APIs de respaldo
const SOUNDCLOUD_APIS = [
  {
    name: 'Starlights',
    search: (query) => `https://api.starlights.uk/api/search/soundcloud?q=${encodeURIComponent(query)}`,
    download: (url) => `https://api.starlights.uk/api/download/soundcloud?url=${encodeURIComponent(url)}`
  },
  {
    name: 'ZeroDy', 
    search: (query) => `https://api.zerody.one/search/soundcloud?q=${encodeURIComponent(query)}`,
    download: (url) => `https://api.zerody.one/download/soundcloud?url=${encodeURIComponent(url)}`
  },
  {
    name: 'MusicDL',
    search: (query) => `https://api.musicdl.org/search/soundcloud?q=${encodeURIComponent(query)}`,
    download: (url) => `https://api.musicdl.org/download/soundcloud?url=${encodeURIComponent(url)}`
  }
];

async function trySoundcloudApi(api, query) {
  try {
    console.log(`Probando API: ${api.name}`);
    
    // Búsqueda
    const searchResponse = await fetch(api.search(query), { timeout: 10000 });
    if (!searchResponse.ok) throw new Error('Búsqueda fallida');
    
    const searchData = await searchResponse.json();
    if (!searchData.data && !searchData.result) throw new Error('Sin resultados');
    
    const results = searchData.data || searchData.result;
    if (!results.length) throw new Error('Array vacío');
    
    const firstResult = results[0];
    const trackUrl = firstResult.url || firstResult.permalink_url;
    
    // Descarga
    const downloadResponse = await fetch(api.download(trackUrl), { timeout: 10000 });
    if (!downloadResponse.ok) throw new Error('Descarga fallida');
    
    const downloadData = await downloadResponse.json();
    const trackInfo = downloadData.data || downloadData.result;
    
    if (!trackInfo || !trackInfo.url) throw new Error('Info incompleta');
    
    return {
      success: true,
      data: trackInfo,
      title: firstResult.title,
      artist: firstResult.artist || firstResult.user?.username,
      thumbnail: firstResult.thumbnail || firstResult.artwork_url,
      api: api.name
    };
    
  } catch (error) {
    console.log(`❌ ${api.name} falló:`, error.message);
    return { success: false, api: api.name };
  }
}

let handler = async (m, { conn, command, usedPrefix, args, text }) => {
  if (!text) {
    return conn.reply(m.chat, 
      `🎵 *SoundCloud Downloader* 🎵\n\n` +
      `❌ Debes ingresar el nombre de una canción.\n\n` +
      `💡 *Ejemplo:*\n` +
      `> ${usedPrefix + command} Lisa Money\n` +
      `> ${usedPrefix + command} Blackpink`, 
    m);
  }
  
  await m.react('🕒');
  
  try {
    // Intentar con todas las APIs
    let result = null;
    
    for (const api of SOUNDCLOUD_APIS) {
      const apiResult = await trySoundcloudApi(api, text);
      if (apiResult.success) {
        result = apiResult;
        break;
      }
    }
    
    // Si todas las APIs fallaron
    if (!result) {
      await m.react('✖️');
      return conn.reply(m.chat, 
        `❌ *Error de conexión*\n\n` +
        `Todas las APIs de SoundCloud están fallando.\n` +
        `Intenta:\n` +
        `• Usar otro nombre de canción\n` +
        `• Intentar más tarde\n` +
        `• Probar con YouTube en lugar de SoundCloud`, 
      m);
    }
    
    // ÉXITO - Enviar canción
    const { data, title, artist, thumbnail, api } = result;
    
    let infoText = `🎵 *SoundCloud Download* 🎵\n\n`;
    infoText += `📀 *Título:* ${title}\n`;
    if (artist) infoText += `🎤 *Artista:* ${artist}\n`;
    if (data.duration) infoText += `⏱️ *Duración:* ${data.duration}\n`;
    if (data.quality) infoText += `📊 *Calidad:* ${data.quality}\n`;
    infoText += `🔧 *Fuente:* ${api}\n\n`;
    infoText += `⬇️ *Descargando...*`;
    
    // Enviar thumbnail si existe
    if (thumbnail) {
      await conn.sendFile(m.chat, thumbnail, 'thumbnail.jpg', infoText, m);
    } else {
      await conn.reply(m.chat, infoText, m);
    }
    
    // Enviar audio
    await conn.sendMessage(m.chat, {
      audio: { url: data.url },
      fileName: `${title.replace(/[^\w\s]/gi, '')}.mp3`,
      mimetype: 'audio/mpeg'
    }, { quoted: m });
    
    await m.react('✅');
    
  } catch (error) {
    console.error('Error general:', error);
    await m.react('✖️');
    
    await conn.reply(m.chat,
      `❌ *Error crítico*\n\n` +
      `El sistema de SoundCloud no está respondiendo.\n\n` +
      `💡 *Soluciones:*\n` +
      `• Las APIs gratuitas pueden estar caídas\n` +
      `• SoundCloud bloqueó el acceso\n` +
      `• Intenta con YouTube en su lugar`, 
    m);
  }
};

handler.help = ['soundcloud <búsqueda>', 'sound <búsqueda>'];
handler.tags = ['downloader'];
handler.command = ['soundcloud', 'sound', 'sc'];
handler.register = true;

export default handler;
