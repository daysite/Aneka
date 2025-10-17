import os from "os";
import fs from "fs";

// DECORACIÃ“N APLICADA AQUÃ
const defaultMenu = {
    before: `
*â•­â”€â”ˆãƒ»à­¨ ðŸ§¸ à­§ãƒ»â”ˆãƒ»â”ˆâ”€â•®*
> *Ëšâ‚Šâ€§ ð‘°ð‘µð‘­ð‘¶ ð‘«ð‘¬ð‘³ ð‘¼ð‘ºð‘¼ð‘¨ð‘¹ð‘°ð‘¶ â€§â‚ŠËš*
> 
>  â–¸ ðŸ© *Nombre* : %name
>  â–¸ ðŸ§ *Estado* : %status
*â•°â”€â”ˆãƒ»â”ˆãƒ»â”ˆãƒ»â”ˆãƒ»â”ˆâ”€â•¯*

*â•­â”€â”ˆãƒ»à­¨ ðŸŽ€ à­§ãƒ»â”ˆãƒ»â”ˆâ”€â•®*
> *Ëšâ‚Šâ€§ ð‘³ð‘°ð‘ºð‘»ð‘¨ ð‘«ð‘¬ ð‘ªð‘¶ð‘´ð‘¨ð‘µð‘«ð‘¶ð‘º â€§â‚ŠËš*
>
> â–¸ *ðŸ…Ÿ = Premium*
> â–¸ *ðŸ… = Admin*
> â–¸ *ðŸ…“ = Desarrollador*
> â–¸ *ðŸ…ž = DueÃ±o*
*â•°â”€â”ˆãƒ»â”ˆãƒ»â”ˆãƒ»â”ˆãƒ»â”ˆâ”€â•¯*
`.trimStart(),
    header: `
> â”Œâ”€â”€ã€Œ *%category* ã€`,
    body: `> â”‚â–¸ %cmd %isPremium %isAdmin %isMods %isOwner`,
    footer: `> â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ï½¥ï½¡ï¾Ÿ`,
    after: `
>
*âŽ¯âŽ¯ã…¤ã…¤Ö´ã…¤ã…¤à­¨   ðŸ°  à­§ã…¤ã…¤Ö´   ã…¤âŽ¯âŽ¯*
> *Copyright Â© Kenisawadevolper 2025*
*âŽ¯âŽ¯ã…¤ã…¤Ö´ã…¤ã…¤à­¨   ðŸ°  à­§ã…¤ã…¤Ö´   ã…¤âŽ¯âŽ¯*
`,
};

