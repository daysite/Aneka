import fs from 'fs'
import fetch from 'node-fetch'
import { xpRange } from '../lib/levelling.js'
import { join } from 'path'

let handler = async (m, { conn, usedPrefix, __dirname, command }) => {
  try {
    let { exp, diamantes, level, role } = global.db.data.users[m.sender]
    let { min, xp, max } = xpRange(level, global.multiplier)
    let name = await conn.getName(m.sender)

    exp = exp || 'Desconocida'
    role = role || 'Aldeano'

    const taguser = '@' + m.sender.split('@s.whatsapp.net')[0]
    const _uptime = process.uptime() * 1000
    const uptime = clockString(_uptime)

    let totalreg = Object.keys(global.db.data.users).length
    let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered).length
    const readMore = '\u200b'.repeat(850)

    await m.react('⚡')

    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let perfil = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://files.catbox.moe/ninsr8.jpg')

    const vid = [
      'https://files.catbox.moe/39rx3n.mp4',
      'https://files.catbox.moe/5fbi9s.mp4',
      'https://files.catbox.moe/biggyj.mp4'
    ]



  }

  let emojis = {
    "main": xmenus,
    "info": xinfo,
    "jadibot": xjadi,
    "config": xconfig,
    "download": xdownload,
    "search": xsearch,
    "ia": xia,
    "ff": xff,
    "frases": xfrases,
    "converter": xconverter,
    "tools": xtools,
    "gc": xgc,
    "efects": xefects,
    "fun": xfun,
    "game": xgame,
    "logos": xlogos,
    "maker": xmaker,
    "emox": xemox,
    "nsfw": xnsfw,
    "sticker": xsticker,
    "rpg": xrpg,
    "reg": xreg,
    "owner": xowner,
  }


  let tags = {
    "main": `𓂂𓏸  𐅹੭੭   *\`Mᧉ𝗇𝗎𝗌\`*  ${xmenus}ᩚ꤬ᰨᰍ`,
    "info": `𓂂𓏸  𐅹੭੭   *\`𝖨𝗇ẜᨣ\`*  ${xinfo}ᩚ꤬ᰨᰍ`,
    "jadibot": `𓂂𓏸  𐅹੭੭   *\`𝖩⍺𝖽ı-ᗷᨣƚ𝗌\`*  ${xjadi}ᩚ꤬ᰨᰍ`,
    "config": `𓂂𓏸  𐅹੭੭   *\`𝖮𝗇-𝖮ẜẜ\`*  ${xconfig}ᩚ꤬ᰨᰍ`,
    "download": `𓂂𓏸  𐅹੭੭   *\`𝖣ᨣ𝗐𝗇𝗅ᨣ⍺𝖽\`* ${xdownload}ᩚ꤬ᰨᰍ`,
    "search": `𓂂𓏸  𐅹੭੭   *\`𝖲ᧉ⍺ꭇ𝖼𝗁\`*  ${xsearch}ᩚ꤬ᰨᰍ`,
    "ia": `𓂂𓏸  𐅹੭੭   *\`𝖨𝗇ƚᧉ𝖨ı𝗀ᧉ𝗇𝖼ı𝖺𝗌\`*  ${xia}ᩚ꤬ᰨᰍ`,
    "ff": `𓂂𓏸  𐅹੭੭   *\`𝖥𝗋ᧉᧉ 𝖥ı𝗋ᧉ\`*  ${xff}ᩚ꤬ᰨᰍ`,
    "frases": `𓂂𓏸  𐅹੭੭   *\`𝖥𝗋⍺𝗌ᧉ𝗌\`* ${xfrases}ᩚ꤬ᰨᰍ`,
    "converter": `𓂂𓏸  𐅹੭੭   *\`𝖢ᨣ𝗇𝗏ᧉ𝗋ƚᧉ𝗋𝗌\`*  ${xconverter}ᩚ꤬ᰨᰍ`,
    "tools": `𓂂𓏸  𐅹੭੭   *\`𝖳ᨣᨣ𝗅𝗌\`*  ${xtools}ᩚ꤬ᰨᰍ`,
    "gc": `𓂂𓏸  𐅹੭੭   *\`𝖦ꭇ𝗎𝗉ᨣ𝗌\`*  ${xgc}ᩚ꤬ᰨᰍ`,
    "efects": `𓂂𓏸  𐅹੭੭   *\`𝖤ẜᧉ𝖼ƚ𝗌\`*  ${xefects}ᩚ꤬ᰨᰍ`,
    "fun": `𓂂𓏸  𐅹੭੭   *\`𝖥𝗎𝗇\`*  ${xfun}ᩚ꤬ᰨᰍ`,
    "game": `𓂂𓏸  𐅹੭੭   *\`𝖩𝗎ᧉ𝗀ᨣ𝗌\`*  ${xgame}ᩚ꤬ᰨᰍ`,
    "anime": `𓂂𓏸  𐅹੭੭   *\`𝖠𝗇ı𝗆ᧉ\`*  ${xanime}ᩚ꤬ᰨᰍ`,
    "logos": `𓂂𓏸  𐅹੭੭   *\`𝖫ᨣ𝗀𑄙𝗌\`*  ${xlogos}ᩚ꤬ᰨᰍ`,
    "maker": `𓂂𓏸  𐅹੭੭   *\`𝖬⍺𝗄ᧉ𝗋\`*  ${xmaker}ᩚ꤬ᰨᰍ`,
    "emox": `𓂂𓏸  𐅹੭੭   *\`𝖦ıẜ𝗌-𝖭𝗌ẜɯ\`*  ${xemox}ᩚ꤬ᰨᰍ`,
    "nsfw": `𓂂𓏸  𐅹੭੭   *\`𝖭𝗌ẜɯ\`*  ${xnsfw}ᩚ꤬ᰨᰍ`,
    "sticker": `𓂂𓏸  𐅹੭੭   *\`𝖲ƚ𝗂𝖼𝗄ᧉꭇ\`*  ${xsticker}ᩚ꤬ᰨᰍ`,
    "rpg": `𓂂𓏸  𐅹੭੭   *\`𝖱𝗉𝗀\`*  ${xrpg}ᩚ꤬ᰨᰍ`,
    "reg": `𓂂𓏸  𐅹੭੭   *\`𝖱ᧉ𝗀ı𝗌𝗍𝗋ᨣ\`*  ${xreg}ᩚ꤬ᰨᰍ`,
    "owner": `𓂂𓏸  𐅹੭੭   *\`𝖮ɯ𝗇ᧉꭇ\`*  ${xowner}ᩚ꤬ᰨᰍ`,
  }



    let defaultMenu = {
      before: `ㅤㅤㅤ⩁꯭ ͡  ͡ᩚ꯭ ꯭⩁ㅤㅤ𑁯🤍ᰍㅤㅤ⩁꯭ ͡  ͡ᩚ꯭ ꯭⩁
೯ ׅ 👤 ¡Hᴏʟᴀ! ¿Cᴏᴍᴏ Esᴛᴀ́s? ׄ ᦡᦡ
ㅤ꒰͜͡${taguser}
ㅤㅤ♡𑂳ᩙㅤ ּ ${saludo} ׄ ㅤタス

*🧇 Activo:* ${uptime}
*👥 Usuarios:* ${totalreg}
*🆙 Versión:* 3.0.0

*💎 Gemas:* ${diamantes}
*🍸 Exp:* ${exp}
*🫖 Nivel:* ${level}
*🍢 Rango:* ${role}
${readMore}
ㅤ ㅤ   乂 *ʟɪsᴛᴀ ᴅᴇ ᴄᴏᴍᴀɴᴅᴏs* 乂
`.trim(),

      header: category => `\n${category}`,
      body: (cmd, emoji) => `  ${emoji} ${cmd}`,
      footer: '',
      after: `\n> ${club}`
    }

    let help = Object.values(global.plugins)
      .filter(plugin => !plugin.disabled)
      .map(plugin => ({
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags]
      }))

    // Agrupar comandos por tag
    let groupsByTag = {}
    for (let tag in emojis) {
      groupsByTag[tag] = help.filter(plugin => plugin.tags.includes(tag))
    }

    // Construcción del menú
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
      video: { url: vid[Math.floor(Math.random() * vid.length)] },
      caption: menuText,
      contextInfo: {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardingScore: 999,
        externalAdReply: {
          title: '⏤͟͞ू⃪ ፝͜⁞ShadowBot Menú',
          body: 'Sistema de comandos completo',
          thumbnailUrl: perfil,
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: true,
          mediaUrl: null,
          sourceUrl: `https://github.com/ShadowBot-MDv3`
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    await m.reply('⚠️ Error al generar el menú.')
  }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['tes']

export default handler

// Utilidad para uptime
function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}