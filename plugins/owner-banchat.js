let handler = async (m) => {

global.db.data.chats[m.chat].isBanned = true
conn.reply(m.chat, `${xowner} chat baneado correctamente.`, m)

}
handler.help = ['banchat']
handler.tags = ['owner']
handler.command = /^banchat|desactivar|banearchat$/i
//handler.admin = true;
handler.rowner = true

export default handler
