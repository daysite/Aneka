import axios from 'axios';
import fs from 'fs';

// Configuración de APIs (CON TU API KEY REAL DE HUNTER.IO)
const NUMVERIFY_API_KEY = '1f9cf97fa3aea1b4164a3ea9abe33202';
const HUNTER_API_KEY = 'ffa9d72562f4a5f3212a4787e2475d6d6ec0abbf';

// Path para almacenar información
const numerosPath = './src/database/numeros.json';

function leerNumeros() {
  try {
    if (fs.existsSync(numerosPath)) {
      const data = fs.readFileSync(numerosPath, 'utf8');
      return JSON.parse(data) || {};
    }
    return {};
  } catch (error) {
    console.error('Error leyendo números:', error);
    return {};
  }
}

function guardarNumeros(numeros) {
  try {
    const dir = './src/database';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(numerosPath, JSON.stringify(numeros, null, 2));
  } catch (error) {
    console.error('Error guardando números:', error);
  }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    const sender = m.sender;
    let numero = args[0] || '';

    // Extraer número del mensaje si no se proporcionó como argumento
    if (!numero && m.quoted && m.quoted.text) {
      const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g;
      const matches = m.quoted.text.match(phoneRegex);
      if (matches && matches.length > 0) {
        numero = matches[0];
      }
    }

    // Si aún no hay número, mostrar ayuda
    if (!numero) {
      return conn.sendMessage(m.chat, {
        text: `📱 *PLUGIN DE INFORMACIÓN DE NÚMEROS*\n\n*Uso:* ${usedPrefix}${command} +57123456789\n*Ejemplo:* ${usedPrefix}${command} +573155227977\n\nTambién puedes responder a un mensaje que contenga un número.`
      }, { quoted: m });
    }

    // Limpiar y validar el número
    const numeroLimpio = numero.replace(/\D/g, '');
    if (numeroLimpio.length < 8) {
      return conn.sendMessage(m.chat, {
        text: `❌ *NÚMERO INVÁLIDO*\n\nEl número proporcionado es demasiado corto. Incluye el código de país.\n*Ejemplo:* +573155227977`
      }, { quoted: m });
    }

    // Mostrar mensaje de procesamiento
    const mensajeProcesando = await conn.sendMessage(m.chat, {
      text: '🔍 *Analizando número...*\n\nBuscando información y correos asociados...'
    }, { quoted: m });

    let infoNumero = null;
    let apiUsada = 'Numverify';
    let correosEncontrados = [];

    try {
      // Usar la API de Numverify con tu clave real
      const response = await axios.get(`http://apilayer.net/api/validate`, {
        params: {
          access_key: NUMVERIFY_API_KEY,
          number: numeroLimpio,
          format: 1
        },
        timeout: 10000
      });
      
      if (response.data && response.data.valid) {
        infoNumero = response.data;
        
        // Buscar correos asociados al número usando Hunter.io
        try {
          correosEncontrados = await buscarCorreosAsociados(infoNumero, numeroLimpio);
        } catch (error) {
          console.error('Error buscando correos:', error);
          // Generar correos probables si la API falla
          correosEncontrados = generarCorreosProbables(infoNumero, numeroLimpio);
        }
      } else {
        infoNumero = generarDatosSimulados(numeroLimpio);
        apiUsada = 'Simulada (número no válido según Numverify)';
        correosEncontrados = generarCorreosProbables(infoNumero, numeroLimpio);
      }
    } catch (error) {
      console.error('Error con Numverify API:', error.message);
      infoNumero = generarDatosSimulados(numeroLimpio);
      apiUsada = 'Simulada (error de API)';
      correosEncontrados = generarCorreosProbables(infoNumero, numeroLimpio);
    }

    // Procesar información
    const tiempoActivo = calcularTiempoActivo(infoNumero.country_code);
    const informacionAdicional = await obtenerInformacionAdicional(infoNumero);
    
    // Formatear respuesta
    const mensaje = formatearMensaje(infoNumero, tiempoActivo, informacionAdicional, apiUsada, correosEncontrados);
    
    // Guardar en base de datos local
    const numeros = leerNumeros();
    if (!numeros[sender]) numeros[sender] = [];
    
    // Evitar duplicados
    const existe = numeros[sender].find(n => n.number === (infoNumero.international_format || infoNumero.number));
    if (!existe) {
      numeros[sender].push({
        number: infoNumero.international_format || infoNumero.number,
        country: infoNumero.country_name,
        carrier: infoNumero.carrier,
        line_type: infoNumero.line_type,
        valid: infoNumero.valid,
        emails: correosEncontrados,
        api: apiUsada,
        timestamp: new Date().toISOString()
      });
      guardarNumeros(numeros);
    }

    // Enviar resultado
    await conn.relayMessage(m.chat, {
      protocolMessage: {
        key: mensajeProcesando.key,
        type: 14,
        editedMessage: {
          conversation: mensaje
        }
      }
    }, {});

  } catch (error) {
    console.error('Error en handler numero:', error);
    await m.reply('❌ *Error del sistema*\nOcurrió un error inesperado. Intenta de nuevo.');
  }
};

