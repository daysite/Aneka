import { igdl } from 'ruhend-scraper';

const handler = async (m, { args, conn }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `🍭 Por favor, ingresa un enlace de Instagram`, m);
  }

  try {
    await m.react('⌛');
    const res = await igdl(args[0]);
    const data = res.data;

    for (let media of data) {
      await conn.sendFile(m.chat, media.url, 'instagram.mp4', `🍟Tu reels fue descargado correctamente`, m);
    await m.react('☑️);
    }
  } catch (e) {
    return conn.reply(m.chat, `🍭 Error`, m);
    await m.react('❎');
  }
};

handler.command = ['instagram', 'ig'];
handler.tags = ['descargas'];
handler.help = ['instagram', 'ig'];
handler.group = true;
handler.register = true;
handler.coin = 2;

export default handler;
