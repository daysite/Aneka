// plugins/horoscopo.js

let cooldowns = {};
let xrpg = '✨';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) {
            return mostrarAyuda(m, conn, usedPrefix, command);
        }
        
        let args = text.trim().split(" ");
        let signo = args[0].toLowerCase();
        
        // Comando de ayuda - no aplica cooldown
        if (signo === 'ayuda') {
            return mostrarAyuda(m, conn, usedPrefix, command);
        }
        
        // Tiempo de espera en segundos (30 minutos = 1800 segundos)
        let tiempoEspera = 1800;
        
        // Verificar cooldown SOLO para consultas reales, no para ayuda
        if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempoEspera * 1000) {
            let tiempoRestante = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempoEspera * 1000 - Date.now()) / 1000));
            return conn.reply(m.chat, `⏰ Ya consultaste tu horóscopo recientemente. Espera *${tiempoRestante}* para consultarlo nuevamente.`, m);
        }
        
        let periodo = args[1] || 'hoy'; // Por defecto: hoy
        
        // Validar signo zodiacal
        if (!validarSigno(signo)) {
            return conn.reply(m.chat, `❌ Signo zodiacal no válido. Use ${usedPrefix + command} ayuda para ver la lista de signos.`, m);
        }
        
        // Validar período
        if (!['hoy', 'semana', 'mes', 'ayer'].includes(periodo)) {
            return conn.reply(m.chat, `❌ Período no válido. Use: hoy, semana, mes o ayer.`, m);
        }
        
        // Establecer cooldown SOLO después de validaciones exitosas
        cooldowns[m.sender] = Date.now();
        
        // Simular carga
        await conn.reply(m.chat, `${xrpg} Consultando las estrellas para *${signo}*... 🔮`, m);
        
        // Obtener predicción
        const prediccion = await obtenerPrediccion(signo, periodo);
        
        // Obtener imagen del signo
        const imagenSigno = await obtenerImagenSigno(signo);
        
        // Formatear y enviar mensaje
        const mensajeHoroscopo = formatearMensaje(signo, periodo, prediccion);
        
        // Enviar mensaje con imagen
        if (imagenSigno) {
            try {
                await conn.sendMessage(m.chat, {
                    image: { url: imagenSigno },
                    caption: mensajeHoroscopo,
                    mentions: [m.sender]
                }, { quoted: m });
            } catch (imageError) {
                console.error('Error enviando imagen, enviando solo texto:', imageError);
                await conn.reply(m.chat, mensajeHoroscopo, m);
            }
        } else {
            await conn.reply(m.chat, mensajeHoroscopo, m);
        }
        
    } catch (error) {
        console.error('Error en handler de horóscopo:', error);
        await conn.reply(m.chat, '❌ Lo siento, ha ocurrido un error al obtener tu horóscopo. Intenta nuevamente.', m);
    }
}

