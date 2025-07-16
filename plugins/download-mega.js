import { File } from "megajs";
import path from "path";

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

let handler = async (m, { conn, args, usedPrefix, text, command }) => {
  try {
    if (!text) return conn.reply(m.chat,`*${xdownload} Por favor, ingresa un enlace de Mega*`, null, { quoted: m });
    m.react('⏳');
    const file = File.fromURL(text);
    await file.loadAttributes();

    if (file.size >= 300000000) return m.reply('Error: El archivo es demasiado pesado (Peso máximo: 300MB ( Premium: 800MB )');

    const caption = `\`\`\`◜Mega - Download◞\`\`\`\n\n*🌴 \`File:\`* ${file.name}\n*⚖️ \`Size:\`* ${formatBytes(file.size)}\n\n> ${dev}`;
    const data = await file.downloadBuffer();
    const fileExtension = path.extname(file.name).toLowerCase();
    const mimeTypes = {
      ".mp4": "video/mp4",
      ".pdf": "application/pdf",
      ".zip": "application/zip",
      ".rar": "application/x-rar-compressed",
      ".7z": "application/x-7z-compressed",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
    };
    let mimetype = mimeTypes[fileExtension] || "application/octet-stream";
    await conn.sendFile(m.chat, data, file.name, caption, m, null, { mimetype, asDocument: true });
    m.react('✅');
  } catch (error) {
    m.react('❌');
    return m.reply(`Error: ${error.message}`);
  }
}

handler.help = ["mega"];
handler.tags = ["download"];
handler.command = /^(mega)$/i;
handler.register = true;
handler.diamantes = 3;

export default handler;
