let handler = m => m

handler.all = async function (m, { conn }) {
  let chat = global.db.data.chats[m.chat] || {}
  if (!chat.antiTraba) return
  if (!m.isGroup) return
  if (m.key.fromMe) return

  try {
    let groupMetadata = await conn.groupMetadata(m.chat)
    let botNumber = conn.user?.jid
    let isBotAdmin = groupMetadata.participants
      .find(p => p.id === botNumber)?.admin

    if (!isBotAdmin) return

    if (m.text && m.text.length > 10) {
      await this.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant || m.sender
        }
      })

      await this.sendMessage(m.chat, { 
        text: `*⚠️ Mensaje demasiado largo eliminado automáticamente.*` 
      })
    }

  } catch (e) {
    console.error('Error anti-traba:', e)
  }
}

export default handler