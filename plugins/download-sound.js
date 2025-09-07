import fetch from 'node-fetch';

let handler = async (m, { conn, command, usedPrefix, args, text }) => {
  if (!text) {
    return conn.reply(m.chat, 
      `🎵 *Downloader de Música* 🎵\n\n` +
      `❌ Debes ingresar el nombre de una canción.\n\n` +
      `💡 *Ejemplos:*\n` +
      `> ${usedPrefix + command} Un amor del ayer\n` +
      `> ${usedPrefix + command} Lisa Money\n` +
      `> ${usedPrefix + command} Bad Bunny`, 
    m);
  }
  
  await m.react('🕒');
  
  try {
    // API DE YOUTUBE QUE SÍ FUNCIONA
    await conn.reply(m.chat, `🔍 *Buscando:* "${text}"\n\n⏳ Buscando en YouTube...`, m);
    
    const searchUrl = `https://yt-api.cyclic.app/search?q=${encodeURIComponent(text)}&limit=1`;
    const searchResponse = await fetch(searchUrl, { timeout: 15000 });
    
    if (!searchResponse.ok) {
      await m.react('✖️');
      return conn.reply(m.chat, 
        `❌ Error en la búsqueda\n\n` +
        `Intenta con otro nombre o más tarde.`, 
      m);
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData || searchData.length === 0) {
      await m.react('✖️');
      return conn.reply(m.chat, 
        `❌ No se encontró: "${text}"\n\n` +
        `Intenta con:\n` +
        `• Nombre más exacto\n` +
        `• Artista + Canción`, 
      m);
    }
    
    const video = searchData[0];
    
    // DESCARGAR AUDIO
    await conn.reply(m.chat, `✅ *Encontrado:* ${video.title}\n\n⬇️ Descargando audio...`, m);
    
    const downloadUrl = `https://yt-api.cyclic.app/download?url=${encodeURIComponent(video.url)}&type=audio`;
    const downloadResponse = await fetch(downloadUrl, { timeout: 45000 });
    
    if (!downloadResponse.ok) {
      await m.react('✖️');
      return conn.reply(m.chat, 
        `❌ Error en la descarga\n\n` +
        `El audio es muy largo o no está disponible.`, 
      m);
    }
    
    const audioData = await downloadResponse.json();
    
    if (!audioData.downloadUrl) {
      await m.react('✖️');
      return conn.reply(m.chat, 
        `❌ Enlace de descarga no disponible\n\n` +
        `Intenta con otra canción.`, 
      m);
    }
    
    // OBTENER EL AUDIO
    const audioResponse = await fetch(audioData.downloadUrl, { timeout: 60000 });
    
    if (!audioResponse.ok) {
      await m.react('✖️');
      return conn.reply(m.chat, 
        `❌ Error al obtener el audio\n\n` +
        `El servidor está lento. Intenta más tarde.`, 
      m);
    }
    
    const audioBuffer = await audioResponse.buffer();
    
    // ENVIAR AUDIO
    await conn.sendMessage(m.chat, {
      audio: audioBuffer,
      fileName: `${video.title.replace(/[^\w\s]/gi, '')}.mp3`,
      mimetype: 'audio/mpeg',
      contextInfo: {
        externalAdReply: {
          title: video.title,
          body: `Duración: ${video.duration}`,
          thumbnailUrl: video.thumbnail,
          sourceUrl: video.url
        }
      }
    }, { quoted: m });
    
    // MENSAJE DE ÉXITO
    await conn.reply(m.chat,
      `✅ *Descarga completada*\n\n` +
      `📀 ${video.title}\n` +
      `⏱️ ${video.duration}\n` +
      `👁️ ${video.views} vistas\n\n` +
      `🎵 Fuente: YouTube`, 
    m);
    
    await m.react('✅');
    
  } catch (error) {
    console.error('Error:', error);
    await m.react('✖️');
    
    await conn.reply(m.chat,
      `❌ *Error del sistema*\n\n` +
      `No se pudo completar la descarga.\n\n` +
      `💡 *Intenta:*\n` +
      `• Usar otro nombre\n` +
      `• Esperar unos minutos\n` +
      `• Búsqueda más específica`, 
    m);
  }
};

handler.help = ['music <búsqueda>', 'song <búsqueda>'];
handler.tags = ['downloader', 'music'];
handler.command = ['music', 'song', 'musica', 'cancion', 'play'];
handler.register = true;

export default handler;
