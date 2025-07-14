/*
import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, `${xia} Ingresa un texto para hablar con ChatGPT*`, m)
  try {
    conn.sendPresenceUpdate('composing', m.chat) // Writing
    const endpoint = `https://vapis.my.id/api/openai?q=${encodeURIComponent(text)}`
    let apiRes = await fetch(endpoint)
    let json = await apiRes.json()
    if (json.status) {
      await m.reply(json.result)
    } else {
      await m.reply(`✖️ Hubo un error al obtener la respuesta de la API.`)
    }
  } catch (error) {
    console.error(error)
    await m.reply(`✖️ Ocurrió un error al procesar tu solicitud.`)
  }
}

handler.help = ['chatgpt *<texto>*']
handler.tags = ['ai']
handler.command = ['chatgpt']

export default handler*/