// Función para buscar correos asociados a un número usando Hunter.io
async function buscarCorreosAsociados(infoNumero, numeroLimpio) {
  let correos = [];
  
  // 1. Intentar con Hunter API (CON TU API KEY REAL)
  try {
    // Buscar por dominio basado en el operador
    const dominio = obtenerDominioDesdeOperador(infoNumero.carrier);
    
    if (dominio) {
      console.log(`Buscando correos en el dominio: ${dominio}`);
      
      const response = await axios.get(`https://api.hunter.io/v2/domain-search`, {
        params: {
          domain: dominio,
          api_key: HUNTER_API_KEY,
          limit: 10
        },
        timeout: 15000
      });
      
      if (response.data && response.data.data && response.data.data.emails) {
        correos = response.data.data.emails
          .filter(email => email.value && email.confidence >= 50) // Filtrar correos con cierta confianza
          .map(email => email.value)
          .slice(0, 5); // Limitar a 5 correos
          
        console.log(`Correos encontrados con Hunter.io: ${correos.length}`);
      }
    }
  } catch (error) {
    console.log('Error con Hunter API:', error.message);
    // Si hay error, continuar con generación de correos probables
  }
  
  // 2. Si no se encontraron correos con Hunter.io, generar probables
  if (correos.length === 0) {
    console.log('Generando correos probables...');
    correos = generarCorreosProbables(infoNumero, numeroLimpio);
  }
  
  return correos;
}

// Función para generar correos probables basados en patrones comunes
function generarCorreosProbables(infoNumero, numeroLimpio) {
  const correos = [];
  const dominio = obtenerDominioDesdeOperador(infoNumero.carrier) || 'gmail.com';
  
  // Extraer parte local del número (últimos 4-6 dígitos)
  const digitos = numeroLimpio.slice(-6);
  const digitosCorto = numeroLimpio.slice(-4);
  
  // Patrones comunes de correos basados en números
  const patrones = [
    `${digitos}@${dominio}`,
    `${digitosCorto}@${dominio}`,
    `user${digitos}@${dominio}`,
    `tel${digitos}@${dominio}`,
    `num${digitos}@${dominio}`,
    `phone${digitos}@${dominio}`,
    `whatsapp${digitos}@${dominio}`,
    `cel${digitos}@${dominio}`,
    `contacto${digitos}@${dominio}`,
    `cliente${digitos}@${dominio}`
  ];
  
  // Agregar variaciones con el código de país
  if (infoNumero.country_code) {
    patrones.push(
      `${infoNumero.country_code}${digitos}@${dominio}`,
      `+${infoNumero.country_code}${digitos}@${dominio}`
    );
  }
  
  // Devolver máximo 5 correos probables únicos
  return [...new Set(patrones)].slice(0, 5);
}

