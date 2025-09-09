import fetch from 'node-fetch';
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const DEEZER_API_URL = 'https://api.deezer.com/search';

const handler = async (m, { conn, usedPrefix, command, args, text }) => {
  // Subcomando para reproducir preview
  if (command === 'deezerplay') {
    if (!args[0]) return m.reply('❌ URL de preview no proporcionada');
    
    try {
      const previewUrl = args[0];
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
  
  // Subcomando para descargar (simulado)
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
      
      await m.reply(`⚠️ *Función en desarrollo*\n\n` +
                   `🎵 *Canción:* ${trackData.title}\n` +
                   `🎤 *Artista:* ${trackData.artist.name}\n` +
                   `💿 *Álbum:* ${trackData.album.title}\n\n` +
                   `ℹ️ La descarga directa desde Deezer no está disponible actualmente.`);
      
    } catch (error) {
      console.error('Error en deezermp3:', error);
      m.reply('❌ Error al procesar la solicitud de descarga');
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
    const response = await fetch(searchUrl);
    
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
      footer: { text: '🎵 Deezer Music Search' },
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
handler.tags = ['music', 'search'];
handler.command = /^(deezer|dz|deezerplay|deezermp3)$/i;
handler.register = true;

export default handler;
