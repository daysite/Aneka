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