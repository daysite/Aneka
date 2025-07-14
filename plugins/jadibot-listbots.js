/*import ws from 'ws'

let handler = async (m, { conn }) => {
   let uniqueUsers = new Map()

   if (!global.conns || !Array.isArray(global.conns)) {
     global.conns = []
   }

   global.conns.forEach((conn) => {
     if (conn.user && conn.ws?.socket?.readyState !== ws.CLOSED) {
       uniqueUsers.set(conn.user.jid, conn)
     }
   })

   let totalUsers = uniqueUsers.size
   let txt = `*☘️ Subs Activos:* *\`${totalUsers || 0}\`*`

   await conn.reply(m.chat, txt, m, rcanal)
}

handler.command = ['totalbots', 'tbots']
handler.help = ['bots']
handler.tags = ['serbot']
export default handler*/

import ws from 'ws'

async function handler(m, { conn: stars, usedPrefix }) {
  let uniqueUsers = new Map()

  for (const conn of global.conns || []) {
    if (!conn || typeof conn !== 'object') continue
    if (!conn.user || !conn.ws || !conn.ws.socket) continue
    if (conn.ws.socket.readyState === ws.CLOSED) continue

    uniqueUsers.set(conn.user.jid, conn)
  }

  const users = [...uniqueUsers.values()]

  const message = users.map((v, index) => {
    const jidNum = v.user.jid.replace(/[^0-9]/g, '')
    return `⪧ *\`${index + 1}.-\`* *SubBot - Shadow Ultra*
ᦷᩘᦷ @${jidNum}
🌴 *Nombre:* ${v.user.name || 'Desconocido'}
🌿 *Link:* https://wa.me/${jidNum}`
  }).join('\n\n')

  global.totalUsers = users.length

  const responseMessage = `
*SHADOW - JADIBOT LIST*
> *Total de Subs:* *\`${totalUsers || 0}\`*

${message || '*No hay Subs activos.*'}`.trim()

  await stars.sendMessage(m.chat, {
    text: responseMessage,
    mentions: stars.parseMention(responseMessage)
  }, { quoted: fkontak })
}

handler.command = ['listjadibot', 'bots', 'subs']
handler.help = ['bots']
handler.tags = ['jadibot']
export default handler