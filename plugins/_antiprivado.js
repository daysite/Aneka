/*export async function before(m, {conn, isAdmin, isBotAdmin, isOwner, isRowner, isMods}) {
    if (m.isBaileys && m.fromMe) return !0;
    if (m.isGroup) return !1;
    if (!m.message) return !0;
    if (m.text.includes('PIEDRA') || m.text.includes('PAPEL') || m.text.includes('TIJERA') || m.text.includes('serbot') || m.text.includes('jadibot')) return !0;
    const chat = global.db.data.chats[m.chat];
    const bot = global.db.data.settings[this.user.jid] || {};
    if (bot.antiPrivate && !isOwner && !isROwner && !isMods) {
      await m.reply(`*[ ℹ️ ] Hola, @${m.sender.split`@`[0]} Está prohibido escribir al chat privado del bot, por lo cual serás blockeado.`, false, {mentions: [m.sender]});
      await this.updateBlockStatus(m.chat, 'block');
    }
    return !1;
  }
*/
export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) {

if (m.isBaileys && m.fromMe) return !0
if (m.isGroup) return !1
if (!m.message) return !0
if (m.text.includes('PIEDRA') || m.text.includes('PAPEL') || m.text.includes('TIJERA') || m.text.includes('grupos') || m.text.includes('bots') || m.text.includes('stop') || m.text.includes('delsession') || m.text.includes('code') || m.text.includes('delsesion') || m.text.includes('jadibot')) return !0

let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
let chat = global.db.data.chats[m.chat]
let user = global.db.data.users[m.sender]
let bot = global.db.data.settings[this.user.jid] || {}

if (bot.antiPrivate && !isOwner && !isROwner) {
//await m.reply(`👤 *Hola* @${who.replace(/@.+/, '')}, no puede usar este bot en chat privado*`, false, { mentions: [who] })
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'banchat')

return !1
}}