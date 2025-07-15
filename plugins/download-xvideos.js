import fetch from 'node-fetch';
import axios from 'axios';
import cheerio from 'cheerio';

const handler = async (m, { conn, args, command, usedPrefix, text }) => {
if (!db.data.chats[m.chat].nsfw && m.isGroup) {
    return m.reply(hotw);
    }

  if (!args[0]) {
    return conn.reply(m.chat, `*🍁 Por favor, ingresa un enlace válido de xvideos.*`, m);
  }

  try {
    await m.react('⏳');
    const res = await xvideosdl(args[0]);
    conn.sendMessage(m.chat, { document: { url: res.result.url }, mimetype: 'video/mp4', fileName: res.result.title }, { quoted: m });
  } catch (e) {
    throw '*⚠️ Proporciona un enlace válido de xvideos.*';
  }
};

handler.help = ['xvideosdl'];
handler.tags = ['download'];
handler.command = /^(xvideosdl|xvdl|xvideos)$/i;
export default handler;

async function xvideosdl(url) {
  return new Promise((resolve, reject) => {
    fetch(url, { method: 'get' })
      .then(res => res.text())
      .then(res => {
        let $ = cheerio.load(res, { xmlMode: false });
        const title = $("meta[property='og:title']").attr("content");
        const keyword = $("meta[name='keywords']").attr("content");
        const views = $("div#video-tabs > div > div > div > div > strong.mobile-hide").text() + " views";
        const vote = $("div.rate-infos > span.rating-total-txt").text();
        const likes = $("span.rating-good-nbr").text();
        const deslikes = $("span.rating-bad-nbr").text();
        const thumb = $("meta[property='og:image']").attr("content");
        const videoUrl = $("#html5video > #html5video_base > div > a").attr("href");
        resolve({ status: 200, result: { title, url: videoUrl, keyword, views, vote, likes, deslikes, thumb } });
      })
      .catch(err => reject(err));
  });
}

async function xvideosSearch(query) {
  return new Promise(async (resolve) => {
    await axios.get(`https://www.xvideos.com/?k=${query}&p=${Math.floor(Math.random() * 9) + 1}`).then(async result => {
      let $ = cheerio.load(result.data, { xmlMode: false });
      let title = [];
      let duration = [];
      let quality = [];
      let url = [];
      let thumb = [];
      let hasil = [];

      $("div.mozaique > div > div.thumb-under > p.title").each(function () {
        title.push($(this).find("a").attr("title"));
        duration.push($(this).find("span.duration").text());
        url.push("https://www.xvideos.com" + $(this).find("a").attr("href"));
      });

      $("div.mozaique > div > div.thumb-under").each(function () {
        quality.push($(this).find("span.video-hd-mark").text());
      });

      $("div.mozaique > div > div > div.thumb > a").each(function () {
        thumb.push($(this).find("img").attr("data-src"));
      });

      for (let i = 0; i < title.length; i++) {
        hasil.push({
          title: title[i],
          duration: duration[i],
          quality: quality[i],
          thumb: thumb[i],
          url: url[i]
        });
      }
      resolve(hasil);
    });
  });
}
