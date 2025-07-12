
/*import fetch from 'node-fetch';

const handler = async (m, {conn, usedPrefix, text}) => {

  try {
    await m.react ('🌴');
    const videoUrl = 'https://files.catbox.moe/3i7ldi.mp4'
    const taguser = '@' + m.sender.split('@s.whatsapp.net')[0];

    const str = `
ㅤᨦ۪۪۪۪ׄ᷼ㅤ֢ㅤׄㅤׅ֟፝ㅤ⋱ㅤ⁝ㅤ⋰ㅤׅ፝֟ㅤׄㅤ֢ㅤ۪۪۪۪ׄ᷼ഒ
 𝖧𝗈𝗅⍺ ${taguser}
𝖡𝗂𝖾𝗇𝗏𝖾𝗇𝗂𝖽𑄙 ⍺𝗅 *𝖬𝖾𝗇𝗎́ 𝖫𝗈𝗀𑄈𝗌*

ᦷᩘᦷ   ݂  \`ᴄᴏᴍᴀɴᴅᴏs\`  ፡ ܻ̯͛ᩘ${xlogos}
ᰅ${xlogos}ᰍ ${usedPrefix}balogo *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logocorazon *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logochristmas  *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logopareja *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logoglitch *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logosad *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logogaming *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logosolitario *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logodragonball *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logoneon *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logogatito *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logochicagamer *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logonaruto *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logofuturista *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logonube *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logoangel *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logomurcielago *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logocielo *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logograffiti3d *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logomatrix *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logohorror **txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logoalas *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logoarmy *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logopubg *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logopubgfem *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logolol *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logoamongus *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logovideopubg *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logovideotiger *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logovideointro *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logovideogaming *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logoguerrero *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logoportadaplayer *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logoportadaff *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logoportadapubg *txt*
ᰅ${xlogos}ᰍ ${usedPrefix}logoportadacounter *txt*
> ${club}
`.trim();

      await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: str,
            mentions: [m.sender],
            gifPlayback: true
        }, { quoted: fkontak })

  } catch (e) {
    conn.reply(m.chat,`*❌ Error al enviar el menú.*\n${e}`, m);
  }
};

handler.command = /^(menulogos|menu2)$/i;
handler.fail = null;

export default handler;*/

let handler = async (m, { conn, usedPrefix: _p }) => {
  let usertag = '@' + m.sender.split('@')[0]
  let imgPath = './src/catalogo.jpg'
  let tags = { owner: 'Logos' }

  let defaultMenu = {
    before: `
ㅤᨦ۪۪۪۪ׄ᷼ㅤ֢ㅤׄㅤׅ֟፝ㅤ⋱ㅤ⁝ㅤ⋰ㅤׅ፝֟ㅤׄㅤ֢ㅤ۪۪۪۪ׄ᷼ഒ
🌺 ׅ  *¡Hola! ¿Cómo estás?*  ৎ୭
ׅ ෫${usertag}  ಒ
‎ ‎ ‎ ‎౨ৎ  ‎ ‎ ‎ ‎*Bienvenido* ‎ ‎  ‎ ‎✿̮    ׅ  *al*   ୂ
⿻     *𝖬𝖾𝗇𝗎*    ෨    *𝖫𝗈𝗀𝗈𝗌*    𑇙ᰍ

*📆 Fecha:* ${date} ${hour}
`,
    header: category => `⌥   𑁯ᰍ   ͘  *\`${category}\`*    ̣  あ  ☕  ੭`,
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
handler.command = ['menulogos']

export default handler

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

