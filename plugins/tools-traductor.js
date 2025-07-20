import translate from '@vitalets/google-translate-api';
import fetch from 'node-fetch';

const handler = async (m, { args, usedPrefix, command }) => {
  const msg = `*${xtools} Por favor, proporciona el idioma seguido del texto para traducirlo.*\n> *\`Ejemplo:\`* ${usedPrefix + command} es Hello World`;

  if (!args || !args[0]) return m.reply(msg);

  let lang = args[0];
  let text = args.slice(1).join(' ');
  const defaultLang = 'es';

  const isValidLang = /^[a-z]{2}$/.test(lang);
  if (!isValidLang) {
    lang = defaultLang;
    text = args.join(' ');
  }

  if (!text && m.quoted?.text) text = m.quoted.text;
  if (!text) return m.reply('*⚠️ Debes proporcionar un texto para traducir.*');

  try {
    await m.react('⌛');

    const result = await translate(text, { to: lang, autoCorrect: true });
    await m.reply(`*☕ Traducción:* ${result.text}`);

    await m.react('✅');

  } catch (error) {
    try {
      const res = await fetch(`https://delirius-apiofc.vercel.app/tools/translate?text=${encodeURIComponent(text)}&language=${lang}`);
      if (!res.ok) throw new Error('Error en la API secundaria');

      const json = await res.json();
      if (!json.status || !json.data) throw new Error('Respuesta inválida de la API secundaria');

      await m.reply(`*Traducción:* ${json.data}`);
      await m.react('✅');

    } catch (err) {
      await m.reply('*✖️ Ocurrió un error al traducir.*');
      await m.react('✖️');
      console.error(err);
    }
  }
};

handler.help = ['traductor'];
handler.tags = ['tools'];
handler.command = /^(traductor|traducir|googletrad|tr|trad)$/i;

export default handler;