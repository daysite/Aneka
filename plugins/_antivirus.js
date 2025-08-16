let handler = m => m

handler.all = async function (m, { isBotAdmin }) {
  let chat = global.db.data.chats[m.chat] || {}
  if (!chat.antiTraba) return // si no está activado, no hace nada
  if (!m.isGroup) return
  if (!isBotAdmin) return

  try {
    // 🔎 Detectar mensajes traba:
    // 1. Mensajes excesivamente largos
    if ((m.text && m.text.length > 4000) || JSON.stringify(m.message).length > 5000) {
      await this.sendMessage(m.chat, { delete: m.key }) // borrar solo ese mensaje
      await this.sendMessage(m.chat, { text: `⚠️ Mensaje traba detectado y eliminado.` })
      return
    }

    // 2. Mensajes invisibles (stubType 68, como tu ejemplo)
    if (m.messageStubType === 68) {
      await this.sendMessage(m.chat, { delete: m.key })
      await this.sendMessage(m.chat, { text: `⚠️ Mensaje sospechoso eliminado.` })
    }

  } catch (e) {
    console.error(e)
  }
}

export default handler