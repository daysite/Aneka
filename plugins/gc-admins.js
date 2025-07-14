const handler = async (m, {conn, participants, groupMetadata, args}) => {
  const pp = await conn.profilePictureUrl(m.chat, 'image').catch((_) => null) || './src/catalogo.jpg';
  const groupAdmins = participants.filter((p) => p.admin);
  const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');
  const owner = groupMetadata.owner || groupAdmins.find((p) => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net';
  const pesan = args.join` `;
  const oi = `${pesan}`;
  const text = `*${xgc} \`Invocando Admins\`*
  
${listAdmin}

𖡻፞ ᰷ ⃪֪⃕🍄 ᮫ׁ֪⃟Mensaje: ${oi}

> ✿ Este comando solo puede ser ejecutado si hay algún problema en el grupo o con el bot.`.trim();
  conn.sendFile(m.chat, pp, 'error.jpg', text, m, false, {mentions: [...groupAdmins.map((v) => v.id), owner]});
};
handler.help = ['admins'];
handler.tags = ['gc'];
handler.customPrefix = /a|@|./i;
handler.command = /^(admins|@admins|dmins)$/i;
handler.group = true;
export default handler;