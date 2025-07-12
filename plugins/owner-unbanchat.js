let handler = async (m, { conn }) => {
if (!(m.chat in global.db.data.chats)) return conn.reply(m.chat, '*⚠️ Este chat no está registrado*', m)
let chat = global.db.data.chats[m.chat]
if (!chat.isBanned) return conn.reply(m.chat, '*🍚 Este chat no esta baneado *', m)
chat.isBanned = false
await conn.reply(m.chat, `*${xowner} Shadow Ultra se activó para este chat.*`, m)
}
handler.help = ['unbanchat'];
handler.tags = ['owner'];
handler.command = ['unbanchat','desbanearchat','desbanchat', 'activar']
//handler.admin = true;
handler.rowner = true
handler.group = true

export default handler