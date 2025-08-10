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
  if (m.isBaileys && m.fromMe) return !0
  if (m.sender === this.user.jid) return !0 // Ignorar si el mensaje lo envía el bot
  if (!m.isGroup) return !1

  let chat = global.db.data.chats[m.chat]
  let bang = m.key.id
  let delet = m.key.participant
  let taguser = '@' + m.sender.split('@')[0]
  let bot = global.db.data.settings[this.user.jid] || {}
  let user = global.db.data.users[m.sender]

  if (!user.warnLinks) user.warnLinks = {}
  if (!user.warnLinks[m.chat]) user.warnLinks[m.chat] = 0

  const isGroupLink = linkRegex.exec(m.text)

  // Ignorar si es admin
  if (isAdmin && chat.antiLink && isGroupLink) return !0

  // Si antiLink activo y hay link
  if (chat.antiLink && isGroupLink && !isAdmin) {
    // Evitar que borre el enlace del mismo grupo
    const linkThisGroup = `https://chat.whatsapp.com/${await this.groupInviteCode(m.chat)}`
    if (m.text.includes(linkThisGroup)) return !0

    // Borrar mensaje
    if (isBotAdmin) {
      await this.sendMessage(m.chat, {
        delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }
      })
    }

    // Sumar advertencia
    user.warnLinks[m.chat]++

    // Avisar advertencia
    await this.sendMessage(m.chat, {
      text: `*☁️ ${taguser} se detectó un enlace prohibido.*\nAdvertencia ${user.warnLinks[m.chat]}/3`,
      mentions: [m.sender]
    })

    // Si llega a 3 advertencias, expulsar
    if (user.warnLinks[m.chat] >= 3) {
      if (!isBotAdmin) {
        await this.reply(m.chat, `*⚠️ No soy admin, no puedo eliminar intrusos*`, m)
        return !0
      }
      await this.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      delete user.warnLinks[m.chat] // Limpiar advertencias
    }
  }

  return !0
}