// Función para obtener imagen del signo (mejorada con más opciones)
async function obtenerImagenSigno(signo) {
    // Colección ampliada de imágenes para cada signo
    const imagenesSignos = {
        'aries': [
            'https://images.unsplash.com/photo-1599405631625-85dae1c9bbd9?w=500',
            'https://cdn.pixabay.com/photo/2016/11/29/13/39/astrology-1869710_640.jpg',
            'https://images.pexels.com/photos/110854/pexels-photo-110854.jpeg?auto=compress&cs=tinysrgb&w=500'
        ],
        'tauro': [
            'https://images.unsplash.com/photo-1599405631574-2fb22f3b49c9?w=500',
            'https://cdn.pixabay.com/photo/2017/08/30/17/25/astrology-2698310_640.jpg',
            'https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg?auto=compress&cs=tinysrgb&w=500'
        ],
        'geminis': [
            'https://images.unsplash.com/photo-1599405631606-3b369d4b4ec7?w=500',
            'https://cdn.pixabay.com/photo/2017/08/30/17/25/astrology-2698309_640.jpg',
            'https://images.pexels.com/photos/1252869/pexels-photo-1252869.jpeg?auto=compress&cs=tinysrgb&w=500'
        ],
        'cancer': [
            'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500',
            'https://cdn.pixabay.com/photo/2017/08/30/17/25/astrology-2698308_640.jpg',
            'https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg?auto=compress&cs=tinysrgb&w=500'
        ],
        'leo': [
            'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=500',
            'https://cdn.pixabay.com/photo/2017/08/30/17/25/astrology-2698307_640.jpg',
            'https://images.pexels.com/photos/355465/pexels-photo-355465.jpeg?auto=compress&cs=tinysrgb&w=500'
        ],
        'virgo': [
            'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500',
            'https://cdn.pixabay.com/photo/2017/08/30/17/25/astrology-2698306_640.jpg',
            'https://images.pexels.com/photos/414144/pexels-photo-414144.jpeg?auto=compress&cs=tinysrgb&w=500'
        ],
        'libra': [
            'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=500',
            'https://cdn.pixabay.com/photo/2017/08/30/17/25/astrology-2698305_640.jpg',
            'https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&w=500'
        ],
        'escorpio': [
            'https://images.unsplash.com/photo-1599405631625-85dae1c9bbd9?w=500',
            'https://cdn.pixabay.com/photo/2017/08/30/17/25/astrology-2698304_640.jpg',
            'https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg?auto=compress&cs=tinysrgb&w=500'
        ],
        'sagitario': [
            'https://images.unsplash.com/photo-1599405631574-2fb22f3b49c9?w=500',
            'https://cdn.pixabay.com/photo/2017/08/30/17/25/astrology-2698303_640.jpg',
            'https://images.pexels.com/photos/1252869/pexels-photo-1252869.jpeg?auto=compress&cs=tinysrgb&w=500'
        ],
        'capricornio': [
            'https://images.unsplash.com/photo-1599405631606-3b369d4b4ec7?w=500',
            'https://cdn.pixabay.com/photo/2017/08/30/17/25/astrology-2698302_640.jpg',
            'https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg?auto=compress&cs=tinysrgb&w=500'
        ],
        'acuario': [
            'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500',
            'https://cdn.pixabay.com/photo/2017/08/30/17/25/astrology-2698301_640.jpg',
            'https://images.pexels.com/photos/355465/pexels-photo-355465.jpeg?auto=compress&cs=tinysrgb&w=500'
        ],
        'piscis': [
            'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=500',
            'https://cdn.pixabay.com/photo/2017/08/30/17/25/astrology-2698300_640.jpg',
            'https://images.pexels.com/photos/414144/pexels-photo-414144.jpeg?auto=compress&cs=tinysrgb&w=500'
        ]
    };
    
    // Seleccionar una imagen aleatoria del array de imágenes para el signo
    const imagenes = imagenesSignos[signo] || [
        'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=500',
        'https://cdn.pixabay.com/photo/2016/11/29/13/39/astrology-1869710_640.jpg'
    ];
    
    // Devolver una imagen aleatoria del array
    return imagenes[Math.floor(Math.random() * imagenes.length)];
}

// Función para mostrar ayuda
function mostrarAyuda(m, conn, usedPrefix, command) {
    const ayuda = `
${xrpg} *Horóscopo Bot* ${xrpg}

Consulta tu horóscopo con los siguientes comandos:

*${usedPrefix + command} [signo]* - Horóscopo de hoy
*${usedPrefix + command} [signo] [periodo]* - Horóscopo para el período especificado

📅 *Períodos disponibles:*
- hoy (predeterminado)
- ayer
- semana
- mes

♈ *Signos zodiacales:*
- aries (♈) - 21 Marzo - 19 Abril
- tauro (♉) - 20 Abril - 20 Mayo
- geminis (♊) - 21 Mayo - 20 Junio
- cancer (♋) - 21 Junio - 22 Julio
- leo (♌) - 23 Julio - 22 Agosto
- virgo (♍) - 23 Agosto - 22 Septiembre
- libra (♎) - 23 Septiembre - 22 Octubre
- escorpio (♏) - 23 Octubre - 21 Noviembre
- sagitario (♐) - 22 Noviembre - 21 Diciembre
- capricornio (♑) - 22 Diciembre - 19 Enero
- acuario (♒) - 20 Enero - 18 Febrero
- piscis (♓) - 19 Febrero - 20 Marzo

🔮 *Ejemplos:*
${usedPrefix + command} leo
${usedPrefix + command} escorpio semana
${usedPrefix + command} libra mes

⏰ *Nota:* Solo puedes consultar tu horóscopo una vez cada 30 minutos.
`;
    conn.reply(m.chat, ayuda, m);
}

// Validar si el signo es válido
function validarSigno(signo) {
    const signosValidos = [
        'aries', 'tauro', 'geminis', 'cancer', 'leo', 'virgo', 
        'libra', 'escorpio', 'sagitario', 'capricornio', 'acuario', 'piscis'
    ];
    return signosValidos.includes(signo);
}

