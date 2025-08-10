let autorechazar = m => m

autorechazar.before = async function (m, { conn, isBotAdmin }) {
  if (!m.isGroup) return !1
  let chat = global.db.data.chats[m.chat] || {}

  // Solo funciona si está activado y el bot es admin
  if (!chat.autorechazar || !isBotAdmin) return !0

  // Prefijo permitido para NO rechazar (1 o 5)
  const prefix = /^(1|5)\d+$/

  try {
    if (m.messageStubType === 172 && m.messageStubParameters?.length) {
      const [jid] = m.messageStubParameters
      const num = jid.split('@')[0]

      // Si NO empieza con 1 o 5 => rechazar
      if (!prefix.test(num)) {
        await conn.groupRequestParticipantsUpdate(m.chat, [jid], 'reject').catch(() => {})
      }
    }
  } catch (e) {
    console.error('Error autorechazar:', e)
  }
}

export default handler