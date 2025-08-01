import fetch from "node-fetch";
import crypto from "crypto";
import { fileTypeFromBuffer } from "file-type";
import { Blob, FormData } from "formdata-node";

let handler = async (m, { conn }) => {
  const q = m.quoted || m;
  const mime = (q.msg || q).mimetype || '';
  if (!mime) return conn.reply(m.chat, `*${xtools} Por favor, responde a una imagen, video o documento.*`, m);

  await m.react('🌤️');

  try {
    const media = await q.download();
    if (!media || !media.length) throw new Error('No se pudo descargar el archivo');

    const { url, name } = await uploadToCDN(media);

    const caption = [
      '*ゲ◜៹  Tools - Sunflare  ៹◞ゲ*',
      '',
      `*» Enlace* : ${url}`,
      `*» Nombre* : ${name}`,
      `*» Tamaño* : ${formatBytes(media.length)}`,
      `> ${dev}`
    ].join('\n');

    await conn.sendFile(m.chat, media, name, caption, m, fkontak);
    await m.react(done);

  } catch (e) {
    await m.react(error);
    m.reply(`* ✖️ Error:*\n${e.message}`);
  }
};

handler.help = ['tourl'];
handler.tags = ['tools'];
handler.command = ['sunflare'];

export default handler;

// Utilidades
function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${units[i]}`;
}

async function uploadToCDN(buffer) {
  const type = await fileTypeFromBuffer(buffer) || { ext: 'bin', mime: 'application/octet-stream' };
  const randomName = `${crypto.randomBytes(5).toString('hex')}.${type.ext}`;
  const folder = type.mime.startsWith('image/') ? 'images' :
                 type.mime.startsWith('video/') ? 'videos' : 'files';

  const blob = new Blob([buffer], { type: type.mime });
  const base64Content = Buffer.from(await blob.arrayBuffer()).toString('base64');

  const response = await fetch('https://cdn-sunflareteam.vercel.app/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      folder,
      filename: randomName,
      base64Content
    })
  });

  const result = await response.json();
  if (!response.ok || !result?.url) throw new Error(result?.error || 'Fallo en la subida');

  return { url: result.url, name: randomName };
}