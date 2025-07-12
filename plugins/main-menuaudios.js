let handler = async (m, { conn, usedPrefix: _p }) => {
  let tag = '@' + m.sender.split('@')[0]
  let name = conn.getName(m.sender)
  let imgPath = './src/catalogo.jpg'

  const defaultMenu = {
    before: () => `
ㅤᨦ۪۪۪۪ׄ᷼ㅤ֢ㅤׄㅤׅ֟፝ㅤ⋱ㅤ⁝ㅤ⋰ㅤׅ፝֟ㅤׄㅤ֢ㅤ۪۪۪۪ׄ᷼ഒ
🌺 ׅ  ¡Hola! ¿Como estás?  ৎ୭
ׅ ෫${tag}  ಒ
‎ ‎ ‎ ‎౨ৎ  ‎ ‎ ‎ ‎Bienvenido ‎ ‎  ‎ ‎✿̮    ׅ  al   ୂ
⿻     𝖬𝖾𝗇𝗎    ෨    𝖮𝗐𝗇𝖾𝗋    𑇙ᰍ

🌴 Nombre: ${botname}
☕ Creador: Dev.Criss 🇦🇱
📚 Librería: Baileys
⏰ Uptime: 
🚀 Type: NodeJs
🧇 Usuarios regs: 
🥞 Usuarios totales:
\n`,
    header: category => `⌥   𑁯ᰍ   ͘  *\`𝖮ɯ𝗇𝖾𝗋\`*    ̣  あ  ☕  ੭`,
    body: cmd => `${xowner} ${cmd}`,
    footer: '',
    after: ''
  }

  let tags = { owner: 'Owner' }

  let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => ({
    help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
    tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
  }))

  let groups = {}
  for (let tag in tags) {
    groups[tag] = help.filter(plugin => plugin.tags.includes(tag))
  }

  let text = [
    defaultMenu.before(name, readMore),
    ...Object.keys(tags).map(tagKey => {
      return defaultMenu.header(tags[tagKey]) + '\n' + [
        ...groups[tagKey].map(plugin =>
          plugin.help.map(cmd =>
            defaultMenu.body(_p + cmd)
          ).join('\n')
        ),
        defaultMenu.footer
      ].join('\n')
    }),
    defaultMenu.after
  ].join('\n')

  await m.react('🤴🏻')
  await conn.sendMessage(m.chat, {
    image: { url: imgPath },
    caption: text,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['menueconomia']
handler.tags = ['rpg']
handler.command = ['menuowner', 'menueco', 'menueconomia']

export default handler