let handler = async (m, { conn, usedPrefix, command, isOwner, isMods, isPrems, args }) => {
    try {
        await global.loading(m, conn);
        let tags;
        let teks = `${args[0]}`.toLowerCase();
        let arrayMenu = [
            "all",
            "ai",
            "downloader",
            "group",
            "info",
            "internet",
            "rpg",
            "maker",
            "owner",
            "server",
            "tools",
        ];
        if (!arrayMenu.includes(teks)) teks = "404";
        if (teks == "all")
            tags = {
                ai: "ðŸ§  MenÃº de IA",
                downloader: "ðŸ¥ MenÃº de Descargas",
                group: "ðŸ§ƒ MenÃº de Grupos",
                info: "ðŸ“– MenÃº de InformaciÃ³n",
                internet: "ðŸ’Œ MenÃº de Internet",
                rpg: "â›ï¸ MenÃº Rpg",
                maker: "ðŸŽ€ MenÃº de Creadores",
                owner: "ðŸª„ MenÃº del DueÃ±o",
                tools: "ðŸ§¸ MenÃº de Herramientas",
            };
        if (teks == "ai") tags = { ai: "ðŸ§  MenÃº de IA" };
        if (teks == "downloader") tags = { downloader: "ðŸ¥ MenÃº de Descargas" };
        if (teks == "group") tags = { group: "ðŸ§ƒ MenÃº de Grupos" };
        if (teks == "info") tags = { info: "ðŸ“– MenÃº de InformaciÃ³n" };
        if (teks == "internet") tags = { internet: "ðŸ’Œ MenÃº de Internet" };
        if (teks == "rpg") tags = { rpg: "â›ï¸ MenÃº Rpg" };
        if (teks == "maker") tags = { maker: "ðŸŽ€ MenÃº de Creadores" };
        if (teks == "owner") tags = { owner: "ðŸª„ MenÃº del DueÃ±o" };
        if (teks == "tools") tags = { tools: "ðŸ§¸ MenÃº de Herramientas" };

        let name = conn.getName(m.sender);
        let status = isMods
            ? "ðŸ§ Desarrollador"
            : isOwner
                ? "ðŸª„ DueÃ±o"
                : isPrems
                    ? "ðŸ’– Usuario Premium"
                    : "ðŸ¬ Usuario Gratis";
        let vcard = `BEGIN:VCARD
VERSION:3.0
N:;ttname;;;
FN:ttname
item1.TEL;waid=13135550002:+1 (313) 555-0002
item1.X-ABLabel:Ponsel
END:VCARD`;
        let q = {
            key: {
                fromMe: false,
                participant: "13135550002@s.whatsapp.net",
                remoteJid: "status@broadcast",
            },
            message: {
                contactMessage: {
                    displayName: "ðŸ° ð‘¾ð’‚ð’ˆð’–ð’“ð’Š ð‘¨ð’Š",
                    vcard,
                },
            },
        };
        let member = Object.keys(global.db.data.users)
            .filter(
                (v) =>
                    typeof global.db.data.users[v].commandTotal != "undefined" && v != conn.user.jid
            )
            .sort((a, b) => {
                const totalA = global.db.data.users[a].command;
                const totalB = global.db.data.users[b].command;
                return totalB - totalA;
            });
        const icons = ["ðŸ“", "ðŸ’", "ðŸ§", "ðŸ©", "ðŸª", "ðŸ§", "ðŸ¡", "ðŸ®", "ðŸ«", "ðŸ¬", "ðŸ­"];
        let commandToday = 0;
        for (let number of member) {
            commandToday += global.db.data.users[number].command;
        }
        let totalf = Object.values(global.plugins)
            .filter((v) => Array.isArray(v.help))
            .reduce((acc, v) => acc + v.help.length, 0);
        let uptime = formatUptime(process.uptime());
        let muptime = formatUptime(os.uptime());
        let timeID = new Intl.DateTimeFormat("es-AR", {
            timeZone: "America/Buenos_Aires",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        }).format(new Date());
        let subtitle = `ðŸ•’ ${timeID}`;
        const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
        const Version = packageJson.version;
        const mode = global.opts.self ? "Privado" : "PÃºblico";

        // DECORACIÃ“N APLICADA AQUÃ
        let listCmd = `
*â•­â”€â”ˆãƒ»â”ˆãƒ»à­¨ ðŸ“ à­§ãƒ»â”ˆãƒ»â”ˆâ”€â•®*
> *Ëšâ‚Šâ€§ ð‘°ð‘µð‘­ð‘¶ ð‘«ð‘¬ð‘³ ð‘©ð‘¶ð‘» â€§â‚ŠËš*
> 
>  â–¸ ðŸ§ *Nombre* : ${conn.user.name}
>  â–¸ ðŸ’ *VersiÃ³n* : ${Version}
>  â–¸ ðŸ¡ *Modo* : ${mode}
>  â–¸ ðŸ© *Base de Datos* : ${bytesToMB(fs.readFileSync("./database.db").byteLength)} Mb
>  â–¸ ðŸ§ *Tiempo Activo* : ${uptime}
>  â–¸ ðŸ® *Uptime SV* : ${muptime}
>  â–¸ ðŸ« *Comandos Hoy* : ${commandToday}
*â•°â”€â”ˆãƒ»â”ˆãƒ»â”ˆãƒ»â”ˆãƒ»â”ˆãƒ»â”ˆâ”€â•¯*
`.trimStart();

        let lists = arrayMenu.map((v, i) => {
            let icon = icons[i] || "â­";
            return {
                title: `${icon} Menu ${capitalize(v)}`,
                description: `${icon} ${v} estÃ¡ disponible en Waguri Ai ðŸš€`,
                id: `${usedPrefix + command} ${v}`,
            };
        });
        if (teks == "404") {
            return await conn.sendMessage(
                m.chat,
                {
                    document: { url: "https://files.catbox.moe/6sb6u1.jpg" },
                    mimetype: "application/pdf",
                    fileName: `ðŸŒ¸ ${global.config.watermark}`,
                    fileLength: 0,
                    pageCount: 0,
                    caption: listCmd,
                    footer: global.config.author,
                    title: wish(),
                    contextInfo: {
                        externalAdReply: {
                            title: global.config.author,
                            body: subtitle,
                            mediaType: 1,
                            thumbnailUrl: "https://files.catbox.moe/6sb6u1.jpg",
                            sourceUrl: global.config.website,
                            renderLargerThumbnail: true,
                        },
                    },
                    interactiveButtons: [
                        {
                            name: "single_select",
                            buttonParamsJson: JSON.stringify({
                                title: "ðŸ­ Elige aquÃ­~",
                                sections: [
                                    {
                                        title: `ðŸ“‘ Funciones disponibles del Bot: ${totalf}`,
                                        rows: lists,
                                    },
                                ],
                            }),
                        },
                        {
                            name: "cta_url",
                            buttonParamsJson: JSON.stringify({
                                display_text: "ðŸŽ Contactar al Owner",
                                url: global.config.website,
                                merchant_url: global.config.website,
                            }),
                        },
                    ],
                    hasMediaAttachment: false,
                },
                { quoted: q }
            );
        }
        let help = Object.values(global.plugins)
            .filter((plugin) => !plugin.disabled)
            .map((plugin) => {
                return {
                    help: Array.isArray(plugin.tags) ? plugin.help : [plugin.help],
                    tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
                    prefix: "customPrefix" in plugin,
                    premium: plugin.premium,
                    mods: plugin.mods,
                    owner: plugin.owner,
                    admin: plugin.admin,
                    enabled: !plugin.disabled,
                };
            });
        let groups = {};
        for (let tag in tags) {
            groups[tag] = [];
            for (let plugin of help)
                if (plugin.tags && plugin.tags.includes(tag))
                    if (plugin.help) groups[tag].push(plugin);
        }
        conn.menu = conn.menu ? conn.menu : {};
        let before = conn.menu.before || defaultMenu.before;
        let header = conn.menu.header || defaultMenu.header;
        let body = conn.menu.body || defaultMenu.body;
        let footer = conn.menu.footer || defaultMenu.footer;
        let after =
            conn.menu.after ||
            (conn.user.jid == global.conn.user.jid
                ? ""
                : `*Powered by https://wa.me/${global.conn.user.jid.split`@`[0]}*`) +
                defaultMenu.after;
        let _text = [
            before,
            ...Object.keys(tags).map((tag) => {
                return (
                    header.replace(/%category/g, tags[tag]) +
                    "\n" +
                    [
                        ...help
                            .filter((menu) => menu.tags && menu.tags.includes(tag) && menu.help)
                            .map((menu) => {
                                return menu.help
                                    .map((help) => {
                                        return body
                                            .replace(/%cmd/g, menu.prefix ? help : "%p" + help)
                                            .replace(/%isPremium/g, menu.premium ? "ðŸ…Ÿ" : "")
                                            .replace(/%isAdmin/g, menu.admin ? "ðŸ…" : "")
                                            .replace(/%isMods/g, menu.mods ? "ðŸ…“" : "")
                                            .replace(/%isOwner/g, menu.owner ? "ðŸ…ž" : "")
                                            .trim();
                                    })
                                    .join("\n");
                            }),
                        footer,
                    ].join("\n")
                );
            }),
            after,
        ].join("\n");
        let text =
            typeof conn.menu == "string" ? conn.menu : typeof conn.menu == "object" ? _text : "";
        let replace = {
            "%": "%",
            p: usedPrefix,
            name,
            status,
        };
        text = text.replace(
            new RegExp(
                `%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`,
                "g"
            ),
            (_, name) => "" + replace[name]
        );
        await conn.sendMessage(
            m.chat,
            {
                document: { url: "https://files.catbox.moe/6sb6u1.jpg" },
                mimetype: "application/pdf",
                fileName: `ðŸŒ¸ ${global.config.watermark}.pdf`,
                fileLength: 0,
                pageCount: 0,
                caption: text.trim(),
                footer: global.config.author,
                title: wish(),
                contextInfo: {
                    externalAdReply: {
                        title: global.config.author,
                        body: subtitle,
                        mediaType: 1,
                        thumbnailUrl: "https://files.catbox.moe/6sb6u1.jpg",
                        sourceUrl: global.config.website,
                        renderLargerThumbnail: true,
                    },
                },
                interactiveButtons: [
                    {
                        name: "single_select",
                        buttonParamsJson: JSON.stringify({
                            title: "ðŸŒ¥ï¸ MenÃº Adicional ~",
                            sections: [
                                {
                                    title: `ðŸ“‘ Funciones disponibles de Waguri Ai: ${totalf}`,
                                    rows: lists,
                                },
                            ],
                        }),
                    },
                ],
                hasMediaAttachment: false,
            },
            { quoted: q }
        );
    } finally {
        await global.loading(m, conn, true);
    }
};

