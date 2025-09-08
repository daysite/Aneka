import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  console.log('🔍 Comando recibido:', command, 'Texto:', text)
  
  // Solo responder con un mensaje de prueba
  if (command === 'ytmusica') {
    await m.react('🎵')
    return m.reply(`✅ *ytmusica funcionando!*\nBúsqueda: ${text || 'Ninguna'}`)
  }
  
  if (command === 'descargar') {
    await m.react('📥')
    return m.reply(`✅ *descargar funcionando!*\nNúmero: ${text || 'Ninguno'}`)
  }
  
  if (command === 'audio') {
    await m.react('🎧')
    return m.reply('✅ *audio funcionando!*')
  }
  
  if (command === 'video') {
    await m.react('🎬')
    return m.reply('✅ *video funcionando!*')
  }
}

handler.help = [
  'ytmusica <búsqueda>',
  'descargar <1-5>',
  'audio',
  'video'
]
handler.tags = ['downloader']
handler.command = /^(yt(musica|música|music)|descargar|audio|video)$/i

export default handler
