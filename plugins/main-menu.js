import fs from 'fs'
import fetch from 'node-fetch'
import { xpRange } from '../lib/levelling.js'
import { join } from 'path'

let handler = async (m, { conn, usedPrefix, __dirname, command }) => {
  try {
    let { exp, diamantes, level, role } = global.db.data.users[m.sender]
    let { min, xp, max } = xpRange(level, global.multiplier)
    let name = await conn.getName(m.sender)

    exp = exp || '0'
    role = role || 'Aldeano'

    //const taguser = '@' + m.sender.split('@s.whatsapp.net')[0]
    let taguser = '@' + m.sender.split('@')[0]
    const _uptime = process.uptime() * 1000
    const uptime = clockString(_uptime)

    let totalreg = Object.keys(global.db.data.users).length
    let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered).length
    const readMore = '\u200b'.repeat(850)

    await m.react('🪸')

    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let perfil = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://files.catbox.moe/ninsr8.jpg')

    const vid = [
      'https://files.catbox.moe/1sqrsm.mp4',
      'https://files.catbox.moe/1sqrsm.mp4',
      'https://files.catbox.moe/1sqrsm.mp4'
    ]

let tags = {};
let emojis = {
  main: xmenus,
  info: xinfo,
  jadibot: xjadi,
  config: xconfig,
  download: xdownload,
  search: xsearch,
  ia: xia,
  ff: xff,
  frases: xfrases,
  converter: xconverter,
  tools: xtools,
  gc: xgc,
  efectos: xefects,
  fun: xfun,
  game: xgame,
  anime: xanime,
  logos: xlogos,
  maker: xmaker,
  emox: xemox,
  nsfw: xnsfw,
  sticker: xsticker,
  rpg: xrpg,
  rg: xreg,
  owner: xowner
};

const tagTitles = {
  main: "Mᧉ𝗇𝗎𝗌",
  info: "𝖨𝗇ẜᨣ",
  jadibot: "𝖩⍺𝖽ı-ᗷᨣƚ𝗌",
  config: "𝖮𝗇-𝖮ẜẜ",
  download: "𝖣ᨣ𝗐𝗇𝗅ᨣ⍺𝖽",
  search: "𝖲ᧉ⍺ꭇ𝖼𝗁",
  ia: "𝖨𝗇ƚᧉ𝖨ı𝗀ᧉ𝗇𝖼ı𝖺𝗌",
  ff: "𝖥𝗋ᧉᧉ 𝖥ı𝗋ᧉ",
  frases: "𝖥𝗋⍺𝗌ᧉ𝗌",
  converter: "𝖢ᨣ𝗇𝗏ᧉ𝗋ƚᧉ𝗋𝗌",
  tools: "𝖳ᨣᨣ𝗅𝗌",
  gc: "𝖦ꭇ𝗎𝗉ᨣ𝗌",
  efectos: "𝖤ẜᧉ𝖼ƚ𝗌",
  fun: "𝖥𝗎𝗇",
  game: "𝖩𝗎ᧉ𝗀ᨣ𝗌",
  anime: "𝖠𝗇ı𝗆ᧉ",
  logos: "𝖫ᨣ𝗀𑄙𝗌",
  maker: "𝖬⍺𝗄ᧉ𝗋",
  emox: "𝖦ıẜ𝗌-𝖭𝗌ẜɯ",
  nsfw: "𝖭𝗌ẜɯ",
  sticker: "𝖲ƚ𝗂𝖼𝗄ᧉꭇ",
  rpg: "𝖱𝗉𝗀",
  rg: "𝖱ᧉ𝗀ı𝗌𝗍𝗋ᨣ",
  owner: "𝖮ɯ𝗇ᧉꭇ"
};

for (let key in emojis) {
  tags[key] = `𓂂𓏸  𐅹੭੭   *\`${tagTitles[key]}\`*  ${emojis[key]}ᩚ꤬ᰨᰍ`;
}

    let defaultMenu = {


    before: `ㅤ
*🥟 황현진 ₊˚⊹ 🥢*

*ּ ֶָ֢! ᰔ ִ ׄ𝐎𝐥𝐢 𝐡𝐞𝐫𝐦𝐨𝐬𝐮𝐫𝐚 𝐜𝐨𝐦𝐨 𝐭𝐞 𝐞𝐧𝐜𝐮𝐞𝐧𝐭𝐫𝐚𝐬 𝐞𝐥 𝐝í𝐚 𝐝𝐞 𝐡𝐨𝐲ִ ࣪ ˖ ࣪* ${taguser}

*₊𖥔 ℓo͟v͟ꫀ ყoυ ! ۪ ׄ໑୧ ׅ𖥔ׄ.                · 　          ·.       ˚.         .     ๋ ࣭ 

   　 .  ๋ ࣭ ⭑         *           ˚                 

·       ๋ ࣭ *

 ${saludo} ׄ 𝐋𝐢𝐧𝐝𝐮𝐫𝐚 👋🏻

\`🥮 Activo:\` ${uptime}
\`🦊 Usuarios:\` ${totalreg}
\`🪸 Versión:\` ${vs}
\`🪄 Creador:\` @${creadorN}

ㅤ ㅤ \` ࣪ ˖ ࣪ 𝑪𝒐𝒎𝒂𝒏𝒅𝒔 𝑨𝒏𝒆𝒌𝒊𝒕𝒂 ! ᰔ ִ ׄ\`
`,

      header: category => ` ${category}`,
      body: (cmd, emoji) => `୨ৎ ׄ ${emoji}˚ ${cmd}`,
      footer: '',
      after: `> ${club}`
  }

    let help = Object.values(global.plugins)
      .filter(plugin => !plugin.disabled)
      .map(plugin => ({
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags]
      }))

    let groupsByTag = {}
    for (let tag in emojis) {
      groupsByTag[tag] = help.filter(plugin => plugin.tags.includes(tag))
    }

    let menuText = [
      defaultMenu.before,
      ...Object.keys(tags).map(tag =>
        [
          defaultMenu.header(tags[tag]),
          groupsByTag[tag].flatMap(plugin => plugin.help.map(cmd => defaultMenu.body(usedPrefix + cmd, emojis[tag]))).join('\n'),
          defaultMenu.footer
        ].join('\n')
      ),
      defaultMenu.after
    ].join('\n')


        await conn.sendMessage(m.chat, {
            video: { url: vid.getRandom() }, // Vid
            caption: menuText,
            contextInfo: {
                mentionedJid: [m.sender, creadorM],
                isForwarded: true,
                forwardingScore: 999,
                externalAdReply: {
                    title: 'luccxs.qzy x aneka\nno se copien pe',
                    thumbnailUrl: perfil,
                    mediaType: 1,
                    renderLargerThumbnail: false,
                },
            },
            gifPlayback: true,
            gifAttribution: 0
        }, { quoted: null })
    } catch (e) {
        await m.reply(`*✖️ Ocurrió un error al enviar el menú.*\n\n${e}`)
    }
}

handler.command = /^(menu|menú|memu|memú|help|info|comandos|2help|menu1.2|ayuda|commands|commandos|cmd)$/i;
handler.register = true
export default handler

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
