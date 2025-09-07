import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB límite
const DOWNLOAD_FOLDER = './tmp/music/';

// Crear directorio si no existe
if (!fs.existsSync(DOWNLOAD_FOLDER)) {
    fs.mkdirSync(DOWNLOAD_FOLDER, { recursive: true });
}

// Función para buscar canciones en Apple Music (API alternativa)
async function searchAppleMusic(query) {
    try {
        // API alternativa de búsqueda - más confiable
        const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=5`;
        
        const response = await fetch(searchUrl);
        if (!response.ok) throw new Error('Error en búsqueda');
        
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            throw new Error('No se encontraron resultados');
        }

        // Mapear resultados a formato consistente
        return data.results.map(track => ({
            title: track.trackName,
            artist: track.artistName,
            album: track.collectionName,
            duration: Math.floor(track.trackTimeMillis / 1000), // segundos
            thumbnail: track.artworkUrl100.replace('100x100', '500x500'),
            url: track.trackViewUrl,
            preview: track.previewUrl,
            releaseDate: track.releaseDate ? new Date(track.releaseDate).getFullYear() : null
        }));
        
    } catch (error) {
        console.error('Error en búsqueda:', error);
        throw new Error('No se pudo completar la búsqueda');
    }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        // Verificar si se proporcionó término de búsqueda
        if (!args[0]) {
            return m.reply(`🎵 *Apple Music Downloader* 🎵\n\n❌ Debes proporcionar el nombre de una canción o artista.\n\n💡 *Ejemplos:*\n${usedPrefix}applemusic Billie Eilish\n${usedPrefix}applemusic Bad Guy\n${usedPrefix}applemusic Taylor Swift Shake It Off`);
        }

        let searchQuery = args.join(' ');
        
        // Mostrar mensaje de búsqueda
        const searchMsg = await m.reply(`🔍 *Buscando:* "${searchQuery}"\n\n⏳ Buscando en Apple Music...`);

        // Buscar la canción usando la API alternativa
        let searchResults;
        try {
            searchResults = await searchAppleMusic(searchQuery);
        } catch (searchError) {
            await conn.sendMessage(m.chat, { delete: searchMsg.key });
            return m.reply(`❌ Error en búsqueda: ${searchError.message}`);
        }

        // Tomar el primer resultado (más relevante)
        const firstResult = searchResults[0];
        
        if (!firstResult.url) {
            await conn.sendMessage(m.chat, { delete: searchMsg.key });
            return m.reply('❌ No se pudo obtener el enlace de la canción.');
        }

        // Actualizar mensaje a "descargando"
        await conn.sendMessage(m.chat, { 
            delete: searchMsg.key 
        });
        
        const downloadingMsg = await m.reply(`⬇️ *Descargando:* ${firstResult.title}\n🎤 *Artista:* ${firstResult.artist}\n\n⏳ Procesando audio...`);

        // Usar la API de descarga original con la URL de Apple Music
        const downloadApiUrl = `https://api.delirius.store/download/applemusicdl?url=${encodeURIComponent(firstResult.url)}`;
        
        let downloadResponse;
        try {
            downloadResponse = await fetch(downloadApiUrl);
            
            if (!downloadResponse.ok) {
                throw new Error('Error en API de descarga');
            }
            
            const downloadData = await downloadResponse.json();

            // Verificar respuesta de descarga
            if (downloadData.error || !downloadData.result) {
                throw new Error(downloadData.message || 'Error en descarga');
            }

            const trackInfo = downloadData.result;
            
            if (!trackInfo.download || !trackInfo.download.url) {
                throw new Error('No hay URL de descarga');
            }

            // Descargar el archivo de audio
            const audioResponse = await fetch(trackInfo.download.url);
            
            if (!audioResponse.ok) {
                throw new Error('Error al descargar audio');
            }

            // Verificar tamaño del archivo
            const contentLength = audioResponse.headers.get('content-length');
            const fileSize = parseInt(contentLength || '0');

            if (fileSize > MAX_FILE_SIZE) {
                await conn.sendMessage(m.chat, { delete: downloadingMsg.key });
                return m.reply(`❌ El archivo es demasiado grande (${(fileSize / 1024 / 1024).toFixed(2)}MB). Límite: 50MB.`);
            }

            // Crear nombre de archivo seguro
            const safeTitle = firstResult.title.replace(/[^a-zA-Z0-9]/g, '_');
            const fileName = `${safeTitle}.mp3`;
            const filePath = path.join(DOWNLOAD_FOLDER, fileName);

            // Guardar archivo temporal
            const fileBuffer = await audioResponse.buffer();
            fs.writeFileSync(filePath, fileBuffer);

            // Crear mensaje de información
            let infoMessage = `🎵 *Apple Music Download* 🎵\n\n`;
            infoMessage += `🔍 *Búsqueda:* "${searchQuery}"\n\n`;
            infoMessage += `📀 *Título:* ${firstResult.title}\n`;
            infoMessage += `🎤 *Artista:* ${firstResult.artist}\n`;
            
            if (firstResult.album) {
                infoMessage += `💿 *Álbum:* ${firstResult.album}\n`;
            }
            
            if (firstResult.releaseDate) {
                infoMessage += `📅 *Año:* ${firstResult.releaseDate}\n`;
            }
            
            if (firstResult.duration) {
                const minutes = Math.floor(firstResult.duration / 60);
                const seconds = firstResult.duration % 60;
                infoMessage += `⏱️ *Duración:* ${minutes}:${seconds.toString().padStart(2, '0')}\n`;
            }
            
            infoMessage += `📊 *Calidad:* Alta\n\n`;
            infoMessage += `✅ *Descarga completada*`;

            // Enviar el audio
            await conn.sendMessage(m.chat, {
                audio: fs.readFileSync(filePath),
                mimetype: 'audio/mpeg',
                fileName: `${firstResult.title}.mp3`,
                contextInfo: {
                    externalAdReply: {
                        title: firstResult.title,
                        body: `Artista: ${firstResult.artist}`,
                        mediaType: 2,
                        thumbnail: firstResult.thumbnail ? await (await fetch(firstResult.thumbnail)).buffer() : undefined,
                        sourceUrl: firstResult.url
                    }
                }
            }, { quoted: m });

            // Enviar información
            await m.reply(infoMessage);

            // Limpiar mensaje
            await conn.sendMessage(m.chat, { delete: downloadingMsg.key });

            // Eliminar archivo temporal después de 30 segundos
            setTimeout(() => {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }, 30000);

        } catch (downloadError) {
            console.error('Error en descarga:', downloadError);
            
            // FALLBACK: Ofrecer audio de preview si la descarga falla
            if (firstResult.preview) {
                await conn.sendMessage(m.chat, { delete: downloadingMsg.key });
                const fallbackMsg = await m.reply('⚠️ *Usando audio de preview (30 segundos)*\n\nLa descarga completa falló, pero aquí tienes un preview:');
                
                try {
                    const previewResponse = await fetch(firstResult.preview);
                    const previewBuffer = await previewResponse.buffer();
                    
                    await conn.sendMessage(m.chat, {
                        audio: previewBuffer,
                        mimetype: 'audio/mp4',
                        fileName: `Preview_${firstResult.title}.m4a`
                    }, { quoted: m });
                    
                    await m.reply(`🎵 *Preview de:* ${firstResult.title}\n🎤 *Artista:* ${firstResult.artist}\n\n⏱️ 30 segundos de preview`);
                    
                } catch (previewError) {
                    await m.reply('❌ Error al obtener el preview de la canción.');
                }
            } else {
                await conn.sendMessage(m.chat, { delete: downloadingMsg.key });
                await m.reply('❌ Error al descargar la canción. Intenta con otro nombre.');
            }
        }

    } catch (error) {
        console.error('Error general:', error);
        return m.reply('❌ Error interno. Intenta nuevamente más tarde.');
    }
};

// Configuración del handler
handler.help = ['applemusic <nombre canción>', 'amusic <búsqueda>'];
handler.tags = ['downloader', 'music'];
handler.command = /^(applemusic|applemusicdl|amusic|music|buscar musica)$/i;
handler.limit = true;
handler.premium = false;
handler.register = true;

// Información adicional
handler.fail = null;
handler.exp = 3;
handler.money = 2;

export default handler;
