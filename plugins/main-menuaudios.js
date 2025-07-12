let handler = async (m, { conn, usedPrefix: _p }) => {
  let usertag = '@' + m.sender.split('@')[0]
  let imgPath = './src/catalogo.jpg'
  let tags = { owner: '𝖮ɯ𝗇𝖾𝗋' }

  let defaultMenu = {
    before: `
ㅤᨦ۪۪۪۪ׄ᷼ㅤ֢ㅤׄㅤׅ֟፝ㅤ⋱ㅤ⁝ㅤ⋰ㅤׅ፝֟ㅤׄㅤ֢ㅤ۪۪۪۪ׄ᷼ഒ
🌺 ׅ  *¡Hola! ¿Cómo estás?*  ৎ୭
ׅ ෫${usertag}  ಒ
‎ ‎ ‎ ‎౨ৎ  ‎ ‎ ‎ ‎*Bienvenido* ‎ ‎  ‎ ‎✿̮    ׅ  *al*   ୂ
⿻     *𝖬𝖾𝗇𝗎*    ෨    *𝖮𝗐𝗇𝖾𝗋*    𑇙ᰍ

🌴 Nombre: ${botname}
☕ Creador: Dev.Criss 🇦🇱
📚 Librería: Baileys
⏰ Uptime: 
🚀 Type: NodeJs
🧇 Usuarios regs: 
🥞 Usuarios totales:
`,
    header: category => `⌥   𑁯ᰍ   ͘  *\`${category}\`*    ̣  あ  ☕  ੭`,
    body: cmd => `${xowner} ${cmd}`,
    footer: `> ${club}`
  }

  let help = Object.values(global.plugins)
    .filter(plugin => !plugin.disabled)
    .map(plugin => ({
      help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
      tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags]
    }))

  let groups = {}
  for (let tag in tags) {
    groups[tag] = help.filter(plugin => plugin.tags.includes(tag))
  }

  let text = [
    defaultMenu.before,
    ...Object.keys(tags).map(tag =>
      [
        defaultMenu.header(tags[tag]),
        groups[tag].flatMap(plugin => plugin.help.map(cmd => defaultMenu.body(_p + cmd))).join('\n'),
        defaultMenu.footer
      ].join('\n')
    ),
    defaultMenu.after
  ].join('\n')

  await m.react('🤴🏻')
  await conn.sendMessage(m.chat, {
    image: { url: imgPath },
    caption: text,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['menuowner']
handler.tags = ['main']
handler.command = ['menuowner']

export default handler