/*let handler = m => m

handler.all = async function (m) {
  let chat = global.db.data.chats[m.chat] || {}
  if (!chat.antiTraba) return
  if (!m.isGroup) return
  if (m.key.fromMe) return // ⬅️ Ignorar los mensajes del bot

  try {
    // Detectar si el texto supera los 1000 caracteres
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

export default handler*/

let handler = m => m

handler.all = async function (m, { isBotAdmin }) {
  let chat = global.db.data.chats[m.chat] || {}
  if (!chat.antiTraba) return
  if (!m.isGroup) return
  if (m.key.fromMe) return // ⬅️ Ignorar mensajes del bot
  if (!isBotAdmin) return // ⬅️ Solo funciona si el bot es admin

  try {
    // Detectar mensajes largos (trabas)
    if (m.text && m.text.length > 1000) {
      // Inicializar contenedor de strikes por grupo
      if (!chat.trabaWarns) chat.trabaWarns = {}
      if (!chat.trabaWarns[m.sender]) chat.trabaWarns[m.sender] = 0

      // Borrar el mensaje
      await this.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant || m.sender
        }
      })

      // Sumar strike
      chat.trabaWarns[m.sender] += 1
      global.db.data.chats[m.chat] = chat

      // Notificar al grupo
      await this.sendMessage(m.chat, {
        text: `⚠️ *@${m.sender.split('@')[0]}* ha enviado un mensaje muy largo (traba).  
> Strike: *${chat.trabaWarns[m.sender]}/3*`,
        mentions: [m.sender]
      })

      // Expulsar si llegó a 3 strikes
      if (chat.trabaWarns[m.sender] >= 3) {
        await this.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        chat.trabaWarns[m.sender] = 0 // Reiniciar strikes después de expulsión
      }
    }
  } catch (e) {
    console.error('Error anti-traba:', e)
  }
}

export default handler