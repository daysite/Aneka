/* 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗦𝗵𝗮𝗱𝗼𝘄'𝘀 𝗖𝗹𝘂𝗯 🌺᭄
𝖢𝗋𝖾𝖺𝖽𝗈 𝗉𝗈𝗋 𝖣𝖾𝗏.𝖢𝗋𝗂𝗌𝗌 🇦🇱
https://whatsapp.com/channel/0029VauTE8AHltY1muYir31n*/


let handler = async (m, { conn, args }) => {
    let who;

    if (args.length > 0) {
        let input = args.join('').replace(/\D/g, '');
        if (input.length < 8) return m.reply('*✖️ Número inválido. Asegúrate de ingresar un número completo.*');

        let exists = await conn.onWhatsApp(input + '@s.whatsapp.net');
        if (!exists || !exists[0]?.exists) {
            return m.reply(`✖️ *El número +${input} no está registrado en WhatsApp.*`);
        }

        who = exists[0].jid;
    } else if (m.quoted) {
        who = m.quoted.sender;
    } else if (m.mentionedJid?.[0]) {
        who = m.mentionedJid[0];
    } else {
        return m.reply(`*${xsticker} Debes responder a un mensaje, etiquetar a un usuario o ingresar un número válido.*`);
    }

    let name;
    try {
        name = await conn.getName(who);
    } catch {
        name = who.split('@')[0];
    }

    try {
        let pp = await conn.profilePictureUrl(who, 'image');
        await conn.sendFile(m.chat, pp, 'profile.jpg', `🖼️ *Foto de perfil de \`${name}\`*`, m);
    } catch (e) {
        await m.reply(`⚠️ *El usuario \`${name}\` no tiene foto de perfil o no se pudo obtener.*`);
    }
};

handler.help = ['pfp'];
handler.tags = ['tools'];
handler.command = ['pfp'];

export default handler;