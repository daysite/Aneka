import translate from '@vitalets/google-translate-api';
import fetch from 'node-fetch';

const handler = async (m, { args, usedPrefix, command }) => {
  const msg = `*${emojis} Proporciona el idioma seguido el texto para traducirlo.*\n*💡 Ejemplo:* ${usedPrefix + command} es Hello`;

  if (!args || !args[0]) return m.reply(msg);

  let lang = args[0];
  let text = args.slice(1).join(' ');
  const defaultLang = 'es';

  // Validar si el primer argumento es un código de idioma válido
  const isValidLang = /^[a-z]{2}$/.test(lang);
  if (!isValidLang) {
    lang = defaultLang;
    text = args.join(' ');
  }

  // Usar texto citado si no se proporcionó en los argumentos
  if (!text && m.quoted?.text) text = m.quoted.text;
  if (!text) return m.reply('*⚠️ Debes proporcionar un texto para traducir.*');

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reacción de espera

    // Intentar traducción con la API principal
    const result = await translate(text, { to: lang, autoCorrect: true });
    await m.reply(`*Traducción:*\n${result.text}`);

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (error) {
    try {
      // Intentar traducción con API secundaria si la primera falla
      const res = await fetch(`https://api.lolhuman.xyz/api/translate/auto/${lang}?apikey=${lolkeysapi}&text=${encodeURIComponent(text)}`);
      if (!res.ok) throw new Error('Error en la API secundaria');

      const json = await res.json();
      if (!json.result || !json.result.translated) throw new Error('Respuesta inválida de la API secundaria');

      await m.reply(`*Traducción:* ${json.result.translated}`);
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }); // Reacción de éxito
    } catch (err) {
      await m.reply('*❌ Ocurrió un error al traducir.*');
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }); // Reacción de fallo
      console.error(err); // Para depuración
    }
  }
};

handler.help = ['traductor'];
handler.tag = ['tools'];
handler.command = /^(traductor|traducir|googletrad)$/i;

export default handler;