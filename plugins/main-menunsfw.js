
let handler = async (m, { conn, usedPrefix: _p }) => {

  let usertag = '@' + m.sender.split('@')[0]
  const img = 'https://cdn-sunflareteam.vercel.app/images/fb422b6600.jpg'

  let tags = {
    "nsfw": "𑁯ᰍ    *`𝖭𝗌ẜɯ`*   ♨️   𐅹੭੭",
    "emox": "𑁯ᰍ    *`𝖦ıẜ𝗌`*   🦑   𐅹੭੭"
  }

  let emojis = {
    "nsfw": "♨️",
    "emox": "🦑"
  }

  let defaultMenu = {
    before: `ㅤᨦ۪۪۪۪ׄ᷼ㅤ֢ㅤׄㅤׅ֟፝ㅤ⋱ㅤ⁝ㅤ⋰ㅤׅ፝֟ㅤׄㅤ֢ㅤ۪۪۪۪ׄ᷼ഒ
🔥 ׅ  *¡Hola! ¿Cómo estás?*  ৎ୭
ׅ ෫${usertag}  ಒ
‎ ‎ ‎ ‎౨ৎ  ‎ ‎ ‎ ‎*Bienvenido* ‎ ‎  ‎ ‎✿̮    ׅ  *al*   ୂ
⿻     *𝖬𝖾𝗇𝗎*    ෨    *𝖭𝗌𝖿𝗐*    𑇙ᰍ

> \`\`\`${date} || ${hora}\`\`\`
`,

    header: category => `╭──• ${category}`,
    body: (cmd, emoji) => `│ ${emoji} ${cmd}`,
    footer: '╰──•',
    after: `> ${club}`
  }

// ---[ AGRUPACIÓN CMDS X TAGS ]---
  let help = Object.values(global.plugins)
    .filter(plugin => !plugin.disabled)
    .map(plugin => ({
      help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
      tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags]
    }))

  let groups = {}
  for (let tag in emojis) {
    groups[tag] = help.filter(plugin => plugin.tags.includes(tag))
  }

// ---[ CONTRUCCIÓN DEL TXT ]---
  let text = [
    defaultMenu.before,
    ...Object.keys(tags).map(tag =>
      [
        defaultMenu.header(tags[tag]),
        groups[tag].flatMap(plugin => plugin.help.map(cmd => defaultMenu.body(_p + cmd, emojis[tag]))).join('\n'),
        defaultMenu.footer
      ].join('\n')
    ),
    defaultMenu.after
  ].join('\n')

  await m.react('🔥')
  await conn.sendMessage(m.chat, {
    image: { url: img },
    caption: text,
    mentions: [m.sender],
    gifPlayback: false
  }, { quoted: fkontak })
}

handler.tags = ['main']
handler.help = ['menu18']
handler.command = /^(menunsfw|comandosnsfw|menuhorny|hornymenu|labiblia|menu18|menu\+18|menucaliente|menuporno|pornomenu|menuxxx)$/i;
handler.fail = null;

export default handler
