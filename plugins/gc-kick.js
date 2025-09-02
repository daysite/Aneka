let handler = async (m, { conn, participants, usedPrefix, command, isROwner }) => {
  if (!global.db.data.settings[conn.user.jid].restrict)
{
return m.reply('🍭 El owner tiene restringido está opción');
}
    let kickte = `*${xgc} Menciona algún participante que desea eliminar del grupo.*`

    if (!m.mentionedJid[0] && !m.quoted) return m.reply(kickte, m.chat, { mentions: conn.parseMention(kickte)})

    let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender
    let owr = m.chat.split`-`[0]

    // Verificamos si el usuario a eliminar es el creador del grupo
    let groupMetadata = await conn.groupMetadata(m.chat)
    let owner = groupMetadata.owner

    if (user === owner) {
        return m.reply(`🍭 No puedes eliminar al Creador del Grupo`)
    }

    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
/*
    m.reply(`*ℹ️ El participante fue eliminado.*`)
}*/

m.reply(`🍟 El participante @${user.split('@')[0]} lo desaparecieron.`, m.chat, {
  mentions: [user]
})
}

handler.help = ['kick']
handler.tags = ['gc']
handler.command = ['kick', 'expulsar', 'ban', 'rip', 'sacar', 'remove'] 
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
