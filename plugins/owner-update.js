/*import { execSync } from 'child_process'
let handler = async (m, { conn, text }) => {
await m.react('🚀')
if (conn.user.jid == conn.user.jid) {
let stdout = execSync('git pull' + (m.fromMe && text ? ' ' + text : ''))
await conn.reply(m.chat, stdout.toString(), m)
await m.react('☁️')
}}
handler.help = ['update']
handler.tags = ['owner']
handler.command = ['update', 'actualizar', 'fix', 'fixed'] 
handler.rowner = true

export default handler*/

import { execSync } from 'child_process'

let handler = async (m, { conn, text }) => {
  await m.react('🚀')

  try {
    let stdout = execSync('git pull' + (m.fromMe && text ? ' ' + text : '')).toString().trim()
    let mensaje = stdout.includes('Already up to date') 
      ? '🍟 Aún no hay actualizaciones pendientes.' 
      : '🍭 Se actualizó exitosamente el sistema\n\n' + stdout

    await conn.reply(m.chat, mensaje, m)
    await m.react('✅')
  } catch (err) {
    await conn.reply(m.chat, `❌ Error al actualizar:\n${err.message}`, m)
  }
}

handler.help = ['update']
handler.tags = ['owner']
handler.command = ['update', 'actualizar', 'fix', 'fixed'] 
handler.rowner = true

export default handler
