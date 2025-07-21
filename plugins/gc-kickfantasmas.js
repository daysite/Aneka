/*const handler = async (m, { conn, args }) => {
const text = 'daniel es gei y nuv'
await conn.reply(m.chat, text, m)

handler.command = ['kickfantasmas']

export default handler*/

const handler = async (m, { conn, args }) => {
  try {
    const text = 'daniel es...'; // Ajusta el texto según sea necesario
    await conn.reply(m.chat, text, m);
  } catch (error) {
    console.error(error); // Maneja el error según sea necesario
  }
};

handler.command = ['kickfantasmas'];
export default handler;