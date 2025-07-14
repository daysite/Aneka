
let handler = async (m, { conn, usedPrefix: _p }) => {
  let usertag = '@' + m.sender.split('@')[0]
  const vid = 'https://files.catbox.moe/3i7ldi.mp4'
  let tags = { logos: `𑁯ᰍ    *\`𝖫ᨣ𝗀ᨣ𝗌\`*   ${xlogos}   𐅹੭੭` }

  let defaultMenu = {
    before: `ㅤᨦ۪۪۪۪ׄ᷼ㅤ֢ㅤׄㅤׅ֟፝ㅤ⋱ㅤ⁝ㅤ⋰ㅤׅ፝֟ㅤׄㅤ֢ㅤ۪۪۪۪ׄ᷼ഒ
🌴 ׅ  *¡Hola! ¿Cómo estás?*  ৎ୭
ׅ ෫${usertag}  ಒ
‎ ‎ ‎ ‎౨ৎ  ‎ ‎ ‎ ‎*Bienvenido* ‎ ‎  ‎ ‎✿̮    ׅ  *al*   ୂ
⿻     *𝖬𝖾𝗇𝗎*    ෨    *𝖫𝗈𝗀𝗈𝗌*    𑇙ᰍ

> \`\`\`${date} || ${hora}\`\`\`
`,
    header: category => `╭──• ${category}`,
    body: cmd => `│${xlogos} ${cmd}`,
    footer: '╰──•',
    after: `\n> ${club}`
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

  await m.react('🌴')
  await conn.sendMessage(m.chat, {
    video: { url: vid },
    caption: text,
    mentions: [m.sender],
    gifPlayback: true
  }, { quoted: fkontak })
}

handler.help = ['menulogos']
handler.tags = ['main']
handler.command = ['menulogos']

export default handler
