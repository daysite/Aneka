import fs from 'fs';

const handler = async (m, { conn, isROwner, usedPrefix, command, text }) => {
  const ar = fs.readdirSync('./plugins').filter(v => v.endsWith('.js'));
  const ar1 = ar.map(v => v.slice(0, -3)); // quita la extensión .js

  if (!text) {
    return conn.reply(m.chat, `*${xowner} Por favor, ingresa el nombre de un plugin existente.*\n\n*Ejemplo:* ${usedPrefix + command} info-totalf\n\n*Plugins disponibles:*\n${ar1.map(v => `  ꕤ ${v}`).join('\n')}`, m);
  }

  if (!ar1.includes(text)) {
    return conn.reply(m.chat, `*☁️ No se encontró ningún plugin llamado \`${text}\`.*\n\n*Lista de plugins existentes:*\n${ar1.map(v => `  ꕤ ${v}`).join('\n')}`, m);
  }

  try {
    const content = await fs.promises.readFile(`./plugins/${text}.js`, 'utf8');
    await conn.sendMessage(m.chat, { text: content }, { quoted: m });
  } catch (err) {
    await conn.reply(m.chat, `⚠️ Ocurrió un error al leer el plugin:\n\n${err.message}`, m);
  }
};

handler.help = ['getplugin']
handler.tags = ['owner']
handler.command = ['getplugin', 'plugin']
handler.rowner = true

export default handler;