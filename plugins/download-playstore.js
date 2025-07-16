/*import gplay from 'google-play-scraper';
import fetch from 'node-fetch';

let handler = async (m, { conn, args, usedPrefix: prefix, command }) => {

    if (!args[0]) {
        console.log('Argumento vacío, enviando mensaje de ayuda');
        return conn.reply(m.chat, `*${xdownload} Ingresa un enlace de descarga de la PlayStore.*\n> *\`Ejemplo:\`* ${prefix}playstore https://play.google.com/store/apps/details?id=com.whatsapp`, m);
    }

    m.react('⌛');

    const url = args[0];

    let packageName;
    try {
        packageName = new URL(url).searchParams.get("id");
        if (!packageName) throw new Error();
    } catch {
        return conn.reply(m.chat, `*❌ La URL proporcionada no es válida o no contiene un ID de aplicación.*`, m);
    }

    console.log(`ID de paquete: ${packageName}`);

    let info;
    try {
        info = await gplay.app({ appId: packageName });
    } catch (error) {
        console.error(error);
        return conn.reply(m.chat, `*❌ No se pudo encontrar la aplicación. Asegúrate de que el enlace sea correcto.*`, m);
    }

    const h = info.title;
    console.log(`Título de la aplicación: ${h}\nID de la aplicación: ${info.appId}`);

    let link = `https://d.apkpure.com/b/APK/${info.appId}?version=latest`;

    conn.sendFile(m.chat, link, `${h}.apk`, ``, m, false, { mimetype: 'application/vnd.android.package-archive', asDocument: true });
    m.react('✅️');

    conn.reply(m.chat, `*🚀 Se esta enviando \`${h}\` Aguarde un momento*`, m);
}

handler.help = ['playstore']; 
handler.tags = ['download'];
handler.command = /^(playstore)$/i;
export default handler;*/

import gplay from 'google-play-scraper';
import fetch from 'node-fetch';

let handler = async (m, { conn, args, usedPrefix: prefix, command }) => {
    if (!args[0]) {
        return conn.reply(m.chat, `*📥 Ingresa un enlace de la Play Store para descargar una app APK.*\n> *Ejemplo:* ${prefix}playstore https://play.google.com/store/apps/details?id=com.whatsapp`, m);
    }

    m.react('⏳');

    const url = args[0];
    let packageName;
    try {
        packageName = new URL(url).searchParams.get("id");
        if (!packageName) throw new Error();
    } catch {
        return conn.reply(m.chat, `❌ *La URL proporcionada no es válida o no contiene un ID de aplicación.*`, m);
    }

    let info;
    try {
        info = await gplay.app({ appId: packageName });
    } catch (error) {
        console.error(error);
        return conn.reply(m.chat, `❌ *No se pudo encontrar la aplicación en Play Store. Verifica el enlace.*`, m);
    }

    const appName = info.title;
    const downloadLink = `https://d.apkpure.com/b/APK/${info.appId}?version=latest`;

    // Verificamos si el archivo está disponible y es un APK válido
    try {
        const head = await fetch(downloadLink, {
            method: 'HEAD',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:91.0) Gecko/91.0 Firefox/91.0'
            }
        });

        const contentType = head.headers.get('content-type') || '';
        if (!head.ok || !contentType.includes('application/vnd.android.package-archive')) {
            return conn.reply(m.chat, `❌ *El archivo APK no está disponible ahora mismo. Intenta de nuevo más tarde.*`, m);
        }
    } catch (error) {
        console.error(error);
        return conn.reply(m.chat, `❌ *Error al verificar el archivo APK. Vuelve a intentarlo más tarde.*`, m);
    }

    try {
        await conn.sendFile(m.chat, downloadLink, `${appName}.apk`, '', m, false, {
            mimetype: 'application/vnd.android.package-archive',
            asDocument: true
        });

        m.react('✅');
        conn.reply(m.chat, `✅ *Se está enviando* \`${appName}\`\n📦 *Tamaño estimado: revisa después de recibir el archivo*`, m);
    } catch (err) {
        console.error(err);
        m.react('❌');
        conn.reply(m.chat, `❌ *Error al enviar el archivo APK. Puede que el servidor esté rechazando la conexión.*`, m);
    }
};

handler.help = ['playstore'];
handler.tags = ['download'];
handler.command = /^playstore$/i;
export default handler;
