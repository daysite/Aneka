import fs from 'fs'

const handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    // ✅ Reacción al comando
    await m.react('👑')

    // ✅ Datos del usuario y sistema
    const taguser = `@${m.sender.split('@')[0]}`
    const name = await conn.getName(m.sender)
    const uptime = clockString(process.uptime() * 1000)
    const totalreg = Object.keys(global.db.data.users || {}).length
    const rtotalreg = Object.values(global.db.data.users || {}).filter(u => u.registered).length

    // ✅ Texto de introducción con estilo
    const readMore = String.fromCharCode(8206).repeat(4001)
    const intro = `
꡴ㅤ   ︵ᤢ⏜   ᷃ᩚ   ☕᪶     ᷃ᩚ ⏜ᤢ︵    ㅤ᪬
  *Hola*  ${taguser}  ಒ
 ‎ ‎ ‎ ‎౨ৎ  ‎ ‎ ‎ ‎*Bienvenido* ‎ ‎  ‎ ‎✿̮    al  
 ⿻    *𝖬𝖾𝗇𝗎*    ෨    *𝖮𝗐𝗇𝖾𝗋*    𑇙ᰍ

*🌴 Nombre:* Shadow Ultra
*☕ Creador:* Cristian
*📚 Librería:* Baileys
*⏰ Uptime:* ${uptime}
*🚀 Type:* NodeJs
*🧇 Usuarios regs:* ${rtotalreg}
*🥞 Usuarios totales:* ${totalreg}
${readMore}`.trim()

    // ✅ Estilo del menú
    const defaultMenu = {
      header: category => `┏━━⪩「 *${category}* 」⪨`,
      body: cmd => `┃ ⭔ ${_p}${cmd}`,
      footer: '┗━━━━━━━━━━━━━━━⪩'
    }

    // ✅ Obtener plugins con tag 'owner'
    const help = Object.values(global.plugins || {}).filter(
      plugin => !plugin.disabled && plugin.tags && plugin.help
    )

    const cmds = help
      .filter(plugin => plugin.tags.includes('owner'))
      .map(plugin => ({
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help]
      }))

    if (!cmds.length) throw '❌ No se encontraron comandos de owner.'

    // ✅ Construcción del menú
    const menuText = [
      defaultMenu.header('Comandos de Owner'),
      cmds.map(plugin =>
        plugin.help.map(cmd => defaultMenu.body(cmd)).join('\n')
      ).join('\n'),
      defaultMenu.footer
    ].join('\n')

    const finalText = [intro, menuText].join('\n\n')

    // ✅ Verificación y carga de imagen local
    const imgPath = './src/catalogo.jpg'
    if (!fs.existsSync(imgPath)) throw '❌ Imagen no encontrada en ./src/catalogo.jpg'
    const imgBuffer = fs.readFileSync(imgPath)

    // ✅ Enviar mensaje con imagen
    await conn.sendMessage(m.chat, {
      image: imgBuffer,
      caption: finalText,
      mentions: [m.sender]
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, '✖️ Ocurrió un error al mostrar el menú.', m)
  }
}

handler.command = /^menuowner$/i
handler.help = ['menuowner']
handler.tags = ['owner']
export default handler

// ⏰ Formatear uptime
function clockString(ms) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}