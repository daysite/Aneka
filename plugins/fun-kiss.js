let handler = async (m, { conn, usedPrefix, command}) => {
let pp = 'https://files.catbox.moe/yrjd2v.mp4'
let pp2 = 'https://files.catbox.moe/yrjd2v.mp4'
let who
if (m.isGroup) who = m.mentionedJid[0]
else who = m.chat
if (!who) return conn.reply(m.chat, '🍭 Menciona al usuario con *@user*', m)
let name2 = conn.getName(who)
let name = conn.getName(m.sender)

await conn.sendMessage(m.chat, { video: { url: [pp, pp2].getRandom() }, gifPlayback: true, caption: `*${name}*` + ' le esta dando un beso a' + ` *${name2}*` + ' (ﾉ^ヮ^)ﾉ*:・ﾟ✧' }, { quoted: m })
}
handler.help = ['kiss *<@user>*']
handler.tags = ['fun']
handler.command = ['kiss', 'kiss']
export default handler
