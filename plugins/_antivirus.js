let handler = m => m

handler.all = async function (m) {
  let chat = global.db.data.chats[m.chat] || {}
  if (!chat.antiTraba) return
  if (!m.isGroup) return
  if (m.key.fromMe) return

  try {
    if (m.text && m.text.length > 1000) {
      await this.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant || m.sender
        }
      })
    }
  } catch (e) {
    console.error('Error anti-traba:', e)
  }
}

export default handler