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
}*/
let linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i

export async function before(m, { isAdmin, isBotAdmin }) {
  if (m.isBaileys && m.fromMe) return !0
  if (!m.isGroup) return !1

  let chat = global.db.data.chats[m.chat]
  let user = global.db.data.users[m.sender]
  let bang = m.key.id
  let delet = m.key.participant
  let taguser = '@' + m.sender.split('@')[0]
  let bot = global.db.data.settings[this.user.jid] || {}

  const isGroupLink = linkRegex.exec(m.text)

  // Ignorar si el que envía es admin
  if (isAdmin && chat.antiLink && isGroupLink) return !0

  // Si antiLink está activo y hay enlace de grupo
  if (chat.antiLink && isGroupLink && !isAdmin) {

    // Si restrict está desactivado
    if (!bot.restrict) {
      await this.reply(m.chat, `*☕ Esta característica está desactivada*`, m)
      return !0
    }

    // Si no es admin el bot
    if (!isBotAdmin) {
      await this.reply(m.chat, `*⚠️ No soy admin, no puedo eliminar intrusos*`, m)
      return !0
    }

    // Evitar que borre el enlace de este mismo grupo
    const linkThisGroup = `https://chat.whatsapp.com/${await this.groupInviteCode(m.chat)}`
    if (m.text.includes(linkThisGroup)) return !0

    // Inicializar advertencias si no existe
    if (!user.warnLinks) user.warnLinks = {}

    if (!user.warnLinks[m.chat]) user.warnLinks[m.chat] = 0
    user.warnLinks[m.chat]++

    // Si llegó a 3 advertencias → expulsar
    if (user.warnLinks[m.chat] >= 3) {
      await this.sendMessage(m.chat, {
        text: `*🚫 ${taguser} has alcanzado las 3 advertencias por enviar enlaces prohibidos. Serás expulsado.*`,
        mentions: [m.sender]
      })

      await this.sendMessage(m.chat, {
        delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }
      })
      await this.groupParticipantsUpdate(m.chat, [m.sender], 'remove')

      user.warnLinks[m.chat] = 0 // Reiniciar advertencias después de expulsar
    } else {
      // Mensaje de advertencia
      await this.sendMessage(m.chat, {
        text: `*⚠️ ${taguser} enviar enlaces de WhatsApp está prohibido aquí.*\nAdvertencia ${user.warnLinks[m.chat]}/3 antes de ser expulsado.`,
        mentions: [m.sender]
      })

      // Borrar el mensaje
      await this.sendMessage(m.chat, {
        delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }
      })
    }
  }

  return !0
}