
/*
import fetch from 'node-fetch'

let handler = async (m, { text, conn, args, usedPrefix, command }) => {
  if (!text) throw `✳️ Ingresa un texto para convertir.\n\n📌 Ejemplo: *${usedPrefix + command} Shadow Bot*`

  let res = await fetch(`https://www.dark-yasiya-api.site/other/font?text=${encodeURIComponent(text)}`)
  if (!res.ok) throw `❌ Ocurrió un error al contactar con la API.`
  
  let json = await res.json()
  if (!json.status || !json.result?.length) throw `❌ No se encontraron resultados.`

  let fonts = json.result.map((f, i) => `*${i + 1}.-* _${f.name}_\n> ${f.result}`).join('\n\n')

  let message = `
╭━━〔 *🅕🅞🅝🅣 🅢🅣🅨🅛🅔* 〕━━⬣
┃ ✨ Texto: *${text}*
┃ 🔠 Estilos encontrados: *${json.result.length}*
╰━━━━━━━━━━━━━━━━⬣

${fonts}

🔗 *API by:* ${json.creator}
`.trim()

  await conn.sendMessage(m.chat, {
    text: message,
    contextInfo: {
      externalAdReply: {
        title: '🆂🅷🅰🅳🅾🆆 🅱🅾🆃 - 𝙁𝙤𝙣𝙩𝙨 𝙁𝙖𝙣𝙘𝙮',
        body: 'Estilos decorativos para texto',
        thumbnailUrl: 'https://i.imgur.com/RhT7C7h.jpeg',
        sourceUrl: 'https://github.com/CristiantermShadow/ShadowBot-MDv3',
        mediaType: 1,
        renderLargerThumbnail: true,
        showAdAttribution: true,
      }
    }
  }, { quoted: m })
}

handler.command = /^font|fuente|fonts$/i
handler.help = ['font <texto>']
handler.tags = ['tools']

export default handler
*/

import fetch from 'node-fetch'

let handler = async (m, { text, command, usedPrefix }) => {
  if (!text) throw `✳️ Ingresa un texto o elige un estilo.\n\n📌 Ejemplo: *${usedPrefix + command} 5 | Shadow Bot*\n📌 O también: *${usedPrefix + command} Shadow Bot* para ver todos los estilos.`

  // Si es formato tipo "5 | texto"
  if (/^\d+\s*\|\s*/.test(text)) {
    let [num, ...txtArr] = text.split('|')
    let txt = txtArr.join('|').trim()
    let index = parseInt(num.trim()) - 1

    if (!txt) throw `✳️ Ingresa un texto después del número.\n\n📌 Ejemplo: *${usedPrefix + command} 5 | Shadow Bot*`
    if (isNaN(index)) throw `❌ El número no es válido.`
    
    let res = await fetch(`https://www.dark-yasiya-api.site/other/font?text=${encodeURIComponent(txt)}`)
    let json = await res.json()

    if (!json.status || !json.result?.length) throw `❌ No se encontraron resultados.`
    if (!json.result[index]) throw `❌ El número debe estar entre 1 y ${json.result.length}`

    let font = json.result[index]
    let msg = `
🎨 *Fuente seleccionada:*
📌 Nombre: _${font.name}_
🔢 Estilo Nº: *${index + 1}*

🖋 Resultado:
${font.result}
`.trim()

    return m.reply(msg)
  }

  // Si solo se envía texto (sin número), lista todos los estilos
  let res = await fetch(`https://www.dark-yasiya-api.site/other/font?text=${encodeURIComponent(text)}`)
  let json = await res.json()

  if (!json.status || !json.result?.length) throw `❌ No se encontraron estilos.`

  let listado = json.result.map((f, i) => `*${i + 1}.-* _${f.name}_\n> ${f.result}`).join('\n\n')

  let fullMsg = `
╭━━〔 *🅕🅞🅝🅣🅢 - Estilos de texto* 〕━━⬣
┃ ✨ Texto: *${text}*
┃ 🔠 Estilos: *${json.result.length}*
┃ 💡 Usa: *.font 5 | ${text}*
╰━━━━━━━━━━━━━━━━━━━━⬣

${listado}
`.trim()

  m.reply(fullMsg)
}

handler.command = /^font|fuente|fonts$/i
handler.help = ['font <texto>', 'font <número> | <texto>']
handler.tags = ['tools']

export default handler