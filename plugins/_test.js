const handler = async (m, { conn }) => {
const name = conn.getName(m.sender)
const tag = '@' + m.sender.split('@')[0]
const Daniel = `hola ${tag}, Creador: @${creadorN} xd xd`.trim()

try {
  await conn.sendMessage(m.chat, {
    text: Daniel,
    mentions: [m.sender, creadorM],
  }, { quoted: fkontak })
} catch (err) {
console.error('Error en Daniel 🗣️', err)
await m.reply(`${err.message}`)}
}
//Daniel is Gey 🗣️
handler.command = ['x']
export default handler