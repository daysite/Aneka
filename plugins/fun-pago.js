const handler = async (m, { conn }) => {
  const taguser = '@' + m.sender.split('@s.whatsapp.net')[0];

  conn.sendMessage(m.chat, {
    text: `💰 *MÉTODO DE PAGO PERUANO* 💰\n\n👤 *Nombre*: Carlos chonlon\n💳 *Número*: 994143761\n🏦 *Banco*: Yape\n\n📢 *Importante enviar comprobante después del pago*\n\n${taguser} Una vez realizado el pago, envía el comprobante al administrador para procesar tu solicitud.`,
    mentions: [m.sender]
  }, { quoted: fkontak });
};

handler.help = ['pagos'];
handler.tags = ['info'];
handler.command = ['pagos', 'metodopago', 'payment', 'pagar'];
export default handler;
