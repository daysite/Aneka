const handler = async (m, {conn, usedPrefix, text}) => {

  if (isNaN(text) && !text.match(/@/g)) {

  } else if (isNaN(text)) {
    var number = text.split`@`[1];
  } else if (!isNaN(text)) {
    var number = text;
  }

  if (!text && !m.quoted) return conn.reply(m.chat, `${xgc} Menciona algún participante`, m);
  if (number.length > 13 || (number.length < 11 && number.length > 0)) return conn.reply(m.chat, '🍭 El usuario ingresado es incorrecto.', m);

  try {
    if (text) {
      var user = number + '@s.whatsapp.net';
    } else if (m.quoted.sender) {
      var user = m.quoted.sender;
    } else if (m.mentionedJid) {
      var user = number + '@s.whatsapp.net';
    }
  } catch (e) {
  } finally {
    conn.groupParticipantsUpdate(m.chat, [user], 'promote');
    conn.reply(m.chat, `🍟 El usuario fue promovido a administrador`, m);
  }
};
handler.help = ['promote'];
handler.tags = ['gc'];
handler.command = /^(promote|promover|daradmin|darpoder|darpija|darteta|dartt|dartta)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
export default handler;
