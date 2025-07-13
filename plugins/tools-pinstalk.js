
import axios from 'axios';

let handler = async (m, { text, conn, usedPrefix, command, args }) => {
  if (!text) return m.reply(`*${xtools} Por favor, ingresa un usuario de pinterest para stalkear*\n> *\`Ejemplo:\`* ${usedPrefix + command} pahlawangitarsibocchi`);

  try {
    let { data } = await axios.get(`https://www.abella.icu/pinstalk?username=${encodeURIComponent(text)}`);
    if (!data.success) return m.reply('No se pudo obtener los datos del usuario.');

    let res = data.result;
    let caption = `\`\`\`乂 STALKER - TIKTOK\`\`\`\n\n` +
      `• *ID:* ${res.id}\n` +
      `• *Usuario:* ${res.username}\n` +
      `• *Nombre:* ${res.full_name}\n` +
      `• *Bio:* ${res.bio || '-'}\n` +
      `• *Web:* ${res.website || '-'}\n` +
      `• *País:* ${res.country || '-'}\n` +
      `• *Verificado:* ${res.is_verified ? 'Si' : 'No'}\n` +
      `• *Total Pin/s:* ${res.stats?.pins || 0}\n` +
      `• *Seguidores:* ${res.stats?.followers || 0}\n` +
      `• *Siguiendo:* ${res.stats?.following || 0}\n` +
      `• *Boards:* ${res.stats?.boards || 0}\n` +
      `• *Creado:* ${res.created_at || '-'}\n\n` +
      `• *Link Perfil:* ${res.profile_url}`;

    await conn.sendMessage(m.chat, { image: { url: res.image.original }, caption }, { quoted: m });
  } catch (e) {
    m.reply('*✖️ No se encontró el usuario o la api falló en el proceso*');
  }
};

handler.help = ['pinstalk'];
handler.command = ['pinstalk', 'stalkpin'];
handler.tags = ['tools'];

export default handler;
