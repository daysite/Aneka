import fs from 'fs'

const handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    await m.react('👑')
    
    const name = await conn.getName(m.sender)
    const taguser = `@${m.sender.split('@')[0]}`
    const uptime = clockString(process.uptime() * 1000)
    const totalreg = Object.keys(global.db.data.users).length
    const rtotalreg = Object.values(global.db.data.users).filter(u => u.registered).length

    // Decoración
    const more = String.fromCharCode(8206)
    const readMore = more.repeat(4001)

    const intro = `
 ꡴ㅤ   ︵ᤢ⏜   ᷃ᩚ   ☕᪶     ᷃ᩚ ⏜ᤢ︵    ㅤ᪬
  *Hola*  ׅ ෫ׄ᷼͝${taguser}  ಒ
 ‎ ‎ ‎ ‎౨ৎ  ‎ ‎ ‎ ‎*Bienvenido* ‎ ‎  ‎ ‎✿̮    ׅ  al   ୂ  
 ⿻    *𝖬𝖾𝗇𝗎*    ෨    *𝖮𝗐𝗇𝖾𝗋*    𑇙ᰍ

*🌴 Nombre:* Shadow Ultra
*☕ Creador:* Cristian
*📚 Librería:* Baileys
*⏰ Uptime:* ${uptime}
*🚀 Type:* NodeJs
*🧇 Usuarios regs:* ${rtotalreg}
*🥞 Usuarios totales:* ${totalreg}
${readMore}
`.trim()

    // Configuración dinámica
    const defaultMenu = {
      header: category => `┏━━⪩「 *${category}* 」⪨`,
      body: cmd => `┃ ⭔ ${_p}${cmd}`,
      footer: '┗━━━━━━━━━━━━━━━⪩'
    }

    // Filtro por tag
    const help = Object.values(global.plugins)
      .filter(plugin => !plugin.disabled && plugin.tags && plugin.help)
      .map(plugin => ({
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags]
      }))

    const tagFilter = 'owner'
    const cmds = help.filter(plugin => plugin.tags.includes(tagFilter))

    let menuText = [
      defaultMenu.header('Comandos de Owner'),
      cmds.map(plugin => plugin.help.map(cmd => defaultMenu.body(cmd)).join('\n')).join('\n'),
      defaultMenu.footer
    ].join('\n')

    const finalText = [intro, menuText].join('\n\n')

    // Imagen y envío
    const img = fs.existsSync('./src/catalogo.jpg') ? fs.readFileSync('./src/catalogo.jpg') : null

    await conn.sendMessage(m.chat, {
      image: img ? { buffer: img } : { url: 'https://files.catbox.moe/9d4ria.jpg' },
      caption: finalText,
      mentions: [m.sender]
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, '✖️ Error al mostrar el menú.', m)
  }
}

handler.command = /^menuowner$/i
handler.help = ['menuowner']
handler.tags = ['owner']
export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}