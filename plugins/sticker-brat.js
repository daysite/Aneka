/*import axios from 'axios';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { tmpdir } from 'os';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchSticker = async (text, attempt = 1) => {
    try {
        const response = await axios.get('https://vapis.my.id/api/bratv1', {
            params: { q: text },
            responseType: 'arraybuffer',
        });
        return response.data;
    } catch (error) {
        if (error.response?.status === 429 && attempt <= 3) {
            const retryAfter = error.response.headers['retry-after'] || 5;
            await delay(retryAfter * 1000);
            return fetchSticker(text, attempt + 1);
        }
        throw error;
    }
};

const handler = async (m, { text, conn }) => {
    if (!text) {
        return conn.reply(m.chat, `*${xsticker} Por favor, ingresa un texto para realizar tu sticker.*`, m, rcanal);
    }

    try {
        const buffer = await fetchSticker(text);
        const outputFilePath = path.join(tmpdir(), `sticker-${Date.now()}.webp`);
        await sharp(buffer)
            .resize(512, 512, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 },
            })
            .webp({ quality: 80 })
            .toFile(outputFilePath);

        await conn.sendMessage(m.chat, {
            sticker: { url: outputFilePath },
        }, { quoted: fkontak });

        fs.unlinkSync(outputFilePath);
    } catch (error) {
        console.error(error);
        return conn.sendMessage(m.chat, {
            text: '*✖️ Error de la API.*',
        }, { quoted: m });
    }
};

handler.command = ['brat'];
handler.tags = ['sticker'];
handler.help = ['brat'];

export default handler;*/

import fetch from 'node-fetch'
import { Sticker } from 'wa-sticker-formatter'

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`Ejemplo: .${command} Gatitos`)

  try {
    const searchRes = await fetch(`https://zenzxz.dpdns.org/search/stickerlysearch?query=${encodeURIComponent(text)}`)
    const searchJson = await searchRes.json()

    if (!searchJson.status || !Array.isArray(searchJson.data) || searchJson.data.length === 0) {
      return m.reply('No hay stickers aquí')
    }

    const pick = searchJson.data[Math.floor(Math.random() * searchJson.data.length)]

    const detailUrl = `https://zenzxz.dpdns.org/tools/stickerlydetail?url=${encodeURIComponent(pick.url)}`
    const detailRes = await fetch(detailUrl)
    const detailJson = await detailRes.json()

    if (!detailJson.status || !detailJson.data || !Array.isArray(detailJson.data.stickers) || detailJson.data.stickers.length === 0) {
      return m.reply('Error al tomar los stickers')
    }

    const packName = detailJson.data.name
    const authorName = detailJson.data.author?.name || 'unknown'

    m.reply(`encontre ${detailJson.data.stickers.length} stiker/s`)

    let maxSend = 10
    for (let i = 0; i < Math.min(detailJson.data.stickers.length, maxSend); i++) {
      const img = detailJson.data.stickers[i]
      let sticker = new Sticker(img.imageUrl, {
        pack: wm,
        author: '',
        type: 'full',
        categories: ['😏'],
        id: 'zenzxd'
      })
      let buffer = await sticker.toBuffer()
      await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
    }

  } catch (e) {
    console.error(e)
    m.reply('Error al procesar los stickers')
  }
}

handler.help = ['stickerly']
handler.tags = ['sticker']
handler.command = /^(stikerly|stickerly|sly)$/i
export default handler