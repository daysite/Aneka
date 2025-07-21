const handler = async (m, { conn, args }) => {
const text = 'daniel es gei y nuv'
await conn.reply(m.chat, text, m)

handler.command = ['kickfantasmas']
export defauld handler