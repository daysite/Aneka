let handler = async (m, { conn, usedPrefix: _p }) => {
  let tag = '@' + m.sender.split('@')[0]
  let name = conn.getName(m.sender)
  let imgPath = './src/catalogo.jpg'

  const defaultMenu = {
    before: (name, readMore) => `
ㅤᨦ۪۪۪۪ׄ᷼ㅤ֢ㅤׄㅤׅ֟፝ㅤ⋱ㅤ⁝ㅤ⋰ㅤׅ፝֟ㅤׄㅤ֢ㅤ۪۪۪۪ׄ᷼ഒ
🌺 ׅ  ¡Hola! ¿Como estás?  ৎ୭
ׅ ෫${tag}  ಒ
‎ ‎ ‎ ‎౨ৎ  ‎ ‎ ‎ ‎Bienvenido ‎ ‎  ‎ ‎✿̮    ׅ  al   ୂ
⿻     𝖬𝖾𝗇𝗎    ෨    𝖮𝗐𝗇𝖾𝗋    𑇙ᰍ

🌴 Nombre: Shadow Ultra
☕ Creador: Cristian
📚 Librería: Baileys
⏰ Uptime: 26:48:07
🚀 Type: NodeJs
🧇 Usuarios regs: 5
🥞 Usuarios totales: 1594
${readMore}`,
    header: category => `┏━━⪩「 ${category} 」⪨`,
    body: cmd => `┃ ${cmd}`,
    footer: '┗━━━━━━━━━━━━━━━⪩',
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

  const more = String.fromCharCode(8206)
  const readMore = more.repeat(4001)

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