import fetch from 'node-fetch'
const handler = async (m, { conn, args, usedPrefix, command }) => {
  const text = args.join(' ')
  if (!text) {
    return m.reply(`✳️ *Ejemplo de uso:*\n${usedPrefix + command} Hola che`)
  }

  try {
    const api = `https://apizell.web.id/tools/bratanimate?q=${encodeURIComponent(text)}`
    const res = await fetch(api)
    const json = await res.json()

    if (!json.status) {
      return m.reply(`❌ *Error:*\n${json.message || 'No se pudo generar el video.'}`)
    }

    await conn.sendMessage(m.chat, {
      video: { url: json.result },
      caption: `🎬 *Brat Animation*\n💬 Texto: ${text}`,
      gifPlayback: true
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('❌ Ocurrió un error al generar el video. Intenta más tarde.')
  }
}
handler.command = ['brattv']
handler.tags = ['video']
handler.help = ['brat <texto>']
//handler.register = true
//handler.limit = true

export default handler