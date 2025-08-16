let handler = m => m

handler.all = async function (m, { isBotAdmin }) {
  let chat = global.db.data.chats[m.chat] || {}
  if (!chat.antiTraba) return
  if (!m.isGroup) return
  if (!isBotAdmin) return

  try {
    // Detectar mensajes muy largos (ejemplo 4000+ chars)
    let longText = (m.text && m.text.length > 4000)
    let tooBig = JSON.stringify(m.message || {}).length > 5000

    if (longText || tooBig) {
      // Borrar mensaje traba con key completo
      await this.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant || m.sender
        }
      })

      await this.sendMessage(m.chat, { text: `⚠️ Mensaje traba eliminado automáticamente.` })
      return
    }

    // Detectar mensaje invisible tipo stub 68
    if (m.messageStubType === 68) {
      await this.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant || m.sender
        }
      })

      await this.sendMessage(m.chat, { text: `⚠️ Mensaje sospechoso eliminado.` })
    }

  } catch (e) {
    console.error('Error anti-traba:', e)
  }
}

export default handler