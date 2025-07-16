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

    const saludo = 'Bienvenido 👋' // Puedes personalizar esto
    const club = 'Shadow Club' // Texto decorativo
    const readMore = '\u200b'.repeat(850)

    await m.react('⚡')

    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let perfil = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://files.catbox.moe/ninsr8.jpg')

    const vid = [
      'https://files.catbox.moe/39rx3n.mp4',
      'https://files.catbox.moe/5fbi9s.mp4',
      'https://files.catbox.moe/biggyj.mp4'
    ]

    // Emojis por categoría
    let emojis = {
      "main": '📜',
      "info": 'ℹ️',
      // Puedes agregar más según tus categorías
    }

    let tags = {
      "main": 'Menú Principal',
      "info": 'Información',
    }

    let defaultMenu = {
      before: `
⩁꯭ ͡  ͡ᩚ꯭ ꯭⩁ 𑁯🤍ᰍ ⩁꯭ ͡  ͡ᩚ꯭ ꯭⩁
👤 ¡Hola! ¿Cómo estás?
꒰͜͡${taguser}
♡ ${saludo} タス

*🧇 Activo:* ${uptime}
*👥 Usuarios:* ${totalreg}
*🆙 Versión:* 3.0.0

*💎 Gemas:* ${diamantes}
*🍸 Exp:* ${exp}
*🫖 Nivel:* ${level}
*🍢 Rango:* ${role}
${readMore}

乂 *Lista de comandos* 乂
      `.trim(),

      header: category => `\n「 ${category} 」\n`,
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