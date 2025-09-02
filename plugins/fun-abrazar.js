let handler = async (m, { conn, usedPrefix, command}) => {
let pp = 'https://files.catbox.moe/kef8rc.mp4'
let pp2 = 'https://files.catbox.moe/oxwumu.mp4'
let who
if (m.isGroup) who = m.mentionedJid[0]
else who = m.chat
if (!who) return conn.reply(m.chat, '🍭 Menciona al usuario que deseas *abrazar*', m)
let name2 = conn.getName(who)
let name = conn.getName(m.sender)

await conn.sendMessage(m.chat, { video: { url: [pp, pp2].getRandom() }, gifPlayback: true, caption: `*${name}*` + ' le esta dando un fuerte abrazo a' + ` *${name2}*` + ' (ﾉ^ヮ^)ﾉ*:・ﾟ✧' }, { quoted: m })
}
handler.help = ['abrazae *<@user>*']
handler.tags = ['fun']
handler.command = ['abrazar', 'abrazo']
export default handler
