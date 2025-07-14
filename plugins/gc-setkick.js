let handler = async (m, { conn, text, isROwner, isOwner }) => {

if (text) {
global.db.data.chats[m.chat].sKick = text
conn.reply(m.chat, '*✅ La eliminación del grupo ha sido configurada*', fkontak, m)

} else {
    conn.reply(m.chat, `*${xgc} ¡Escribe el mensaje de eliminación!*\n✎ *Puedes usar:*\n\n- *\`@user\`* (Mención al Usuario)\n- *\`@group\`* (Nombre del Grupo)\n- *\`@desc\`* (Descripción del Grupo)\n\n> 🌿 Los @ son opcionales`, fkontak, m)
}
}
handler.help = ['setremove']
handler.tags = ['gc']
handler.command = ['setkick', 'setremove'] 
handler.botAdmin = true
handler.admin = true
handler.group = true
export default handler