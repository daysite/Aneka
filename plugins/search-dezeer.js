import fetch from 'node-fetch';
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import ytdl from 'ytdl-core';
import yts from 'yt-search';

const DEEZER_API_URL = 'https://api.deezer.com/search';

const handler = async (m, { conn, usedPrefix, command, args, text }) => {
  // Subcomando para reproducir preview
  if (command === 'deezerplay') {
    if (!args[0]) return m.reply('❌ URL de preview no proporcionada');
    
    try {
      const previewUrl = args[0];
      await m.reply('🔊 *Reproduciendo preview...*');
      
      const response = await fetch(previewUrl);
      const buffer = await response.arrayBuffer();
      
      // Guardar el audio temporalmente
      const tempDir = './tmp';
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
      
      const tempFile = path.join(tempDir, `preview_${Date.now()}.mp3`);
      fs.writeFileSync(tempFile, Buffer.from(buffer));
      
      // Enviar como mensaje de audio
      await conn.sendMessage(m.chat, {
        audio: fs.readFileSync(tempFile),
        mimetype: 'audio/mp4',
        ptt: false
      }, { quoted: m });
      
      // Eliminar archivo temporal después de enviar
      setTimeout(() => {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }, 5000);
      
    } catch (error) {
      console.error('Error en deezerplay:', error);
      m.reply('❌ Error al reproducir el preview');
    }
    return;
  }
  
  // Subcomando para descargar canción
  if (command === 'deezermp3') {
    if (!args[0]) return m.reply('❌ ID de canción no proporcionado');
    
    try {
      const trackId = args[0];
      
      // Obtener información de la canción
      const trackResponse = await fetch(`https://api.deezer.com/track/${trackId}`);
      const trackData = await trackResponse.json();
      
      if (trackData.error) {
        return m.reply('❌ No se encontró la canción');
      }
      
      await m.reply(`⬇️ *Descargando:* ${trackData.title}\n🎤 *Artista:* ${trackData.artist.name}\n\n⏳ *Buscando la mejor fuente...*`);
      
      // Estrategias de búsqueda alternativas
      const searchQueries = [
        `${trackData.title} ${trackData.artist.name} audio oficial`,
        `${trackData.title} ${trackData.artist.name}`,
        `${trackData.title} by ${trackData.artist.name}`,
        `${trackData.artist.name} ${trackData.title} lyrics`,
        `${trackData.title}`
      ];
      
      let video = null;
      
      // Probar diferentes estrategias de búsqueda
      for (const query of searchQueries) {
        try {
          const searchResults = await yts(query);
          if (searchResults.videos && searchResults.videos.length > 0) {
            // Buscar el video más relevante (menor duración, título similar)
            const relevantVideos = searchResults.videos.filter(v => 
              v.seconds <= (trackData.duration + 60) && // +60 segundos de tolerancia
              v.seconds >= (trackData.duration - 60)    // -60 segundos de tolerancia
            );
            
            video = relevantVideos.length > 0 ? relevantVideos[0] : searchResults.videos[0];
            break;
          }
        } catch (e) {
          console.log(`Búsqueda fallida con query: ${query}`, e);
          continue;
        }
      }
      
      if (!video) {
        return m.reply('❌ No se pudo encontrar la canción en YouTube. Intenta con otra canción.');
      }
      
      const videoUrl = video.url;
      
      // Descargar el audio usando ytdl con múltiples estrategias
      const tempDir = './tmp';
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
      
      const outputFile = path.join(tempDir, `deezer_${trackId}_${Date.now()}.mp3`);
      
      await m.reply('🎵 *Descargando audio...* (Esto puede tomar un momento)');
      
      try {
        // Intentar con diferentes formatos y calidades
        const audioStream = ytdl(videoUrl, {
          filter: 'audioonly',
          quality: 'highestaudio',
          requestOptions: {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          }
        });
        
        const writeStream = fs.createWriteStream(outputFile);
        audioStream.pipe(writeStream);
        
        // Manejar progreso
        let startTime = Date.now();
        audioStream.on('progress', (chunkLength, downloaded, total) => {
          const percent = downloaded / total;
          const downloadedMinutes = (Date.now() - startTime) / 1000 / 60;
          const estimatedDownloadTime = (downloadedMinutes / percent) - downloadedMinutes;
          
          if (percent % 0.1 === 0) {
            conn.sendMessage(m.chat, {
              text: `📥 *Descargando:* ${(percent * 100).toFixed(1)}%\n⏱ *Tiempo estimado:* ${estimatedDownloadTime.toFixed(2)} minutos`
            }, { quoted: m });
          }
        });
        
        await new Promise((resolve, reject) => {
          writeStream.on('finish', resolve);
          writeStream.on('error', reject);
          audioStream.on('error', reject);
        });
        
        // Verificar que el archivo se descargó correctamente
        if (!fs.existsSync(outputFile) || fs.statSync(outputFile).size === 0) {
          throw new Error('Archivo descargado vacío o corrupto');
        }
        
        await m.reply('✅ *Audio descargado!* \n📤 *Enviando...*');
        
        // Enviar el audio
        await conn.sendMessage(
          m.chat,
          {
            audio: fs.readFileSync(outputFile),
            mimetype: 'audio/mp3',
            fileName: `${trackData.artist.name} - ${trackData.title}.mp3`.replace(/[^\w\s.-]/gi, ''),
            contextInfo: {
              externalAdReply: {
                title: trackData.title.length > 25 ? trackData.title.substring(0, 25) + '...' : trackData.title,
                body: trackData.artist.name.length > 25 ? trackData.artist.name.substring(0, 25) + '...' : trackData.artist.name,
                thumbnailUrl: trackData.album.cover_medium,
                sourceUrl: trackData.link,
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
          },
          { quoted: m }
        );
        
        await m.reply('🎉 *¡Descarga completada!* \n💾 *Audio enviado correctamente*');
        
      } catch (downloadError) {
        console.error('Error en descarga:', downloadError);
        
        // Estrategia alternativa: enviar enlace de YouTube
        await conn.sendMessage(
          m.chat,
          {
            text: `❌ *Error en la descarga directa*\n\n` +
                 `🎵 *Canción:* ${trackData.title}\n` +
                 `🎤 *Artista:* ${trackData.artist.name}\n` +
                 `📺 *Video alternativo:* ${video.url}\n\n` +
                 `⚠️ *Puedes intentar descargarlo manualmente desde el enlace de YouTube*`
          },
          { quoted: m }
        );
      }
      
      // Limpiar archivo temporal
      setTimeout(() => {
        if (fs.existsSync(outputFile)) {
          fs.unlinkSync(outputFile);
        }
      }, 10000);
      
    } catch (error) {
      console.error('Error en deezermp3:', error);
      
      // Mensaje de error específico
      if (error.message.includes('copyright') || error.message.includes('Copyright')) {
        m.reply('❌ *Error de copyright:* Esta canción no está disponible para descarga debido a restricciones de derechos de autor.');
      } else if (error.message.includes('not found') || error.message.includes('No se encontró')) {
        m.reply('❌ *No se encontró la canción.* Intenta con otro nombre o artista.');
      } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        m.reply('❌ *Tiempo de espera agotado.* La descarga tardó demasiado. Intenta nuevamente.');
      } else {
        m.reply('❌ *Error al descargar la canción.* Intenta con otra canción o prueba más tarde.\n\n💡 *Posibles soluciones:*\n• Verifica tu conexión a internet\n• Intenta con una canción diferente\n• Espera unos minutos e intenta nuevamente');
      }
    }
    return;
  }
  
  // Comando principal de búsqueda
  if (!text) {
    return conn.reply(m.chat, 
      `🎵 *Deezer Music Search* 🎵\n\n` +
      `❌ Debes ingresar el nombre de una canción o artista.\n\n` +
      `💡 *Ejemplos:*\n` +
      `> ${usedPrefix + command} Bohemian Rhapsody\n` +
      `> ${usedPrefix + command} Queen\n` +
      `> ${usedPrefix + command} Bad Bunny`, 
    m);
  }
  
  try {
    await m.react('🕒');
    
    // Realizar búsqueda en Deezer
    const searchUrl = `${DEEZER_API_URL}?q=${encodeURIComponent(text)}&limit=10`;
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) throw new Error('Error en la API de Deezer');
    
    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      await m.react('✖️');
      throw '⚠️ *No se encontraron resultados para tu búsqueda.*';
    }

    const tracks = data.data;
    
    // Seleccionar una canción aleatoria para mostrar en el encabezado
    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
    
    // Preparar la imagen para el mensaje interactivo
    let media;
    try {
      media = await prepareWAMessageMedia(
        { image: { url: randomTrack.album.cover_xl || randomTrack.album.cover_medium } },
        { upload: conn.waUploadToServer }
      );
    } catch (error) {
      console.error('Error al cargar la imagen:', error);
      // Si falla, crear un mensaje sin imagen
      media = { imageMessage: null };
    }

    // Crear el mensaje interactivo con lista de opciones
    const interactiveMessage = {
      body: {
        text: `> *Resultados:* \`${tracks.length}\` canciones encontradas\n\n*${randomTrack.title}*\n\n≡ 🎤 *Artista:* ${randomTrack.artist.name}\n≡ 💿 *Álbum:* ${randomTrack.album.title}\n≡ ⏱ *Duración:* ${formatDuration(randomTrack.duration)}`
      },
      footer: { text: '🎵 Deezer Music Search • Descargas disponibles' },
      header: {
        title: '```乂 DEEZER - SEARCH```',
        hasMediaAttachment: !!media.imageMessage,
        ...(media.imageMessage && { imageMessage: media.imageMessage })
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: 'Opciones de música',
              sections: tracks.slice(0, 10).map((track, index) => ({
                title: `${track.title_short || track.title}`,
                rows: [
                  {
                    header: track.title_short || track.title,
                    title: track.artist.name,
                    description: `🔊 Escuchar preview | Duración: ${formatDuration(track.duration)}`,
                    id: `${usedPrefix}deezerplay ${track.preview}`
                  },
                  {
                    header: track.title_short || track.title,
                    title: track.artist.name,
                    description: `📥 Descargar canción | ${track.album.title}`,
                    id: `${usedPrefix}deezermp3 ${track.id}`
                  }
                ]
              }))
            })
          }
        ],
        messageParamsJson: ''
      }
    };

    const userJid = conn?.user?.jid || m.key.participant || m.chat;
    const msg = generateWAMessageFromContent(m.chat, { interactiveMessage }, { userJid, quoted: m });
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    
    await m.react('✅');
    
  } catch (error) {
    console.error('Error en deezer:', error);
    await m.react('✖️');
    
    await conn.reply(m.chat,
      `❌ *Error en la búsqueda*\n\n` +
      `No se pudo completar la búsqueda en Deezer.\n\n` +
      `💡 *Intenta:*\n` +
      `• Verificar tu conexión a internet\n` +
      `• Probar en unos minutos\n` +
      `• Usar términos de búsqueda diferentes`, 
    m);
  }
};

// Función para formatear la duración de segundos a MM:SS
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

handler.help = ['deezer <búsqueda>', 'deezerplay <url>', 'deezermp3 <id>'];
handler.tags = ['music', 'search', 'download'];
handler.command = /^(deezer|dz|deezerplay|deezermp3)$/i;
handler.register = true;
handler.limit = true; // Limitar uso para evitar abusos

export default handler;
