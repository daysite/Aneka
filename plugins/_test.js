import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`*🚨 Ingresa un término de búsqueda*\n\n*Ejemplo:* ${usedPrefix + command} castillo`);
  }

  const query = encodeURIComponent(args.join(' '));
  const url = `https://delirius-apiofc.vercel.app/tools/elcomercio?query=${query}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw '❌ Error al buscar resultados.';

    const json = await res.json();
    if (!json.status || !json.data?.length) {
      return m.reply(`❌ No se encontraron resultados para: *${args.join(' ')}*`);
    }

    const resultados = json.data.slice(0, 10); // máx. 10 resultados

    let txt = `*📰 Resultados para:* _${args.join(' ')}_\n\n`;
    for (let i = 0; i < resultados.length; i++) {
      const { title, publish, url } = resultados[i];
      txt += `*${i + 1}.* ${title}\n🗓️ ${publish}\n🔗 ${url}\n\n`;
    }

    await m.reply(txt.trim());
  } catch (e) {
    console.error(e);
    m.reply(`⚠️ Ocurrió un error al buscar noticias.\n${e}`);
  }
};

handler.help = ['elcomercio <texto>'];
handler.tags = ['internet'];
handler.command = ['elcomercio', 'comercio', 'noticia', 'news'];
handler.register = true;

export default handler;