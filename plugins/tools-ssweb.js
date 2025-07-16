import fetch from 'node-fetch'

let handler = async (m, { conn, command, args }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `*${xtools} Por favor, ingresa el link de una página.*`, m)
  }

  try {
    await m.react('⌛')

    // Validación básica de URL
    const url = args[0].trim()
    if (!/^https?:\/\//i.test(url)) {
      return conn.reply(m.chat, '*⚠️ El enlace debe empezar con https://*', m)
    }

    const ssUrl = `https://image.thum.io/get/fullpage/${encodeURIComponent(url)}`
    const response = await fetch(ssUrl)

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const image = await response.buffer()
    await conn.sendFile(m.chat, image, 'screenshot.png', url, fkontak)

    await m.react('✅')
  } catch (e) {
    console.error('[❌ ERROR EN SSWEB]', e)
    await m.react('✖️')
    return conn.reply(m.chat, '*✖️ Ocurrió un error al generar la captura.*', m)
  }
}

handler.help = ['ssweb']
handler.tags = ['tools']
handler.command = ['ssweb', 'ss', 'ssw']
export default handler