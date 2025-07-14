
let handler = async (m, { conn, usedPrefix: _p }) => {
  let usertag = '@' + m.sender.split('@')[0]
  const vid = 'https://files.catbox.moe/39rx3n.mp4'
  let tags = {
    nsfw: 'Nsfw',
    emox: 'Gifs'
}

  let defaultMenu = {
    before: `ㅤᨦ۪۪۪۪ׄ᷼ㅤ֢ㅤׄㅤׅ֟፝ㅤ⋱ㅤ⁝ㅤ⋰ㅤׅ፝֟ㅤׄㅤ֢ㅤ۪۪۪۪ׄ᷼ഒ
🔥 ׅ  *¡Hola! ¿Cómo estás?*  ৎ୭
ׅ ෫${usertag}  ಒ
‎ ‎ ‎ ‎౨ৎ  ‎ ‎ ‎ ‎*Bienvenido* ‎ ‎  ‎ ‎✿̮    ׅ  *al*   ୂ
⿻     *𝖬𝖾𝗇𝗎*    ෨    *𝖭𝗌𝖿𝗐*    𑇙ᰍ

> \`\`\`${date} || ${hora}\`\`\`
`,
    header: category => `╭──•  𑁯ᰍ   ͘  *\`${category}\`*    ̣  あ  ${xnsfw}  ੭`,
    body: cmd => `│${xnsfw} ${cmd}`,
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

  await m.react('🔥')
  await conn.sendMessage(m.chat, {
    video: { url: vid },
    caption: text,
    mentions: [m.sender],
    gifPlayback: true
  }, { quoted: fkontak })
}

handler.tags = ['main']
handler.help = ['menunsfw']
handler.command = /^(menunsfw|comandosnsfw|menuhorny|hornymenu|labiblia|menu18|menu+18|menucaliente|menuporno|pornomenu|menuxxx)$/i;
handler.fail = null;

export default handler
