
const handler = async (m, { conn }) => {
    const user = global.db.data.users[m.sender];
        conn.sendMessage(m.chat, {text: `${xowner} *@${m.sender.split('@')[0]} Ahora tienes recursos ilimitados*`, mentions: [m.sender]}, {quoted: fkontak});
      global.db.data.users[m.sender].money = Infinity;
    global.db.data.users[m.sender].diamantes = Infinity;
  global.db.data.users[m.sender].level = Infinity;
 global.db.data.users[m.sender].exp = Infinity;
};
handler.help = ['chetar'];
handler.tags = ['owner'];
handler.command = /^(ilimitado|infiniy|chetar|cheat)$/i;
handler.mods = true;
handler.fail = null;
export default handler;