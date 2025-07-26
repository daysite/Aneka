const handler = async (m, { conn }) => {
const name = conn.getName(m.sender)
const Daniel = `Me voy a la cocina mejor\n> att: mari`.trim()

try {
await conn.sendMessage(m.chat, { text: Daniel, ai: true })
} catch (err) {
console.error('Error en Daniel 🗣️', err)
await m.reply(`${err.message}`)}
}
//Daniel is Gey 🗣️
handler.command = ['x']
export default handler