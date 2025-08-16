
let linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i

export async function before(m, { isAdmin, isBotAdmin }) {
  try {
    const conn = this.conn || this

    if (m?.key?.fromMe) return !0
    if (m?.isBaileys) return !0

    const myJidBase = (this.user?.jid || (conn.user && conn.user.jid) || '').split(':')[0]
    if (m?.sender && m.sender.split(':')[0] === myJidBase) return !0

    if (!m.isGroup) return !1

    const chat = global.db?.data?.chats?.[m.chat] || {}
    if (!chat.antiLink) return !0

    // Shadow Ultra - MD
    const text = (m.text || m.message?.conversation || m.message?.extendedTextMessage?.text || '').toString()
    if (!text) return !0

    const isGroupLink = linkRegex.test(text)
    if (!isGroupLink) return !0

    if (isAdmin) return !0

    try {
      const code = (conn.groupInviteCode ? await conn.groupInviteCode(m.chat) : (this.groupInviteCode ? await this.groupInviteCode(m.chat) : ''))
      const linkThisGroup = `https://chat.whatsapp.com/${code}`
      if (code && text.includes(linkThisGroup)) return !0
    } catch (e) {
    }

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

    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
    const user = global.db.data.users[m.sender]
    user.warnLinks = user.warnLinks || {}
    user.warnLinks[m.chat] = (user.warnLinks[m.chat] || 0) + 1

 
    await conn.sendMessage(m.chat, {
      text: `*☁️ @${m.sender.split('@')[0]} se detectó un enlace prohibido.*\n*Advertencia:* \`${user.warnLinks[m.chat]}/3\``,
      mentions: [m.sender]
    })

    if (user.warnLinks[m.chat] >= 3) {
      if (!isBotAdmin) {
        await conn.reply(m.chat, `*⚠️ No soy admin, no puedo expulsar intrusos*`, m)
        return !0
      }
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      delete user.warnLinks[m.chat]
    }

    return !0
  } catch (err) {
    console.error('antilink before error:', err)
    return !0
  }
}