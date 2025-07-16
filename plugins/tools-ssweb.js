

import fetch from 'node-fetch'
let handler = async (m, { conn, command, args }) => {
if (!args[0]) return conn.reply(m.chat, *${xtools} Por favor, ingresa el Link de una página.*, m)
try {
await m.react('⌛')

let ss = await (await fetch(https://image.thum.io/get/fullpage/${args[0]})).buffer()
conn.sendFile(m.chat, ss, 'error.png', args[0], fkontak)
await m.react('✅')
} catch {
return conn.reply(m.chat, '⚠️ Ocurrió un error.', m)
await m.react(error)}}

handler.help = ['ssweb']
handler.tags = ['tools']
handler.command = ['ssweb', 'ss', 'ssw']
export default handler

