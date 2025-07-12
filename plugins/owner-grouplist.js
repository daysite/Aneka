const handler = async (m, { conn }) => {
  try {
    const groups = Object.entries(conn.chats).filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats);
    const totalGroups = groups.length;
    let txt = `*Lista de grupos del Bot* 🤖\n\n*— Total de grupos:* ${totalGroups}\n\n`;

    for (let i = 0; i < groups.length; i++) {
      const [jid] = groups[i];
      const name = await conn.getName(jid);
      let metadata = conn.chats[jid]?.metadata;
      if (!metadata) {
        metadata = await conn.groupMetadata(jid).catch(() => null);
      }
      if (!metadata) continue;

      const participants = metadata.participants || [];
      const bot = participants.find(u => conn.decodeJid(u.id) === conn.user.jid) || {};
      const isBotAdmin = bot.admin !== undefined;
      const isParticipant = participants.some(u => conn.decodeJid(u.id) === conn.user.jid);
      const participantStatus = isParticipant ? 'Participante' : 'Ex participante';
      const totalParticipants = participants.length;

      let link = '---';
      if (isBotAdmin) {
        try {
          const code = await conn.groupInviteCode(jid);
          link = `https://chat.whatsapp.com/${code}`;
        } catch {
          link = 'Error al obtener el link';
        }
      } else {
        link = 'No soy admin';
      }

      txt += `*Grupo ${i + 1}*\n`;
      txt += `• Nombre: ${name}\n`;
      txt += `• ID: ${jid}\n`;
      txt += `• Admin: ${isBotAdmin ? 'Sí' : 'No'}\n`;
      txt += `• Estado: ${participantStatus}\n`;
      txt += `• Participantes: ${totalParticipants}\n`;
      txt += `• Link: ${link}\n\n`;
    }

    m.reply(txt.trim());
  } catch (e) {
    m.reply('*Ocurrió un error al obtener la lista de grupos.*');
    console.error(e);
  }
};

handler.help = ['grouplist'];
handler.tags = ['owner'];
handler.command = /^(groups|grouplist|listadegrupo|gruposlista|listagrupos|listgroup)$/i;
handler.rowner = true;
handler.private = true;

export default handler;
