/*
let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i

export async function before(m, { isAdmin, isBotAdmin, conn }) {
  if (m.isBaileys && m.fromMe) return !0
  if (!m.isGroup) return !1

  // Ignorar mensajes enviados por el mismo bot
  if (m.sender === conn.user.jid) return !0

  let chat = global.db.data.chats[m.chat]
  let delet = m.key.participant
  let bang = m.key.id
  let bot = global.db.data.settings[this.user.jid] || {}
  const isGroupLink = linkRegex.exec(m.text)
  const grupo = `https://chat.whatsapp.com`

  if (isAdmin && chat.antiLink && m.text.includes(grupo))
    return conn.reply(m.chat, `*☕ Hey!! el \`antilink\` está activo pero eres admin, ¡salvado!*`, m, rcanal)

  if (chat.antiLink && isGroupLink && !isAdmin) {
    if (isBotAdmin) {
      const linkThisGroup = `https://chat.whatsapp.com/${await this.groupInviteCode(m.chat)}`
      if (m.text.includes(linkThisGroup)) return !0
    }
    await conn.reply(m.chat, `*☕ ¡Enlace detectado!*\n\n*${await this.getName(m.sender)} mandaste un enlace prohibido por lo cual serás eliminado*`, m, rcanal)
    if (!isBotAdmin)
      return conn.reply(m.chat, `*⚠️ No soy admin, no puedo eliminar intrusos*`, m)
    if (isBotAdmin) {
      await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }})
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
    } else if (!bot.restrict) {
      return conn.reply(m.chat, `*☕ Esta característica está desactivada*`, m)
    }
  }

  return !0
}
*/

let linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i

export async function before(m, { isAdmin, isBotAdmin }) {
  try {
    const conn = this.conn || this // compatibilidad con diferentes bindings

    // Ignorar mensajes del propio bot (forma segura)
    if (m?.key?.fromMe) return !0
    if (m?.isBaileys) return !0

    // Otra comprobación por si this.user.jid tiene sufijos
    const myJidBase = (this.user?.jid || (conn.user && conn.user.jid) || '').split(':')[0]
    if (m?.sender && m.sender.split(':')[0] === myJidBase) return !0

    if (!m.isGroup) return !1

    const chat = global.db?.data?.chats?.[m.chat] || {}
    if (!chat.antiLink) return !0

    // Obtener texto de forma segura (soporta varios tipos de mensajes)
    const text = (m.text || m.message?.conversation || m.message?.extendedTextMessage?.text || '').toString()
    if (!text) return !0

    const isGroupLink = linkRegex.test(text)
    if (!isGroupLink) return !0

    // Ignorar admins
    if (isAdmin) return !0

    // Evitar que borre el enlace del mismo grupo (si podemos obtener el código)
    try {
      const code = (conn.groupInviteCode ? await conn.groupInviteCode(m.chat) : (this.groupInviteCode ? await this.groupInviteCode(m.chat) : ''))
      const linkThisGroup = `https://chat.whatsapp.com/${code}`
      if (code && text.includes(linkThisGroup)) return !0
    } catch (e) {
      // no hacemos nada, seguimos (no debe tirar todo el handler)
    }

    // Borrar mensaje (si el bot es admin)
    if (isBotAdmin) {
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          id: m.key.id,
          fromMe: false,
          participant: m.key.participant || m.participant
        }
      })
    }

    // Asegurar estructura en la DB y sumar advertencia
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
    const user = global.db.data.users[m.sender]
    user.warnLinks = user.warnLinks || {}
    user.warnLinks[m.chat] = (user.warnLinks[m.chat] || 0) + 1

    // Avisar advertencia
    await conn.sendMessage(m.chat, {
      text: `*☁️ @${m.sender.split('@')[0]} se detectó un enlace prohibido.*\nAdvertencia ${user.warnLinks[m.chat]}/3`,
      mentions: [m.sender]
    })

    // Si llega a 3 advertencias, expulsar
    if (user.warnLinks[m.chat] >= 3) {
      if (!isBotAdmin) {
        await conn.reply(m.chat, `*⚠️ No soy admin, no puedo expulsar intrusos*`, m)
        return !0
      }
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      delete user.warnLinks[m.chat] // Limpiar advertencias
    }

    return !0
  } catch (err) {
    console.error('antilink before error:', err)
    return !0
  }
}