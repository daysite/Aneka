/*import fetch from 'node-fetch'

var handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `*${xia} Ingrese una petición para que Gemini lo responda.*`, m)
  try {
    conn.sendPresenceUpdate('composing', m.chat) // Writing

    const apii = await fetch(`https://apis-starlights-team.koyeb.app/starlight/gemini?text=${encodeURIComponent(text)}`)
    const res = await apii.json()

    if (!res.result) throw 'Respuesta vacía o incorrecta'
    await m.reply(res.result)
  } catch (err) {
    console.error(err)
    await m.react('✖️')
    await conn.reply(m.chat, `*✖️ Gemini no puede responder a esa pregunta.*`, m)
  }
}

handler.command = ['gemini']
handler.help = ['gemini']
handler.tags = ['ai']

export default handler*/