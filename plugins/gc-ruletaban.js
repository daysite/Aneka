let handler = async (m, { conn, participants }) => {
  const botId = conn.user.jid;

  const admins = participants.filter(p => p.admin);
  const eligibleUsers = participants.filter(p => !p.admin && p.id !== botId);

  if (eligibleUsers.length === 0) {
    return m.reply('*⚠️ No hay miembros para eliminar.*');
  }

  if (participants.length === admins.length) {
    return m.reply('*⚠️ Solo hay administradores en este grupo.*');
  }

  const randomUser = eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)];
  let tag;

  try {
    tag = await conn.getName(randomUser.id);
  } catch (e) {
    tag = randomUser.id.split('@')[0]; 
  }

  await conn.reply(m.chat, `*🍁 Selección Aleatoria:*\n${tag}\n*Serás Eliminado*`, m);

  try {
    await conn.groupParticipantsUpdate(m.chat, [randomUser.id], 'remove');
    await conn.reply(m.chat, `*🌵 ${tag} fue eliminado con éxito.*`, m);
    m.react('✅');
  } catch (e) {
    await conn.reply(m.chat, `*✖️ No se pudo eliminar a \`${tag}\`.`, m);
    m.react('✖️');
  }
};

handler.help = ['ruletaban'];
handler.tags = ['gc'];
handler.command = /^(kickrandom|ruletaban|rban)$/i;
handler.admin = true;
handler.botAdmin = true;

export default handler;