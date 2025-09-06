const handler = async (m, { conn }) => {
const taguser = '@' + m.sender.split('@s.whatsapp.net')[0];

  conn.sendMessage(m.chat, {
text: `*🍭 ¡Bienvenidx!* *${taguser}*\n\n¿Quieres dominar WhatsApp con el bot más poderoso? ¡Aneka está aquí!\nPersonaliza tu experiencia de WhatsApp como nunca antes.\n\n*\`PRECIOS DEL BOT\`*\n\n\`\`\`PERMAMENTE\`\`\`\n> *ᴜɴ ɢʀᴜᴘᴏ:*\n- - 🇵🇪/- 🇦🇷\n> *ᴛʀᴇs ɢʀᴜᴘᴏs:*\n- - 🇵🇪/- 🇦🇷\n> *sᴇɪs ɢʀᴜᴘᴏs:*\n- - 🇵🇪/- 🇦🇷\n\n\`\`\`MENSUAL\`\`\`\n- - 🇵🇪/𝟣𝟢𝟢𝟢 🇦🇷\n\n\`\`\`PERSONALIZADO\`\`\`\n- - 🇵🇪/- 🇦🇷\n\n\`\`\`PRUEBA & COMPRA\`\`\`\n${grupo}\n\n> ${club}`,
mentions: [m.sender]
}, { quoted: fkontak });
};

handler.help = ['preciosbot'];
handler.tags = ['info'];
handler.command = ['precios', 'comprarbot', 'adquirir', 'preciosbot'];
export default handler;
