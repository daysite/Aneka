
let handler = async (m, { conn, usedPrefix: _p }) => {

  let usertag = '@' + m.sender.split('@')[0]
  const vid = 'https://files.catbox.moe/39rx3n.mp4'

  let tags = {
    "fflist": `𑁯ᰍ    *\`𝖫ı𝗌ƚ𝖺𝗌\`*   📑   𐅹੭੭`,
    "ffgc": `𑁯ᰍ    *\`𝖲𝖾𝗅𝖾𝖼𝗍\`*   🥧   𐅹੭੭`
  }

  let emojis = {
    "ff": "📑",
    "ffgc": "🥧"
  }

  let defaultMenu = {
    before: `ㅤᨦ۪۪۪۪ׄ᷼ㅤ֢ㅤׄㅤׅ֟፝ㅤ⋱ㅤ⁝ㅤ⋰ㅤׅ፝֟ㅤׄㅤ֢ㅤ۪۪۪۪ׄ᷼ഒ
🎮 ׅ  *¡Hola! ¿Cómo estás?*  ৎ୭
ׅ ෫${usertag}  ಒ
‎ ‎ ‎ ‎౨ৎ  ‎ ‎ ‎ ‎*Bienvenido* ‎ ‎  ‎ ‎✿̮    ׅ  *al*   ୂ
⿻     *𝖬𝖾𝗇𝗎*    ෨    *𝖥𝗋𝖾𝖾 𝖥𝗂𝗋𝖾*    𑇙ᰍ

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

  await m.react('🎮')
  await conn.sendMessage(m.chat, {
    video: { url: vid },
    caption: text,
    mentions: [m.sender],
    gifPlayback: true
  }, { quoted: fkontak })
}

handler.tags = ['main']
handler.help = ['menufrefire']
handler.command = /^(menuff|menufreefire|ff|ffcomandos|comandosff|comandosfreefire|freefire|freefir|freefiri)$/i;
handler.fail = null;

export default handler