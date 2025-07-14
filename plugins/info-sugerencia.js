//Adaptado & Mejorado por Criss Escobar 

let handler = async (m, { conn, text }) => {
    const suittag = '51927238856';
    const user = m.pushName || 'Usuario';

    if (!text) {
        return conn.reply(m.chat, `*${xinfo} ¡Hola! ${user} ¿Qué comando desea sugerir?*`, m);
    }
    if (text.length < 5) {
        return conn.reply(m.chat, '*⚠️ La sugerencia debe tener al menos 5 caracteres.*', m);
    }
    if (text.length > 1000) {
        return conn.reply(m.chat, '*⚠️ El máximo permitido para la sugerencia es de 1000 caracteres.*', m);
    }

    const teks = `*💡 Sugerencia de un nuevo comando de ${user}:*

*📝 Comando sugerido:*
> ${text}`;

    await conn.reply(`${suittag}@s.whatsapp.net`, m.quoted ? teks + m.quoted.text : teks, m, {
        mentions: conn.parseMention(teks),
    });

    m.reply('*✅ ¡Tu sugerencia ha sido enviada al propietario! Gracias por tu aporte.*');
};

handler.help = ['sugerencia'];
handler.tags = ['info'];
handler.command = ['newcommand', 'sug', 'sugerir', 'sugerencia'];

export default handler;