handler.help = ["menu"];
handler.command = /^(menuprueba|help)$/i;

export default handler;

function formatUptime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);
    let months = Math.floor(days / 30);
    let years = Math.floor(months / 12);

    minutes %= 60;
    hours %= 24;
    days %= 30;
    months %= 12;

    let result = [];
    if (years) result.push(`${years} aÃ±o${years > 1 ? 's' : ''}`);
    if (months) result.push(`${months} mes${months > 1 ? 'es' : ''}`);
    if (days) result.push(`${days} dÃ­a${days > 1 ? 's' : ''}`);
    if (hours) result.push(`${hours} hora${hours > 1 ? 's' : ''}`);
    if (minutes || result.length === 0) result.push(`${minutes} minuto${minutes > 1 ? 's' : ''}`);

    return result.join(" ");
}

function wish() {
    let time = new Date(new Date().toLocaleString("es-AR", { timeZone: "America/Buenos_Aires" }));
    let hours = time.getHours();
    let minutes = time.getMinutes();
    let quarter = Math.floor(minutes / 15);

    const messages = {
        0: [
            "ðŸ© Ya es medianoche, a dormir~",
            "ðŸ§ No te quedes despierto, cuida tu salud~",
            "ðŸ“ Noche tranquila, a descansar~",
        ],
        1: [
            "ðŸ¡ Es la 1 am, hora de dormir~",
            "ðŸ§ Ojos pesados, vamos a descansar~",
            "ðŸ® Que tengas sueÃ±os dulces~",
        ],
        2: [
            "ðŸ« 2 am, no olvides descansar~",
            "ðŸ© Ya muy tarde, a dormir~",
            "ðŸ’ Dormir a esta hora se siente bien~",
        ],
        3: [
            "ðŸ“ 3 am, hora de dormir bien~",
            "ðŸ§ Descansa para despertar fresco maÃ±ana~",
            "ðŸ¡ Dormir profundo es lo mejor~",
        ],
        4: [
            "ðŸŒ¸ Amanecer fresco, Ã¡nimo para levantarse~",
            "ðŸµ Hora del tÃ© calentito~",
            "ðŸ“ MaÃ±ana clara, a ejercitarse~",
        ],
        5: [
            "ðŸ“ El gallo canta, Â¡a levantarse!~",
            "ðŸž Desayuna para tener energÃ­a~",
            "ðŸ¯ Â¡Buenos dÃ­as dulzura~!",
        ],
        6: [
            "ðŸŽ Primero, un poco de ejercicio matutino~",
            "ðŸ« Ãnimo para trabajo/clases~",
            "â˜€ï¸ MaÃ±ana soleada, feliz dÃ­a~",
        ],
        7: [
            "â˜• CafÃ© primero para despejar~",
            "ðŸª Vamos a concentrarnos en el trabajo~",
            "ðŸ© MaÃ±ana productiva~",
        ],
        8: [
            "ðŸ’ Snack de la maÃ±ana para energÃ­a~",
            "ðŸ¥¤ No olvides hidratarte~",
            "ðŸ± Se acerca la hora del almuerzo~",
        ],
        9: [
            "ðŸš Buen mediodÃ­a, a comer~",
            "ðŸ› Â¿QuÃ© estÃ¡s comiendo?~",
            "ðŸ® DespuÃ©s de comer, a relajarse un poco~",
        ],
        10: [
            "ðŸµ Calor de mediodÃ­a, a beber algo~",
            "ðŸ« MantÃ©n el enfoque~",
            "ðŸ§ TÃ© helado refrescante~",
        ],
        11: [
            "ðŸ© Se acerca la tarde, termina tu trabajo~",
            "ðŸª Merienda de tarde, Â¡quÃ© divertido!~",
            "ðŸŒ¸ El cielo se ve precioso~",
        ],
        12: [
            "ðŸš Ya son las 12, hora de almorzar~",
            "ðŸ² No te saltes el almuerzo~",
            "ðŸµ Descansa un poco despuÃ©s de comer~",
        ],
        13: [
            "ðŸ§ Calor de mediodÃ­a, bebe algo fresco~",
            "ðŸ¹ Mantente hidratado~",
            "ðŸ‰ Medio dÃ­a, calor intenso~",
        ],
        14: [
            "ðŸ« Hora de un snack~",
            "ðŸ¥¤ Bebe algo refrescante~",
            "ðŸ“– RelÃ¡jate un poco~",
        ],
        15: [
            "ðŸª Ya es tarde, haz un poco de stretching~",
            "ðŸ© Galletitas para merendar~",
            "ðŸŒ‡ Cielo de tarde precioso~",
        ],
        16: [
            "ðŸµ TÃ© de la tarde + snack, perfecto~",
            "ðŸ° RelÃ¡jate viendo algo~",
            "ðŸ“¸ Hora de fotos del cielo~",
        ],
        17: [
            "ðŸ½ï¸ Ya es tarde, prepÃ¡rate para la cena~",
            "ðŸ² Â¿QuÃ© vas a cenar esta noche?~",
            "ðŸŒ… Tarde fresca, quÃ© lindo~",
        ],
        18: [
            "ðŸ› No olvides cenar~",
            "ðŸ« Noche tranquila~",
            "ðŸ“º RelÃ¡jate viendo algo~",
        ],
        19: [
            "ðŸŽ¶ Noche divertida con mÃºsica~",
            "ðŸ“± Un poco de redes sociales~",
            "ðŸŽ® Juega tranquilo~",
        ],
        20: [
            "ðŸµ Skincare + tiempo de relax~",
            "ðŸ“– Leer antes de dormir~",
            "ðŸ›Œ 8 pm, hora de descansar~",
        ],
        21: [
            "ðŸ’ No trasnoches, a dormir~",
            "ðŸ§ Dormir temprano para despertar fresco~",
            "ðŸŒ™ Dulces sueÃ±os~",
        ],
        22: [
            "ðŸ© Apaga las luces~",
            "âœ¨ Que tengas sueÃ±os hermosos~",
            "ðŸ›Œ Dormir lo suficiente es importante~",
        ],
        23: [
            "ðŸ’¤ Medianoche, a dormir profundo~",
            "ðŸ“ No trasnoches~",
            "ðŸ® Buenas noches, dulces sueÃ±os~",
        ],
    };

    let message = messages[hours]?.[quarter] || messages[hours]?.[3] || "âœ¨ El tiempo sigue avanzando~";
    return `*${message}*`;
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.substr(1);
}

function bytesToMB(bytes) {
    return (bytes / 1048576).toFixed(2);
      }
