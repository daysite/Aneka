import {generateWAMessageFromContent} from '@whiskeysockets/baileys';
import * as fs from 'fs';
const handler = async (m, {conn, text, participants, isOwner, isAdmin}) => {
  try {

const fkontak2 = {
  key: { fromMe: false, participant: '0@s.whatsapp.net' },
  message: {
    conversation: ' 𝖠𝗏𝗂𝗌𝗈 𝖽𝖾𝗅 𝖠𝖽𝗆𝗂𝗇'
  }
}

    const users = participants.map((u) => conn.decodeJid(u.id));
    const q = m.quoted ? m.quoted : m || m.text || m.sender;
    const c = m.quoted ? await m.getQuotedObj() : m.msg || m.text || m.sender;
    const msg = conn.cMod(m.chat, generateWAMessageFromContent(m.chat, {[m.quoted ? q.mtype : 'extendedTextMessage']: m.quoted ? c.message[q.mtype] : {text: '' || c}}, {quoted: fkontak2, userJid: conn.user.id}), text || q.text, conn.user.jid, {mentions: users});
    await conn.relayMessage(m.chat, msg.message, {messageId: msg.key.id});
  } catch {

    const users = participants.map((u) => conn.decodeJid(u.id));
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || '';
    const isMedia = /image|video|sticker|audio/.test(mime);
    const more = String.fromCharCode(8206);
    const masss = more.repeat(850);

    const htextos = `${text ? text : '*¡Hola! 😸*'}\n\n> By Shadow Ultra`;

    //const htextos = `${text ? text : '*Utiliza nuevamente el comando. 😸*'}\n\n> © 𝑺𝒉𝒂𝒅𝒐𝒘 𝑼𝒍𝒕𝒓𝒂 | | ${date}`;
    if ((isMedia && quoted.mtype === 'imageMessage') && htextos) {
      var mediax = await quoted.download?.();
      conn.sendMessage(m.chat, {image: mediax, mentions: users, caption: htextos, mentions: users}, {quoted: fkontak2
});
    } else if ((isMedia && quoted.mtype === 'videoMessage') && htextos) {
      var mediax = await quoted.download?.();
      conn.sendMessage(m.chat, {video: mediax, mentions: users, mimetype: 'video/mp4', caption: htextos}, {quoted: fkontak2});
    } else if ((isMedia && quoted.mtype === 'audioMessage') && htextos) {
      var mediax = await quoted.download?.();
      conn.sendMessage(m.chat, {audio: mediax, mentions: users, mimetype: 'audio/mpeg', fileName: `Hidetag.mp3`}, {quoted: fkontak2});
    } else if ((isMedia && quoted.mtype === 'stickerMessage') && htextos) {
      var mediax = await quoted.download?.();
      conn.sendMessage(m.chat, {sticker: mediax, mentions: users}, {quoted: fkontak2});
    } else {
      await conn.relayMessage(m.chat, {extendedTextMessage: {text: `${masss}\n${htextos}\n`, ...{contextInfo: {mentionedJid: users, externalAdReply: {thumbnail: img, sourceUrl: 'https://chat.whatsapp.com/Caj518FwPjHLVmGn48GvhW'}}}}}, {});
    }
  }
};
handler.help = ['Aviso'];
handler.tags = ['gc'];
handler.command = /^(viso)$/i;
handler.customPrefix = /a|A/i;
handler.group = true;
handler.admin = false;
export default handler;