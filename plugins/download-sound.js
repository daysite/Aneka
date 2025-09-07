import yts from 'yt-search';
import ytdl from 'ytdl-core';
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper';
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
    // BUSCAR EN YOUTUBE
    await conn.reply(m.chat, `🔍 *Buscando:* "${text}"\n\n⏳ Buscando la mejor versión...`, m);
    
    const searchResults = await yts(text);
    
    if (!searchResults.videos || searchResults.videos.length === 0) {
      await m.react('✖️');
      return conn.reply(m.chat, 
        `❌ No se encontró: "${text}"\n\n` +
        `Intenta con un nombre más específico.`, 
      m);
    }

    // BUSCAR LA MEJOR VERSIÓN (más corta y con "audio" en el título)
    let video = searchResults.videos[0];
    for (let v of searchResults.videos) {
      if (v.title.toLowerCase().includes('audio') || v.title.toLowerCase().includes('official')) {
        video = v;
        break;
      }
      if (v.timestamp && parseInt(v.timestamp.split(':')[0]) < 5) {
        video = v; // Preferir videos cortos
      }
    }

    // VERIFICAR DURACIÓN (máximo 10 minutos)
    const durationMinutes = video.timestamp.includes(':') ? 
      parseInt(video.timestamp.split(':')[0]) : 0;
    if (durationMinutes > 10) {
      await m.react('✖️');
      return conn.reply(m.chat, 
        `❌ Video demasiado largo\n\n` +
        `Duración: ${video.timestamp}\n` +
        `Límite: 10 minutos\n\n` +
        `Busca una versión más corta o el audio oficial.`, 
      m);
    }

    await conn.reply(m.chat, 
      `✅ *Encontrado:* ${video.title}\n` +
      `⏱️ *Duración:* ${video.timestamp}\n` +
      `👁️ *Vistas:* ${video.views}\n\n` +
      `⬇️ *Preparando audio...*`, 
    m);

    // MÉTODO 1: Usar API externa como respaldo
    try {
      const apiUrl = `https://yt-downloader.cyclic.app/audio?url=${encodeURIComponent(video.url)}`;
      const apiResponse = await fetch(apiUrl, { timeout: 30000 });
      
      if (apiResponse.ok) {
        const audioData = await apiResponse.json();
        
        if (audioData.downloadUrl) {
          const audioResponse = await fetch(audioData.downloadUrl, { timeout: 45000 });
          const audioBuffer = await audioResponse.buffer();
          
          await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            fileName: `${video.title.replace(/[^\w\s]/gi, '')}.mp3`,
            mimetype: 'audio/mpeg',
            contextInfo: {
              externalAdReply: {
                title: video.title.slice(0, 60),
                body: `⏱️ ${video.timestamp} | 👁️ ${video.views}`,
                thumbnailUrl: video.image,
                mediaType: 2,
                sourceUrl: video.url
              }
            }
          }, { quoted: m });

          await conn.reply(m.chat,
            `✅ *Descarga completada*\n\n` +
            `📀 ${video.title}\n` +
            `🎤 ${video.author.name}\n` +
            `⏱️ ${video.timestamp}\n\n` +
            `🌐 *Fuente:* YouTube API`, 
          m);
          
          return await m.react('✅');
        }
      }
    } catch (apiError) {
      console.log('API falló, intentando método directo...');
    }

    // MÉTODO 2: ytdl-core con headers personalizados
    try {
      const audioStream = ytdl(video.url, {
        filter: 'audioonly',
        quality: 'highestaudio',
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.youtube.com/'
          }
        }
      });

      const chunks = [];
      audioStream.on('data', chunk => chunks.push(chunk));
      
      await new Promise((resolve, reject) => {
        audioStream.on('end', resolve);
        audioStream.on('error', reject);
      });

      const audioBuffer = Buffer.concat(chunks);
      
      await conn.sendMessage(m.chat, {
        audio: audioBuffer,
        fileName: `${video.title.replace(/[^\w\s]/gi, '')}.mp3`,
        mimetype: 'audio/mpeg'
      }, { quoted: m });

      await conn.reply(m.chat,
        `✅ *Descarga completada*\n\n` +
        `📀 ${video.title}\n` +
        `🎤 ${video.author.name}\n` +
        `⏱️ ${video.timestamp}\n\n` +
        `🌐 *Fuente:* ytdl-core`, 
      m);
      
      return await m.react('✅');
      
    } catch (ytdlError) {
      console.log('ytdl-core falló:', ytdlError.message);
    }

    // MÉTODO 3: Scraper alternativo
    try {
      const audioInfo = await youtubedlv2(video.url);
      const audioData = await audioInfo.audio['128kbps'].download();
      
      await conn.sendMessage(m.chat, {
        audio: audioData,
        fileName: `${video.title.replace(/[^\w\s]/gi, '')}.mp3`,
        mimetype: 'audio/mpeg'
      }, { quoted: m });

      await conn.reply(m.chat,
        `✅ *Descarga completada*\n\n` +
        `📀 ${video.title}\n` +
        `🎤 ${video.author.name}\n` +
        `⏱️ ${video.timestamp}\n\n` +
        `🌐 *Fuente:* Web Scraper`, 
      m);
      
      return await m.react('✅');
      
    } catch (scraperError) {
      console.log('Scraper falló:', scraperError.message);
      throw new Error('Todos los métodos fallaron');
    }

  } catch (error) {
    console.error('Error general:', error);
    await m.react('✖️');
    
    await conn.reply(m.chat,
      `❌ *Error crítico de descarga*\n\n` +
      `No se pudo descargar: "${text}"\n\n` +
      `🔧 *Posibles causas:*\n` +
      `• El video está restringido\n` +
      `• Derechos de autor\n` +
      `• Bloqueo regional\n\n` +
      `💡 *Intenta:*\n` +
      `• Buscar "artista canción audio"\n` +
      `• Usar otro nombre\n` +
      `• Probar con otra canción`, 
    m);
  }
};

handler.help = ['play <búsqueda>', 'music <búsqueda>'];
handler.tags = ['downloader', 'music'];
handler.command = ['play', 'music', 'song', 'p'];
handler.register = true;

export default handler;
