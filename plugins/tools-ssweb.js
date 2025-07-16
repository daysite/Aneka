import fetch from 'node-fetch'

let handler = async (m, { conn, args, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `*${xtools} Por favor, ingresa el link de una página.*`, m)
  }

  try {
    await m.react(rwait)

    const url = args[0].startsWith('http') ? args[0] : 'https://' + args[0]

    // Validación básica de URL
    let isValid = /^https?:\/\/[^\s]+$/.test(url)
    if (!isValid) {
      return conn.reply(m.chat, '*⚠️ El enlace no es válido.*', m)
    }

    let ss = await (await fetch(`https://image.thum.io/get/fullpage/${url}`)).buffer()
    
    if (!ss || ss.length < 1000) {
      throw new Error('*✖️ Captura vacía o inválida*')
    }

    await conn.sendFile(m.chat, ss, 'screenshot.png', `*✅ Captura de:*\n${url}`, fkontak)
    await m.react(done)

  } catch (err) {
    console.error(err)
    await conn.reply(m.chat, '*✖️ Ocurrió un error al generar la captura.*', m)
    await m.react(error)
  }
}

handler.help = ['ssweb <url>']
handler.tags = ['tools']
handler.command = ['ssweb', 'ss', 'ssw']

export default handler