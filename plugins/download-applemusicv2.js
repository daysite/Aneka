import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const DOWNLOAD_FOLDER = './tmp/music/';

if (!fs.existsSync(DOWNLOAD_FOLDER)) {
    fs.mkdirSync(DOWNLOAD_FOLDER, { recursive: true });
}

// APIs ALTERNATIVAS para descarga
const DOWNLOAD_APIS = [
    {
        name: 'Delirius',
        url: (musicUrl) => `https://api.delirius.store/download/applemusicdl?url=${encodeURIComponent(musicUrl)}`
    },
    {
        name: 'APIzer',
        url: (musicUrl) => `https://api.zerody.one/download/applemusic?url=${encodeURIComponent(musicUrl)}`
    },
    {
        name: 'MusicDL',
        url: (musicUrl) => `https://api.musicdl.org/applemusic?url=${encodeURIComponent(musicUrl)}`
    }
];

// Función para buscar en Apple Music
async function searchAppleMusic(query) {
    try {
        const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=5&country=US`;
        const response = await fetch(searchUrl);
        
        if (!response.ok) throw new Error('Error en búsqueda');
        
        const data = await response.json();
        if (!data.results || data.results.length === 0) {
            throw new Error('No se encontraron resultados');
        }

        return data.results.map(track => ({
            title: track.trackName,
            artist: track.artistName,
            album: track.collectionName,
            duration: Math.floor(track.trackTimeMillis / 1000),
            thumbnail: track.artworkUrl100.replace('100x100', '500x500'),
            url: track.trackViewUrl,
            preview: track.previewUrl,
            releaseDate: track.releaseDate ? new Date(track.releaseDate).getFullYear() : null
        }));
        
    } catch (error) {
        throw new Error('No se pudo completar la búsqueda');
    }
}

// Función para intentar descargar con múltiples APIs
async tryDownloadWithApis(musicUrl) {
    for (const api of DOWNLOAD_APIS) {
        try {
            console.log(`Intentando con API: ${api.name}`);
            const apiUrl = api.url(musicUrl);
            const response = await fetch(apiUrl, { timeout: 10000 });
            
            if (!response.ok) continue;
            
            const data = await response.json();
            
            if (data.error || !data.result) continue;
            
            const trackInfo = data.result;
            if (!trackInfo.download || !trackInfo.download.url) continue;
            
            // Verificar que el enlace de descarga funcione
            const headResponse = await fetch(trackInfo.download.url, { method: 'HEAD' });
            if (headResponse.ok) {
                console.log(`✅ API exitosa: ${api.name}`);
                return trackInfo;
            }
            
        } catch (error) {
            console.log(`❌ API fallida: ${api.name}`, error.message);
            continue;
        }
    }
    throw new Error('Todas las APIs fallaron');
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        if (!args[0]) {
            return m.reply(`🎵 *Apple Music Downloader* 🎵\n\n❌ Debes proporcionar el nombre de una canción.\n\n💡 *Ejemplos:*\n${usedPrefix}applemusic Bad Guy\n${usedPrefix}music "Bohemian Rhapsody"`);
        }

        let searchQuery = args.join(' ');
        const searchMsg = await m.reply(`🔍 *Buscando:* "${searchQuery}"\n\n⏳ Buscando en Apple Music...`);

        // Buscar la canción
        let searchResults;
        try {
            searchResults = await searchAppleMusic(searchQuery);
        } catch (searchError) {
            await conn.sendMessage(m.chat, { delete: searchMsg.key });
            return m.reply(`❌ Error en búsqueda: ${searchError.message}`);
        }

        const firstResult = searchResults[0];
        await conn.sendMessage(m.chat, { delete: searchMsg.key });
        
        const downloadingMsg = await m.reply(`⬇️ *Descargando:* ${firstResult.title}\n🎤 *Artista:* ${firstResult.artist}\n\n⏳ Procesando audio...`);

        try {
            // Intentar con múltiples APIs de descarga
            const trackInfo = await tryDownloadWithApis(firstResult.url);
            
            // Descargar el archivo
            const audioResponse = await fetch(trackInfo.download.url);
            if (!audioResponse.ok) throw new Error('Error al descargar audio');

            const contentLength = audioResponse.headers.get('content-length');
            const fileSize = parseInt(contentLength || '0');

            if (fileSize > MAX_FILE_SIZE) {
                await conn.sendMessage(m.chat, { delete: downloadingMsg.key });
                return m.reply(`❌ Archivo muy grande (${(fileSize / 1024 / 1024).toFixed(2)}MB). Límite: 50MB.`);
            }

            // Guardar archivo temporal
            const safeTitle = firstResult.title.replace(/[^a-zA-Z0-9]/g, '_');
            const fileName = `${safeTitle}.mp3`;
            const filePath = path.join(DOWNLOAD_FOLDER, fileName);
            const fileBuffer = await audioResponse.buffer();
            fs.writeFileSync(filePath, fileBuffer);

            // Mensaje de éxito
            let infoMessage = `🎵 *Descarga Exitosa* 🎵\n\n`;
            infoMessage += `📀 *Título:* ${firstResult.title}\n`;
            infoMessage += `🎤 *Artista:* ${firstResult.artist}\n`;
            if (firstResult.album) infoMessage += `💿 *Álbum:* ${firstResult.album}\n`;
            if (firstResult.duration) {
                const minutes = Math.floor(firstResult.duration / 60);
                const seconds = firstResult.duration % 60;
                infoMessage += `⏱️ *Duración:* ${minutes}:${seconds.toString().padStart(2, '0')}\n`;
            }
            infoMessage += `✅ *Calidad completa*`;

            // Enviar audio
            await conn.sendMessage(m.chat, {
                audio: fs.readFileSync(filePath),
                mimetype: 'audio/mpeg',
                fileName: `${firstResult.title}.mp3`
            }, { quoted: m });

            await m.reply(infoMessage);
            await conn.sendMessage(m.chat, { delete: downloadingMsg.key });

            // Limpieza
            setTimeout(() => {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }, 30000);

        } catch (downloadError) {
            console.error('Error en descarga:', downloadError);
            await conn.sendMessage(m.chat, { delete: downloadingMsg.key });
            
            // FALLBACK: Ofrecer preview
            if (firstResult.preview) {
                const fallbackMsg = await m.reply('⚠️ *Audio Preview (30s)*\n\nLa descarga completa falló. Aquí tienes un preview:');
                
                try {
                    const previewResponse = await fetch(firstResult.preview);
                    const previewBuffer = await previewResponse.buffer();
                    
                    await conn.sendMessage(m.chat, {
                        audio: previewBuffer,
                        mimetype: 'audio/mp4',
                        fileName: `Preview_${firstResult.title}.m4a`
                    }, { quoted: m });
                    
                    await m.reply(`🎵 *Preview de:* ${firstResult.title}\n🎤 *Artista:* ${firstResult.artist}\n⏱️ 30 segundos`);
                    
                } catch (previewError) {
                    await m.reply('❌ Error al obtener el preview.');
                }
            } else {
                await m.reply('❌ Error al descargar. Intenta con otro nombre.');
            }
        }

    } catch (error) {
        console.error('Error general:', error);
        return m.reply('❌ Error interno. Intenta más tarde.');
    }
};

handler.help = ['applemusic <nombre canción>'];
handler.tags = ['downloader', 'music'];
handler.command = /^(applemusic|amusic|music)$/i;
handler.limit = true;
handler.premium = false;
handler.register = true;

export default handler;
