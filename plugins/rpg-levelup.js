import { canLevelUp, xpRange } from '../lib/levelling.js';
import { levelup } from '../lib/canvas.js';

const MAX_LEVEL = 300;
const handler = async (m, { conn }) => {
  const name = conn.getName(m.sender);
  const usertag = '@' + m.sender.split('@s.whatsapp.net')[0];
  const user = global.db.data.users[m.sender];
  if (!canLevelUp(user.level, user.exp, global.multiplier)) {
    const { min, xp, max } = xpRange(user.level, global.multiplier);
    const message = `
*🏰 Gremio de Aventureros*
*¡Bienvenido!* *${usertag}*

- *Nivel actual:* ${user.level}
- *Rango actual:* ${user.role}
- *Puntos de Exp:* ${user.exp - min}/${xp}

> 𝖯𝖺𝗋𝖺 𝖺𝗌𝖼𝖾𝗇𝖽𝖾𝗋 𝖽𝖾 𝗇𝗂𝗏𝖾𝗅 𝗇𝖾𝗌𝖾𝗌𝗂𝗍𝖺𝗌 𝗈𝖻𝗍𝖾𝗇𝖾𝗋 \`${max - user.exp}\` 𝗉𝗎𝗇𝗍𝗈𝗌 𝖽𝖾 𝖾𝗑𝗉𝖾𝗋𝗂𝖾𝗇𝖼𝗂𝖺 𝗆𝖺𝗌. ¡𝖲𝗂𝗀𝗎𝖾 𝗂𝗇𝗍𝖾𝗋𝖺𝖼𝗍𝗎𝖺𝗇𝖽𝗈 𝖼𝗈𝗇 𝖲𝗁𝖺𝖽𝗈𝗐 𝖴𝗅𝗍𝗋𝖺!`.trim();
    return conn.sendMessage(m.chat, {text: message, mentions: [m.sender]}, {quoted: fkontak});
  }
/*
  const before = user.level * 1;
  while (canLevelUp(user.level, user.exp, global.multiplier)) user.level++;
*/

const before = user.level * 1;
let safetyCounter = 0;
while (canLevelUp(user.level, user.exp, global.multiplier) && safetyCounter < 100) {
  if (user.level >= MAX_LEVEL) break; // Evita que suba más allá del nivel máximo
  user.level++;
  safetyCounter++;
}
/*
while (canLevelUp(user.level, user.exp, global.multiplier) && safetyCounter < 100) {
  user.level++;
  safetyCounter++;
}*/

if (safetyCounter >= 100) console.warn("⚠️ Posible bucle infinito al subir de nivel.");

if (user.level >= MAX_LEVEL) {
  return conn.sendMessage(m.chat, {
    text: `*🏆 Nivel Máximo Alcanzado*
*¡Felicidades!* *${usertag}*

- *Nivel Max:* ${MAX_LEVEL}
- *Experiencia:* ${user.exp}
- *Rango Max:* ${user.role}

> 𝖠𝗅𝖼𝖺𝗇𝗓𝖺𝗌𝗍𝖾 𝖾𝗅 *𝗆𝖺́𝗑𝗂𝗆𝗈 𝗇𝗂𝗏𝖾𝗅* 𝖾𝗇 𝖾𝗅 𝗀𝗋𝖾𝗆𝗂𝗈 𝖽𝖾 𝖺𝗏𝖾𝗇𝗍𝗎𝗋𝖾𝗋𝗈𝗌.`,
    mentions: [m.sender]
  }, { quoted: fkontak });
}

  if (before !== user.level) {
    const levelUpMessage = `*🎉 ¡Felicidades! ${name} Has subido de nivel a ${user.level}*`;
    const levelUpDetails = `*🚀 Nuevo nivel Alcanzado*

- *Nivel anterior:* ${before}
- *Nuevo nivel:* ${user.level}
- *Rango actual:* ${user.role}

> 𝖢𝗈𝗇𝗍𝗂𝗇𝗎́𝖺 𝖾𝗑𝗉𝗅𝗈𝗋𝖺𝗇𝖽𝗈 𝗒 𝗋𝖾𝖺𝗅𝗂𝗓𝖺𝗇𝖽𝗈 𝗆𝗂𝗌𝗂𝗈𝗇𝖾𝗌 𝗉𝖺𝗋𝖺 𝖺𝗅𝖼𝖺𝗇𝗓𝖺𝗋 𝗇𝗎𝖾𝗏𝖺𝗌 𝖺𝗅𝗍𝗎𝗋𝖺𝗌 𝖾𝗇 𝖾𝗅 𝗀𝗋𝖾𝗆𝗂𝗈 𝖽𝖾 𝖺𝗏𝖾𝗇𝗍𝗎𝗋𝖾𝗋𝗈𝗌. ¡𝖲𝗂𝗀𝗎𝖾 𝗂𝗇𝗍𝖾𝗋𝖺𝖼𝗍𝗎𝖺𝗇𝖽𝗈 𝖼𝗈𝗇 𝖾𝗅 𝖻𝗈𝗍!.`.trim();
    try {
      const levelUpImage = await levelup(levelUpMessage, user.level);
      conn.sendFile(m.chat, levelUpImage, 'Menu.jpg', levelUpDetails, m);
    } catch (e) {
      conn.sendMessage(m.chat, {text: levelUpDetails, mentions: [m.sender]}, {quoted: fkontak});
    }
  }
};
handler.help = ['levelup'];
handler.tags = ['xp'];
handler.command = ['nivel', 'lvl', 'levelup', 'level', 'nvl'];
handler.register = true;
handler.group = true;
export default handler;