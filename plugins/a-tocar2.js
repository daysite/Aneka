
import axios from 'axios'
import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `👀 Ingresa el texto para probar la API bratanimate.\n\n📌 Ejemplo:\n${usedPrefix + command} hello word`, m)
  }

  m.react('🧪')

  try {
    const url = `https://apizell.web.id/tools/bratanimate?q=${encodeURIComponent(text)}`
    const res = await axios.get(url, { responseType: 'arraybuffer' })

    const contentType = res.headers['content-type'] || 'desconocido'
    const contentLength = res.headers['content-length'] || res.data.length
    const fileName = `brat-check.mp4`

    // Guardar el archivo temporalmente
    fs.writeFileSync(`./${fileName}`, res.data)

    // Enviar info de diagnóstico
    await conn.sendMessage(m.chat, {
      document: fs.readFileSync(`./${fileName}`),
      fileName,
      mimetype: contentType
    }, { quoted: m })

    await conn.reply(m.chat, `📊 *Diagnóstico de la API:*\n\n- *URL:* ${url}\n- *Tipo:* ${contentType}\n- *Tamaño:* ${contentLength} bytes\n\n✅ Archivo adjunto para revisar.`, m)

    m.react('✅')
  } catch (e) {
    console.error(e)
    m.react('✖️')
    conn.reply(m.chat, `❌ Error al consultar la API:\n${e.message}`, m)
  }
}

handler.help = ['bratcheck <texto>']
handler.tags = ['debug']
handler.command = ['bratcheck', 'testbrat', 'brattest']

export default handler