const handler = async (m, { conn }) => {
const taguser = '@' + m.sender.split('@s.whatsapp.net')[0];

  conn.sendMessage(m.chat, {
text: `🍒 ¡Bienvenido! ${taguser}\n\n¿Quieres dominar WhatsApp con el bot más poderoso? ¡Shadow está aquí!\nPersonaliza tu experiencia de WhatsApp como nunca antes.\n\n*\`PRECIOS DEL BOT\`*\n\n\`\`\`PERMAMENTE\`\`\`\n> *ᴜɴ ɢʀᴜᴘᴏ:*\n- 𝟧 🇵🇪/𝟣𝟨𝟢𝟢 🇦🇷\n> *ᴛʀᴇs ɢʀᴜᴘᴏs:*\n- 𝟣𝟧 🇵🇪/𝟦𝟢𝟢𝟢 🇦🇷\n> *sᴇɪs ɢʀᴜᴘᴏs:*\n- 𝟥𝟢 🇵🇪/𝟪𝟢𝟢𝟢 🇦🇷\n\n\`\`\`MENSUAL\`\`\`\n- 𝟤 🇵🇪/𝟣𝟢𝟢𝟢 🇦🇷\n\n\`\`\`PERSONALIZADO\`\`\`\n- 𝟥𝟧 🇵🇪/𝟣𝟣𝟢𝟢𝟢 🇦🇷\n\n\`\`\`PRUEBA & COMPRA\`\`\`\nhttps://chat.whatsapp.com/Caj518FwPjHLVmGn48GvhW\n\n> © 𝖲𝗁𝖺𝗈ᨣ𝗐 𝖡ᨣƚ 𝖴𝗅𝗍𝗋𝖺`,
mentions: [m.sender]
}, { quoted: fkontak });
};

handler.help = ['preciosbot'];
handler.tags = ['info'];
handler.command = ['precios', 'comprar', 'adquirir', 'preciosbot'];
export default handler;