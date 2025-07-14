let handler = async (m, { conn, usedPrefix: _p }) => {
  let usertag = '@' + m.sender.split('@')[0]
  let imgPath = './src/catalogo.jpg'
  const _uptime = process.uptime() * 1000;
  const uptime = clockString(_uptime);
  let totalreg = Object.keys(global.db.data.users).length
  let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length
  let tags = { owner: `𑁯ᰍ    *``*   ${xowner}   𐅹੭੭` }

  let defaultMenu = {
    before: `ㅤᨦ۪۪۪۪ׄ᷼ㅤ֢ㅤׄㅤׅ֟፝ㅤ⋱ㅤ⁝ㅤ⋰ㅤׅ፝֟ㅤׄㅤ֢ㅤ۪۪۪۪ׄ᷼ഒ
🌺 ׅ  *¡Hola! ¿Cómo estás?*  ৎ୭
ׅ ෫${usertag}  ಒ
‎ ‎ ‎ ‎౨ৎ  ‎ ‎ ‎ ‎*Bienvenido* ‎ ‎  ‎ ‎✿̮    ׅ  *al*   ୂ
⿻     *𝖬𝖾𝗇𝗎*    ෨    *𝖮𝗐𝗇𝖾𝗋*    𑇙ᰍ

🌴 Nombre: ${botname}
☕ Creador: Dev.Criss 🇦🇱
📚 Librería: Baileys
⏰ Uptime: ${uptime}
🚀 Type: NodeJs
🧇 Usuarios regs: ${rtotalreg}
🥞 Usuarios totales: ${totalreg}
`,
    header: category => ``,
    body: cmd => `${xowner} ${cmd}`,
    footer: `> ${club}`
  }

//--------< 🌹FUNTION🌹 >---------
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
//--------< 🌹FUNTION🌹 >---------

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

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}