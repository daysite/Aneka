import yts from 'yt-search';
import ytdl from 'ytdl-core';
import { youtubedl } from '@bochilteam/scraper';

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
    // BUSCAR EN YOUTUBE
    await conn.reply(m.chat, `🔍 *Buscando:* "${text}"\n\n⏳ Esto puede tomar unos segundos...`, m);
    
    const searchResults = await yts(text);
    
    if (!searchResults.videos || searchResults.videos.length === 0) {
      await m.react('✖️');
      return conn.reply(m.chat, 
        `❌ No se encontró: "${text}"\n\n` +
        `Intenta con:\n` +
        `• Un nombre más exacto\n` +
        `• Artista + Canción\n` +
        `• Menos palabras`, 
      m);
    }
    
    const video = searchResults.videos[0];
    
    // VERIFICAR DURACIÓN (máximo 15 minutos)
    const durationMinutes = parseInt(video.timestamp.split(':')[0]);
    if (durationMinutes > 15) {
      await m.react('✖️');
      return conn.reply(m.chat, 
        `❌ Video demasiado largo\n\n` +
        `Duración: ${video.timestamp}\n` +
        `Límite: 15 minutos\n\n` +
        `Busca una versión más corta.`, 
      m);
    }
    
    // DESCARGAR AUDIO
    await conn.reply(m.chat, 
      `✅ *Encontrado:* ${video.title}\n` +
      `⏱️ *Duración:* ${video.timestamp}\n` +
      `👁️ *Vistas:* ${video.views}\n\n` +
      `⬇️ *Descargando audio...*`, 
    m);
    
    try {
      // INTENTO 1: Usando ytdl-core
      const audioStream = ytdl(video.url, {
        filter: 'audioonly',
        quality: 'highestaudio',
      });
      
      const chunks = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }
      const audioBuffer = Buffer.concat(chunks);
      
      // ENVIAR AUDIO
      await conn.sendMessage(m.chat, {
        audio: audioBuffer,
        fileName: `${video.title.replace(/[^\w\s]/gi, '')}.mp3`,
        mimetype: 'audio/mpeg',
        contextInfo: {
          externalAdReply: {
            title: video.title.slice(0, 60),
            body: `Duración: ${video.timestamp} | ${video.views} vistas`,
            thumbnailUrl: video.image,
            mediaType: 2,
            sourceUrl: video.url
          }
        }
      }, { quoted: m });
      
    } catch (ytdlError) {
      console.log('ytdl-core falló, intentando con scraper...');
      
      // INTENTO 2: Usando scraper alternativo
      const audioInfo = await youtubedl(video.url);
      const audioData = await audioInfo.audio['128kbps'].download();
      
      await conn.sendMessage(m.chat, {
        audio: audioData,
        fileName: `${video.title.replace(/[^\w\s]/gi, '')}.mp3`,
        mimetype: 'audio/mpeg'
      }, { quoted: m });
    }
    
    // MENSAJE DE ÉXITO
    await conn.reply(m.chat,
      `✅ *Descarga completada*\n\n` +
      `📀 ${video.title}\n` +
      `🎤 ${video.author.name}\n` +
      `⏱️ ${video.timestamp}\n` +
      `👁️ ${video.views}\n\n` +
      `🌐 *Fuente:* YouTube`, 
    m);
    
    await m.react('✅');
    
  } catch (error) {
    console.error('Error general:', error);
    await m.react('✖️');
    
    await conn.reply(m.chat,
      `❌ *Error en la descarga*\n\n` +
      `No se pudo descargar el audio.\n\n` +
      `💡 *Soluciones:*\n` +
      `• El video puede estar restringido\n` +
      `• Intenta con otra canción\n` +
      `• Espera unos minutos\n` +
      `• Busca "nombre artista canción"`, 
    m);
  }
};

// INSTALAR DEPENDENCIAS NECESARIAS:
/*
npm install yt-search
npm install ytdl-core
npm install @bochilteam/scraper
*/

handler.help = ['play <búsqueda>', 'music <búsqueda>', 'song <búsqueda>'];
handler.tags = ['downloader', 'music'];
handler.command = ['play', 'music', 'song', 'musica', 'cancion', 'p'];
handler.register = true;

export default handler;
