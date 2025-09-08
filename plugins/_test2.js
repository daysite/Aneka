import axios from 'axios'
import fs from 'fs'

const SEARCH_API = 'https://api.delirius.store/search/ytsearch'
const MP3_API = 'https://api.delirius.store/download/ytmp3'
const MP4_API = 'https://api.delirius.store/download/ytmp4'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`❌ *Ingresa una canción o artista.*\nEjemplo: *${usedPrefix + command} Twice*`)

  try {
    await m.react('🔍')

    // 1. Buscar videos
    const searchUrl = `${SEARCH_API}?q=${encodeURIComponent(text)}`
    console.log('🔍 Buscando en API:', searchUrl)

    const searchResponse = await axios.get(searchUrl, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    console.log('📦 Respuesta CRUDA de la API:', JSON.stringify(searchResponse.data, null, 2))

    // 🔥 ANÁLISIS DETALLADO de la estructura
    let videos = []
    const responseData = searchResponse.data

    // Opción 1: Si es array directamente
    if (Array.isArray(responseData)) {
      videos = responseData
      console.log('✅ API devuelve array directamente')
    }
    // Opción 2: Si tiene propiedad 'result'
    else if (responseData.result && Array.isArray(responseData.result)) {
      videos = responseData.result
      console.log('✅ API devuelve array en propiedad "result"')
    }
    // Opción 3: Si tiene propiedad 'results' 
    else if (responseData.results && Array.isArray(responseData.results)) {
      videos = responseData.results
      console.log('✅ API devuelve array en propiedad "results"')
    }
    // Opción 4: Si tiene propiedad 'items'
    else if (responseData.items && Array.isArray(responseData.items)) {
      videos = responseData.items
      console.log('✅ API devuelve array en propiedad "items"')
    }
    // Opción 5: Si tiene propiedad 'data'
    else if (responseData.data && Array.isArray(responseData.data)) {
      videos = responseData.data
      console.log('✅ API devuelve array en propiedad "data"')
    }
    // Opción 6: Si es un objeto con videos embebidos
    else if (responseData.videos && Array.isArray(responseData.videos)) {
      videos = responseData.videos
      console.log('✅ API devuelve array en propiedad "videos"')
    }
    // Opción 7: Si la API tiene otra estructura inesperada
    else {
      console.log('❌ Estructura no reconocida. Propiedades disponibles:', Object.keys(responseData))
      // Intentar extraer videos de cualquier manera
      for (let key in responseData) {
        if (Array.isArray(responseData[key])) {
          videos = responseData[key]
          console.log(`✅ Encontrado array en propiedad "${key}"`)
          break
        }
      }
    }

    // Si aún no tenemos videos, mostrar error detallado
    if (!videos.length) {
      console.log('❌ No se pudieron extraer videos. Estructura completa:')
      console.log(JSON.stringify(responseData, null, 2))
      throw new Error(`API devolvió estructura no compatible. Revisa logs para detalles.`)
    }

    videos = videos.slice(0, 5)
    console.log(`🎯 Videos encontrados: ${videos.length}`)

    // Formatear lista de resultados (adaptable a diferentes estructuras)
    let list = videos.map((v, i) => {
      const title = v.title || v.name || v.snippet?.title || 'Sin título'
      const url = v.url || v.link || v.videoUrl || v.id?.videoId || v.id || '#'
      const duration = v.duration || v.length || v.contentDetails?.duration || 'N/A'
      const views = v.views || v.viewCount || v.statistics?.viewCount || 'N/A'
      
      return `${i + 1}. *${title}*\n   • ⏱️ ${duration}\n   • 👁️ ${views}`
    }).join('\n\n')

    let msg = `🎵 *Resultados para:* ${text}\n\n${list}\n\n*Responde con el número (1-5) para descargar.*`

    // Botones de WhatsApp
    const buttons = [
      { buttonId: '1', buttonText: { displayText: '1️⃣' }, type: 1 },
      { buttonId: '2', buttonText: { displayText: '2️⃣' }, type: 1 },
      { buttonId: '3', buttonText: { displayText: '3️⃣' }, type: 1 },
      { buttonId: '4', buttonText: { displayText: '4️⃣' }, type: 1 },
      { buttonId: '5', buttonText: { displayText: '5️⃣' }, type: 1 }
    ]

    await conn.sendMessage(m.chat, {
      text: msg,
      footer: '⏰ Responde con el número en 60 segundos',
      buttons: buttons,
      headerType: 1
    }, { quoted: m })

    // ... (el resto del código permanece igual)

  } catch (error) {
    console.error('❌ Error general:', error.message)
    console.error('📋 Stack:', error.stack)
    m.reply('❌ Error: ' + error.message + '\nRevisa la consola para más detalles.')
    await m.react('❌')
  }
}

handler.help = ['ytmusica <búsqueda>']
handler.tags = ['downloader']
handler.command = /^yt(musica|música|music)$/i

export default handler