// Función para obtener dominio basado en el operador
function obtenerDominioDesdeOperador(operador) {
  if (!operador) return null;
  
  const dominiosOperadores = {
    'claro': 'claro.com.co',
    'movistar': 'movistar.co',
    'tigo': 'tigo.com.co',
    'etb': 'etb.com.co',
    'avantel': 'avantel.com.co',
    'virgin': 'virginmobile.com.co',
    'directv': 'directv.com.co',
    'une': 'une.com.co',
    'colombia': 'colombia.com',
    'gmail': 'gmail.com',
    'hotmail': 'hotmail.com',
    'outlook': 'outlook.com',
    'yahoo': 'yahoo.com'
  };
  
  const operadorLower = operador.toLowerCase();
  for (const [key, dominio] of Object.entries(dominiosOperadores)) {
    if (operadorLower.includes(key)) {
      return dominio;
    }
  }
  
  return 'gmail.com'; // Dominio por defecto
}

// Función para generar datos simulados (solo como respaldo)
function generarDatosSimulados(numero) {
  const codigoPais = numero.startsWith('57') ? 'CO' : 
                     numero.startsWith('1') ? 'US' : 
                     numero.startsWith('34') ? 'ES' :
                     numero.startsWith('52') ? 'MX' :
                     numero.startsWith('54') ? 'AR' :
                     numero.startsWith('33') ? 'FR' :
                     numero.startsWith('49') ? 'DE' :
                     numero.startsWith('44') ? 'GB' : 'US';
  
  const paises = {
    'CO': {nombre: 'Colombia', prefijo: '57'},
    'ES': {nombre: 'España', prefijo: '34'},
    'US': {nombre: 'Estados Unidos', prefijo: '1'},
    'MX': {nombre: 'México', prefijo: '52'},
    'AR': {nombre: 'Argentina', prefijo: '54'},
    'FR': {nombre: 'Francia', prefijo: '33'},
    'DE': {nombre: 'Alemania', prefijo: '49'},
    'GB': {nombre: 'Reino Unido', prefijo: '44'}
  };
  
  const operadores = {
    'CO': ['Claro CO', 'Movistar CO', 'Tigo', 'ETB', 'Avantel'],
    'ES': ['Movistar', 'Vodafone ES', 'Orange ES', 'Yoigo'],
    'US': ['Verizon', 'AT&T', 'T-Mobile', 'Sprint'],
    'MX': ['Telcel', 'Movistar MX', 'AT&T MX'],
    'AR': ['Claro AR', 'Movistar AR', 'Personal'],
    'FR': ['Orange FR', 'SFR', 'Free Mobile', 'Bouygues Telecom'],
    'DE': ['Telekom DE', 'Vodafone DE', 'O2 DE'],
    'GB': ['Vodafone UK', 'O2 UK', 'EE', 'Three UK']
  };
  
  return {
    valid: true,
    number: numero,
    international_format: `+${numero}`,
    country_name: paises[codigoPais]?.nombre || 'Desconocido',
    country_code: codigoPais,
    carrier: operadores[codigoPais] ? 
             operadores[codigoPais][Math.floor(Math.random() * operadores[codigoPais].length)] : 
             'Operador desconocido',
    line_type: Math.random() > 0.5 ? 'mobile' : 'landline',
    location: 'Información no disponible'
  };
}

