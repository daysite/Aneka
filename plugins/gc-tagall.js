const handler = async (m, {isOwner, isAdmin, conn, text, participants, args, command, usedPrefix}) => {

  if (usedPrefix == 'a' || usedPrefix == 'A') return;

  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    throw false;
  }
  const pesan = args.join` `;
const oi = `*\`AVISO:\`* ${pesan}`;
  let teks = `𝘽𝙪𝙚𝙣𝙤𝙨 𝙙𝙞𝙖𝙨 𝙚𝙨𝙩𝙧𝙚𝙡𝙡𝙞𝙩𝙖𝙨 𝙡𝙖 𝙩𝙞𝙚𝙧𝙧𝙖 𝙡𝙚𝙨 𝙙𝙞𝙘𝙚 𝙝𝙤𝙡𝙖 <3\n\n> \`𝖨𝗇𝗍𝖾𝗀𝗋𝖺𝗇𝗍𝖾𝗌:\` *${participants.length}*\n\n ${oi}\n\n`;
  for (const mem of participants) {
    teks += `ֶָ֢⋆.˚🏮 @${mem.id.split('@')[0]}\n`;
  }
  teks += `\n> ${club}`;
  conn.sendMessage(m.chat, {text: teks, mentions: participants.map((a) => a.id)} );
};
handler.help = ['todos'];
handler.tags = ['gc'];
handler.command = /^(tagall|t|invocar|marcar|todos|invocación)$/i;
handler.admin = true;
handler.group = true;

export default handler;
