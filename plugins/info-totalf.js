/* 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗦𝗵𝗮𝗱𝗼𝘄'𝘀 𝗖𝗹𝘂𝗯 🌺᭄
𝖢𝗋𝖾𝖺𝖽𝗈 𝗉𝗈𝗋 𝖣𝖾𝗏.𝖢𝗋𝗂𝗌𝗌 🇦🇱
https://whatsapp.com/channel/0029VauTE8AHltY1muYir31n*/

const handler = async (m, { conn }) => {
const taguser = '@' + m.sender.split('@s.whatsapp.net')[0];
  let totalf = Object.values(global.plugins).reduce((total, plugin) => {
    if (plugin.command) {
      if (Array.isArray(plugin.command)) {
        return total + plugin.command.length;
      } else {
        return total + 1;
      }
    }
    return total;
  }, 0);

  conn.sendMessage(m.chat, {
text: `*${xinfo} ¡El poder está en tus manos!*\n*Bienvenido ${taguser}*\n\n*Este bot cuenta con \`${totalf}\` comandos disponibles para ti. ¿Tienes alguna sugerencia para mejorar nuestra experiencia? ¡Usa el comando \`.sugerir\` para saber que idea tienes!*\n\n> © Տһᥲძᨣᥕ Ɓᨣƚ Uᥣ𝗍rᥲ`,
mentions: [m.sender]
}, { quoted: fkontak });
};

handler.help = ['totalf'];
handler.tags = ['info'];
handler.command = ['totalcomandos', 'comandostotales', 'totalf', 'totalfunciones'];
export default handler;