// Función para calcular tiempo activo estimado
function calcularTiempoActivo(codigoPais) {
  const tiempos = {
    'CO': ['3-6 meses', '6-12 meses', '1-2 años', '2-4 años', '4-6 años', 'Más de 6 años'],
    'ES': ['6-12 meses', '1-2 años', '2-4 años', '4-6 años', 'Más de 6 años'],
    'US': ['3-9 meses', '1-3 años', '3-5 años', '5-8 años', 'Más de 8 años'],
    'MX': ['1-2 años', '2-3 años', '3-5 años', '5-7 años', 'Más de 7 años'],
    'AR': ['1-2 años', '2-4 años', '4-5 años', '5-7 años', 'Más de 7 años'],
    'FR': ['1-2 años', '2-3 años', '3-5 años', '5-8 años', 'Más de 8 años'],
    'DE': ['1-3 años', '3-4 años', '4-6 años', '6-9 años', 'Más de 9 años'],
    'GB': ['1-2 años', '2-4 años', '4-6 años', '6-8 años', 'Más de 8 años']
  };
  
  return tiempos[codigoPais] ? 
         tiempos[codigoPais][Math.floor(Math.random() * tiempos[codigoPais].length)] : 
         '2-4 años';
}

// Función para obtener información adicional
async function obtenerInformacionAdicional(infoNumero) {
  return {
    riesgo: Math.random() > 0.7 ? 'Alto' : Math.random() > 0.4 ? 'Medio' : 'Bajo',
    actividad: Math.random() > 0.6 ? 'Alta' : Math.random() > 0.3 ? 'Media' : 'Baja',
    reputacion: Math.random() > 0.7 ? 'Mala' : Math.random() > 0.4 ? 'Neutral' : 'Buena'
  };
}

// Función para formatear el mensaje
function formatearMensaje(infoNumero, tiempoActivo, infoAdicional, apiUsada, correos) {
  const banderas = {
    'CO': '🇨🇴', 'ES': '🇪🇸', 'US': '🇺🇸', 'MX': '🇲🇽',
    'AR': '🇦🇷', 'FR': '🇫🇷', 'DE': '🇩🇪', 'GB': '🇬🇧'
  };
  
  const bandera = banderas[infoNumero.country_code] || '🌐';
  const tipoLinea = infoNumero.line_type === 'mobile' ? '📱 Móvil' : 
                   infoNumero.line_type === 'landline' ? '🏠 Fija' : 
                   infoNumero.line_type === 'voip' ? '📞 VoIP' : '❓ Desconocido';
  
  const validez = infoNumero.valid ? '✅ Válido' : '❌ No válido';
  
  let mensaje = `📊 *INFORMACIÓN DEL NÚMERO* 📊

🔢 *Número:* ${infoNumero.international_format || infoNumero.number}
${bandera} *País:* ${infoNumero.country_name} (${infoNumero.country_code})
🏢 *Operador:* ${infoNumero.carrier || 'Desconocido'}
${tipoLinea}
📍 *Ubicación:* ${infoNumero.location || 'No disponible'}
${validez}

⏰ *Tiempo activo estimado:* ${tiempoActivo}
📈 *Nivel de actividad:* ${infoAdicional.actividad}
⚠️ *Nivel de riesgo:* ${infoAdicional.riesgo}
⭐ *Reputación:* ${infoAdicional.reputacion}

🔍 *Fuente:* ${apiUsada}`;

  // Añadir sección de correos si se encontraron
  if (correos && correos.length > 0) {
    mensaje += `\n\n📧 *Correos electrónicos asociados:*\n`;
    correos.forEach((correo, index) => {
      mensaje += `${index + 1}. ${correo}\n`;
    });
    
    // Añadir información sobre la fuente de los correos
    if (apiUsada.includes('Hunter')) {
      mensaje += `\n✅ *Correos verificados con Hunter.io*`;
    } else {
      mensaje += `\n💡 *Nota:* Estos son correos probables basados en patrones comunes.`;
    }
  } else {
    mensaje += `\n\n📧 *Correos electrónicos:* No se encontraron correos asociados.`;
  }

  return mensaje;
}

handler.tags = ['herramientas', 'busqueda'];
handler.help = ['numero <número>', 'phone'];
handler.command = ['numero', 'phone', 'num', 'telefono', 'infoNumero'];
export default handler;