// Obtener predicción (mejorada con más variedad)
async function obtenerPrediccion(signo, periodo) {
    try {
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Ampliada base de datos de predicciones
        const todasLasPredicciones = {
            'amor': [
                "Hoy el amor estará en el aire, mantén tu corazón abierto.",
                "Una conexión especial podría surgir cuando menos lo esperes.",
                "Es momento de expresar tus sentimientos con honestidad.",
                "La paciencia será clave en tus relaciones sentimentales."
            ],
            'trabajo': [
                "Excelente día para proyectos nuevos y tomar iniciativa.",
                "Tu esfuerzo será reconocido por superiores o colegas.",
                "Colaborar con otros te traerá mejores resultados.",
                "Enfócate en tus metas profesionales con determinación."
            ],
            'salud': [
                "Momento ideal para comenzar nuevos hábitos saludables.",
                "Escucha a tu cuerpo y date el descanso que necesitas.",
                "La meditación te ayudará a encontrar equilibrio interior.",
                "Cuida tu alimentación y bienestar físico con atención."
            ],
            'fortuna': [
                "La suerte te sonreirá en asuntos financieros inesperados.",
                "Una oportunidad favorable se presentará pronto.",
                "Tus decisiones económicas serán acertadas hoy.",
                "Es buen momento para inversiones a largo plazo."
            ]
        };
        
        const categorias = Object.keys(todasLasPredicciones);
        const prediccionCategoria = categorias[Math.floor(Math.random() * categorias.length)];
        const predicciones = todasLasPredicciones[prediccionCategoria];
        
        return {
            sign: signo,
            period: periodo,
            prediction: predicciones[Math.floor(Math.random() * predicciones.length)],
            category: prediccionCategoria,
            date: new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        };
        
    } catch (error) {
        console.error('Error en obtenerPrediccion:', error);
        // Predicción de respaldo en caso de error
        return {
            sign: signo,
            period: periodo,
            prediction: "Las estrellas indican que es un día favorable para ti. Mantén una actitud positiva y confía en tu intuición.",
            category: "general",
            date: new Date().toLocaleDateString('es-ES')
        };
    }
}

// Formatear el mensaje de respuesta (mejorado)
function formatearMensaje(signo, periodo, datos) {
    const emojis = {
        'aries': '♈', 'tauro': '♉', 'geminis': '♊', 'cancer': '♋',
        'leo': '♌', 'virgo': '♍', 'libra': '♎', 'escorpio': '♏',
        'sagitario': '♐', 'capricornio': '♑', 'acuario': '♒', 'piscis': '♓'
    };
    
    const periodoTexto = {
        'hoy': 'Hoy', 'ayer': 'Ayer', 'semana': 'Esta semana', 'mes': 'Este mes'
    };
    
    const categoriasEmojis = {
        'amor': '💖', 'trabajo': '💼', 'salud': '🌿', 'fortuna': '💰', 'general': '✨'
    };
    
    const signoCapitalizado = signo.charAt(0).toUpperCase() + signo.slice(1);
    const emojiCategoria = categoriasEmojis[datos.category] || '✨';

    return `
${xrpg} *${periodoTexto[periodo]} - ${signoCapitalizado}* ${emojis[signo]} ${xrpg}

${emojiCategoria} *Predicción ${datos.category.toUpperCase()}:*
${datos.prediction}

✨ *Número de la suerte:* ${Math.floor(Math.random() * 10) + 1}
🌈 *Color del día:* ${['rojo', 'azul', 'verde', 'amarillo', 'púrpura', 'naranja'][Math.floor(Math.random() * 6)]}
⭐ *Elemento:* ${['fuego', 'tierra', 'aire', 'agua'][Math.floor(Math.random() * 4)]}
📅 *Fecha:* ${datos.date}

⏰ *Próxima consulta disponible en 30 minutos*
`;
}

// Función para convertir segundos a formato legible
function segundosAHMS(segundos) {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segundosRestantes = segundos % 60;
    
    let resultado = '';
    if (horas > 0) resultado += `${horas} hora${horas > 1 ? 's' : ''} `;
    if (minutos > 0) resultado += `${minutos} minuto${minutos > 1 ? 's' : ''} `;
    if (segundosRestantes > 0) resultado += `${segundosRestantes} segundo${segundosRestantes > 1 ? 's' : ''}`;
    
    return resultado.trim();
}

handler.help = ['horoscopo <signo> <periodo>'];
handler.tags = ['fun'];
handler.command = ['horoscopo', 'horoscope', 'horo', 'zodiaco'];
handler.register = true;

export default handler;
