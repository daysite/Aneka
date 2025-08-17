

let handler = m => m

handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
  if (!m.isGroup) return !1
  let chat = global.db.data.chats[m.chat] || {}

  if (chat.autoaceptar && !isAdmin) {
    if (!isBotAdmin) return !0

    const latinPrefix = '5' // Aceptar solo números que empiezan con 5
    const participants = await conn.groupRequestParticipantsList(m.chat).catch(_ => [])

    const filtered = participants.filter(p =>
      p.jid.includes('@s.whatsapp.net') && p.jid.split('@')[0].startsWith(latinPrefix)
    )

    for (const participant of filtered) {
      await conn.groupRequestParticipantsUpdate(m.chat, [participant.jid], 'approve')
    }

    if (m.messageStubType === 172 && m.messageStubParameters) {
      const [jid] = m.messageStubParameters
      if (jid.includes('@s.whatsapp.net') && jid.split('@')[0].startsWith(latinPrefix)) {
        await conn.groupRequestParticipantsUpdate(m.chat, [jid], 'approve')
      }
    }
  }
}

export default handler
/*

let handler = m => m

handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
  if (!m.isGroup) return !1
  let chat = global.db.data.chats[m.chat] || {}
  
  // Si no está activado o el que habla es admin, no hacer nada
  if (!chat.autoaceptar || isAdmin || !isBotAdmin) return !0

  // Validar solo números que empiecen con 5
  const prefix = /^5|1\d+$/

  try {
    // Solo actuamos cuando es una solicitud de ingreso
    if (m.messageStubType === 172 && m.messageStubParameters?.length) {
      const [jid] = m.messageStubParameters
      if (prefix.test(jid.split('@')[0])) {
        await conn.groupRequestParticipantsUpdate(m.chat, [jid], 'approve').catch(() => {})
      }
    }
  } catch (e) {
    console.error('Error autoaceptar:', e)
  }
}

export default handler*/