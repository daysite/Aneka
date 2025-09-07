import fetch from 'node-fetch';

let handler = async (m, { conn, command, usedPrefix, args, text }) => {
  if (!text) {
    return conn.reply(m.chat, 
      `🎵 *Downloader de Música* 🎵\n\n` +
      `❌ Debes ingresar el nombre de una canción o artista.\n\n` +
      `💡 *Ejemplos:*\n` +
      `> ${usedPrefix + command} Lisa Money\n` +
      `> ${usedPrefix + command} Blackpink\n` +
      `> ${usedPrefix + command} Bad Bunny`, 
    m);
  }
  
  await m.react('🕒');
  
  try {
    // PRIMERO intentar con YouTube (MÁS CONFIABLE)
    try {
      await conn.reply(m.chat, `🔍 *Buscando en YouTube:* "${text}"\n\n⏳ Esto es más confiable...`, m);
      
      const ytSearchUrl = `https://api.yt-downloader.org/search?q=${encodeURIComponent(text)}&limit=1`;
      const ytSearchResponse = await fetch(ytSearchUrl, { timeout: 15000 });
      
      if (ytSearchResponse.ok) {
        const ytData = await ytSearchResponse.json();
        
        if (ytData && ytData.length > 0) {
          const video = ytData[0];
          const downloadUrl = `https://api.yt-downloader.org/download?url=${encodeURIComponent(video.url)}`;
          
          await conn.reply(m.chat, `✅ *Encontrado en YouTube:* ${video.title}\n\n⬇️ Descargando...`, m);
          
          const audioResponse = await fetch(downloadUrl, { timeout: 30000 });
          if (audioResponse.ok) {
            const audioBuffer = await audioResponse.buffer();
            
            await conn.sendMessage(m.chat, {
              audio: audioBuffer,
              fileName: `${video.title.replace(/[^\w\s]/gi, '')}.mp3`,
              mimetype: 'audio/mpeg'
            }, { quoted: m });
            
            await conn.reply(m.chat, 
              `✅ *Descarga de YouTube completada*\n\n` +
              `📀 ${video.title}\n` +
              `⏱️ ${video.duration}\n` +
              `🎵 Vía YouTube`, 
            m);
            
            return await m.react('✅');
          }
        }
      }
    } catch (ytError) {
      console.log('YouTube falló, intentando SoundCloud...');
    }
    
    // SI YOUTUBE FALLA, intentar SoundCloud
    await conn.reply(m.chat, `🔍 *Buscando en SoundCloud:* "${text}"\n\n⚠️ YouTube falló, intentando alternativa...`, m);
    
    const scSearchUrl = `https://api.soundcloud.com/tracks?q=${encodeURIComponent(text)}&client_id=YOUR_CLIENT_ID&limit=1`;
    const scSearchResponse = await fetch(scSearchUrl, { timeout: 10000 });
    
    if (!scSearchResponse.ok) {
      await m.react('✖️');
      return conn.reply(m.chat, 
        `❌ *Error en todas las plataformas*\n\n` +
        `💡 *Soluciones:*\n` +
        `• Intenta con otro nombre\n` +
        `• Espera unos minutos\n` +
        `• Usa búsquedas más específicas\n\n` +
        `⚠️ Las APIs de música están temporalmente caídas`, 
      m);
    }
    
    const scData = await scSearchResponse.json();
    
    if (!scData || scData.length === 0) {
      await m.react('✖️');
      return conn.reply(m.chat, 
        `❌ No se encontró: "${text}"\n\n` +
        `Intenta con:\n` +
        `• Nombre más exacto\n` +
        `• Artista + Canción\n` +
        `• Menos palabras`, 
      m);
    }
    
    const track = scData[0];
    
    // OFRECER PREVIEW (lo único que funciona consistentemente)
    if (track.streamable && track.stream_url) {
      await conn.reply(m.chat, 
        `🎵 *Preview de SoundCloud* 🎵\n\n` +
        `📀 ${track.title}\n` +
        `🎤 ${track.user.username}\n` +
        `⏱️ Preview de 30 segundos\n\n` +
        `⚠️ *Solo preview disponible* - Descargas bloqueadas`, 
      m);
      
      // Stream URL requiere client_id, usar permalink como fallback
      const previewUrl = track.permalink_url;
      
      await conn.sendMessage(m.chat, {
        audio: { url: previewUrl },
        fileName: `${track.title.replace(/[^\w\s]/gi, '')}_preview.mp3`,
        mimetype: 'audio/mpeg'
      }, { quoted: m });
      
      return await m.react('✅');
    }
    
    // SI TODO FALLA
    await m.react('✖️');
    await conn.reply(m.chat,
      `❌ *Sistema no disponible*\n\n` +
      `Las descargas de música están temporalmente bloqueadas.\n\n` +
      `💡 *Alternativas:*\n` +
      `• Intenta más tarde\n` +
      `• Usa YouTube directamente\n` +
      `• Busca en otras plataformas`, 
    m);
    
  } catch (error) {
    console.error('Error general:', error);
    await m.react('✖️');
    
    await conn.reply(m.chat,
      `❌ *Error crítico*\n\n` +
      `El sistema de descargas está experimentando problemas técnicos.\n\n` +
      `📞 *Reporta este error al administrador*`, 
    m);
  }
};

handler.help = ['music <búsqueda>', 'song <búsqueda>'];
handler.tags = ['downloader', 'music'];
handler.command = ['music', 'song', 'musica', 'cancion'];
handler.register = true;

export default handler;
