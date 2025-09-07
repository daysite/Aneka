import fetch from 'node-fetch';

let handler = async (m, { conn, command, usedPrefix, args, text }) => {
  if (!text) {
    return conn.reply(m.chat, 
      `🎵 *SoundCloud Downloader* 🎵\n\n` +
      `❌ Debes ingresar el nombre de una canción o artista.\n\n` +
      `💡 *Ejemplos:*\n` +
      `> ${usedPrefix + command} Lisa Money\n` +
      `> ${usedPrefix + command} Blackpink\n` +
      `> ${usedPrefix + command} Bad Bunny`, 
    m);
  }
  
  await m.react('🕒');
  
  try {
    // API CONFIABLE - SoundCloud a MP3
    const searchUrl = `https://api.soundcloud-downloader.com/search?q=${encodeURIComponent(text)}&limit=1`;
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });
    
    if (!searchResponse.ok) {
      await m.react('✖️');
      return conn.reply(m.chat, 
        `❌ Error en la búsqueda (Código: ${searchResponse.status})\n\n` +
        `Intenta con otro nombre de canción.`, 
      m);
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData || searchData.length === 0) {
      await m.react('✖️');
      return conn.reply(m.chat, 
        `❌ No se encontraron resultados para: "${text}"\n\n` +
        `Intenta con una búsqueda diferente.`, 
      m);
    }
    
    const track = searchData[0];
    const downloadUrl = `https://api.soundcloud-downloader.com/download?url=${encodeURIComponent(track.permalink_url)}`;
    
    // Mensaje de progreso
    await conn.reply(m.chat, 
      `🎵 *Encontrado:* ${track.title}\n` +
      `🎤 *Artista:* ${track.user.username}\n` +
      `⏱️ *Duración:* ${Math.floor(track.duration / 60000)}:${Math.floor((track.duration % 60000) / 1000).toString().padStart(2, '0')}\n\n` +
      `⬇️ *Descargando audio...*`, 
    m);
    
    // Descargar audio
    const audioResponse = await fetch(downloadUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });
    
    if (!audioResponse.ok) {
      await m.react('✖️');
      return conn.reply(m.chat, 
        `❌ Error en la descarga (Código: ${audioResponse.status})\n\n` +
        `La canción no se pudo descargar.`, 
      m);
    }
    
    const audioBuffer = await audioResponse.buffer();
    
    // Enviar audio
    await conn.sendMessage(m.chat, {
      audio: audioBuffer,
      fileName: `${track.title.replace(/[^\w\s]/gi, '')}.mp3`,
      mimetype: 'audio/mpeg',
      contextInfo: {
        externalAdReply: {
          title: track.title,
          body: `By: ${track.user.username}`,
          thumbnailUrl: track.artwork_url,
          sourceUrl: track.permalink_url
        }
      }
    }, { quoted: m });
    
    // Mensaje de éxito
    await conn.reply(m.chat,
      `✅ *Descarga completada*\n\n` +
      `📀 ${track.title}\n` +
      `🎤 ${track.user.username}\n` +
      `🎵 SoundCloud Download`, 
    m);
    
    await m.react('✅');
    
  } catch (error) {
    console.error('Error:', error);
    await m.react('✖️');
    
    await conn.reply(m.chat,
      `❌ *Error del sistema*\n\n` +
      `No se pudo completar la descarga.\n\n` +
      `💡 *Posibles causas:*\n` +
      `• El servidor de SoundCloud está lento\n` +
      `• La canción no está disponible\n` +
      `• Intenta con otra búsqueda`, 
    m);
  }
};

handler.help = ['soundcloud <búsqueda>'];
handler.tags = ['downloader', 'music'];
handler.command = ['soundcloud', 'sound', 'scdl'];
handler.register = true;

export default handler;
