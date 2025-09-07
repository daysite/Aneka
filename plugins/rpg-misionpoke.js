// plugins/misiones.js
import fs from 'fs';

const usuariosPath = './src/database/usuarios.json';

function leerUsuarios() {
  try {
    const data = fs.readFileSync(usuariosPath, 'utf8');
    return JSON.parse(data) || {};
  } catch (error) {
    return {};
  }
}

function guardarUsuarios(usuarios) {
  fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));
}

// Tipos de misiones disponibles
const MISIONES = [
  {
    id: 1,
    nombre: "🌿 Captura Básica",
    descripcion: "Captura 3 Pokémon comunes",
    objetivo: { tipo: 'capturas', cantidad: 3, rareza: 'comun' },
    recompensa: { dinero: 50, experiencia: 10 },
    duracion: 30 // minutos
  },
  {
    id: 2,
    nombre: "⚔️ Cazador de Raros",
    descripcion: "Captura 1 Pokémon raro",
    objetivo: { tipo: 'capturas', cantidad: 1, rareza: 'raro' },
    recompensa: { dinero: 150, experiencia: 30 },
    duracion: 60
  },
  {
    id: 3,
    nombre: "💰 Recolector de Oro",
    descripcion: "Gana 200 de dinero",
    objetivo: { tipo: 'dinero', cantidad: 200 },
    recompensa: { dinero: 100, experiencia: 20 },
    duracion: 45
  },
  {
    id: 4,
    nombre: "🌟 Leyenda Viva",
    descripcion: "Captura 1 Pokémon legendario",
    objetivo: { tipo: 'capturas', cantidad: 1, rareza: 'legendario' },
    recompensa: { dinero: 500, experiencia: 100 },
    duracion: 120
  }
];

// Tienda de comida
const COMIDAS = [
  { id: 1, nombre: "🍎 Manzana", precio: 20, energia: 10 },
  { id: 2, nombre: "🍗 Pollo Asado", precio: 50, energia: 25 },
  { id: 3, nombre: "🍣 Sushi Pokémon", precio: 100, energia: 50 },
  { id: 4, nombre: "🎂 Torta Legendaria", precio: 200, energia: 100 }
];

let handler = async (m, { conn, args, command }) => {
  try {
    const sender = m.sender;
    const usuarios = leerUsuarios();
    
    // Inicializar usuario si no existe
    if (!usuarios[sender]) {
      usuarios[sender] = {
        pokemons: [],
        nombre: m.pushName || 'Usuario',
        dinero: 100,
        experiencia: 0,
        nivel: 1,
        misiones: [],
        inventario: [],
        ultimaMision: 0
      };
    }

    const usuario = usuarios[sender];

    // Subcomandos
    const subcomando = args[0]?.toLowerCase();

    switch (subcomando) {
      case 'ver':
        await verMisiones(conn, m, usuario);
        break;
      
      case 'aceptar':
        await aceptarMision(conn, m, usuario, usuarios, args[1]);
        break;
      
      case 'completadas':
        await verMisionesCompletadas(conn, m, usuario);
        break;
      
      case 'tienda':
        await verTienda(conn, m, usuario);
        break;
      
      case 'comprar':
        await comprarComida(conn, m, usuario, usuarios, args[1]);
        break;
      
      case 'inventario':
        await verInventario(conn, m, usuario);
        break;
      
      default:
        await mostrarMenuMisiones(conn, m);
    }

  } catch (error) {
    console.error('Error en comando misiones:', error);
    await m.reply('❌ *Error en el sistema de misiones.* Intenta de nuevo.');
  }
};

// Función para mostrar el menú principal
async function mostrarMenuMisiones(conn, m) {
  const menu = `🎯 *SISTEMA DE MISIONES POKÉMON* 🎯

💰 *Dinero:* Consulta tus fondos
🍎 *Tienda:* Compra comida para tus Pokémon
📋 *Misiones disponibles:* Completa objetivos

💡 *Comandos disponibles:*
.misiones ver - Ver misiones disponibles
.misiones aceptar [número] - Aceptar una misión
.misiones completadas - Ver misión actual
.misiones tienda - Ver tienda de comida
.misiones comprar [número] - Comprar comida
.misiones inventario - Ver tu inventario

¡Gana dinero y compra comida para tus aventuras!`;
  
  await conn.sendMessage(m.chat, { text: menu }, { quoted: m });
}

// Función para ver misiones disponibles
async function verMisiones(conn, m, usuario) {
  let mensaje = '📋 *MISIONES DISPONIBLES*\n\n';
  
  MISIONES.forEach((mision, index) => {
    const tieneMision = usuario.misiones.some(m => m.id === mision.id);
    const estado = tieneMision ? '✅ *ACEPTADA*' : '🟡 *DISPONIBLE*';
    
    mensaje += `${index + 1}. ${mision.nombre} ${estado}\n`;
    mensaje += `   📝 ${mision.descripcion}\n`;
    mensaje += `   🎯 Objetivo: ${obtenerTextoObjetivo(mision.objetivo)}\n`;
    mensaje += `   💰 Recompensa: ${mision.recompensa.dinero} dinero + ${mision.recompensa.experiencia} XP\n`;
    mensaje += `   ⏰ Tiempo: ${mision.duracion} minutos\n\n`;
  });
  
  mensaje += '💡 Usa *.misiones aceptar [número]* para aceptar una misión';
  
  await conn.sendMessage(m.chat, { text: mensaje }, { quoted: m });
}

// Función para aceptar misión
async function aceptarMision(conn, m, usuario, usuarios, argIndex) {
  const index = parseInt(argIndex) - 1;
  
  if (isNaN(index) || index < 0 || index >= MISIONES.length) {
    return await conn.sendMessage(m.chat, { 
      text: '❌ *Número de misión inválido.*\nUsa *.misiones ver* para ver los números.' 
    }, { quoted: m });
  }

  const misionElegida = MISIONES[index];
  
  // Verificar si ya tiene la misión
  if (usuario.misiones.some(m => m.id === misionElegida.id)) {
    return await conn.sendMessage(m.chat, { 
      text: '❌ *Ya tienes esta misión activa.*' 
    }, { quoted: m });
  }

  // Verificar cooldown entre misiones (5 minutos)
  const ahora = Date.now();
  const cooldown = 5 * 60 * 1000; // 5 minutos en milisegundos
  
  if (ahora - usuario.ultimaMision < cooldown) {
    const tiempoRestante = Math.ceil((cooldown - (ahora - usuario.ultimaMision)) / 60000);
    return await conn.sendMessage(m.chat, { 
      text: `⏰ *Debes esperar ${tiempoRestante} minutos* antes de aceptar otra misión.` 
    }, { quoted: m });
  }

  // Agregar misión al usuario
  usuario.misiones.push({
    id: misionElegida.id,
    progreso: 0,
    aceptada: ahora,
    expira: ahora + (misionElegida.duracion * 60 * 1000)
  });
  
  usuario.ultimaMision = ahora;
  guardarUsuarios(usuarios);

  await conn.sendMessage(m.chat, { 
    text: `✅ *¡Misión aceptada!*\n\n🎯 ${misionElegida.nombre}\n📝 ${misionElegida.descripcion}\n\n⏰ Tienes ${misionElegida.duracion} minutos para completarla!\n\nUsa *.pokemon* para capturar y avanzar en la misión.` 
  }, { quoted: m });
}

// Función para ver tienda
async function verTienda(conn, m, usuario) {
  let mensaje = `🛒 *TIENDA DE COMIDA* 🛒\n\n💰 *Tu dinero:* ${usuario.dinero}\n\n`;
  
  COMIDAS.forEach((comida, index) => {
    mensaje += `${index + 1}. ${comida.nombre}\n`;
    mensaje += `   ⚡ Energía: +${comida.energia}\n`;
    mensaje += `   💰 Precio: ${comida.precio} dinero\n\n`;
  });
  
  mensaje += '💡 Usa *.misiones comprar [número]* para comprar comida';
  
  await conn.sendMessage(m.chat, { text: mensaje }, { quoted: m });
}

// Función para comprar comida
async function comprarComida(conn, m, usuario, usuarios, argIndex) {
  const index = parseInt(argIndex) - 1;
  
  if (isNaN(index) || index < 0 || index >= COMIDAS.length) {
    return await conn.sendMessage(m.chat, { 
      text: '❌ *Número de producto inválido.*\nUsa *.misiones tienda* para ver los números.' 
    }, { quoted: m });
  }

  const comidaElegida = COMIDAS[index];
  
  if (usuario.dinero < comidaElegida.precio) {
    return await conn.sendMessage(m.chat, { 
      text: `❌ *No tienes suficiente dinero.*\nNecesitas ${comidaElegida.precio} dinero, pero solo tienes ${usuario.dinero}.` 
    }, { quoted: m });
  }

  // Realizar compra
  usuario.dinero -= comidaElegida.precio;
  
  // Agregar al inventario
  const itemExistente = usuario.inventario.find(item => item.id === comidaElegida.id);
  if (itemExistente) {
    itemExistente.cantidad += 1;
  } else {
    usuario.inventario.push({
      id: comidaElegida.id,
      nombre: comidaElegida.nombre,
      cantidad: 1,
      energia: comidaElegida.energia
    });
  }
  
  guardarUsuarios(usuarios);

  await conn.sendMessage(m.chat, { 
    text: `✅ *¡Compra exitosa!*\n\nHas comprado: ${comidaElegida.nombre}\n⚡ Energía: +${comidaElegida.energia}\n💰 Gastado: ${comidaElegida.precio} dinero\n💵 Saldo restante: ${usuario.dinero}\n\nUsa *.misiones inventario* para ver tus items.` 
  }, { quoted: m });
}

// Función para ver inventario
async function verInventario(conn, m, usuario) {
  if (usuario.inventario.length === 0) {
    return await conn.sendMessage(m.chat, { 
      text: '🎒 *Tu inventario está vacío.*\nVisita la tienda con *.misiones tienda*' 
    }, { quoted: m });
  }

  let mensaje = '🎒 *TU INVENTARIO* 🎒\n\n';
  
  usuario.inventario.forEach((item, index) => {
    mensaje += `${index + 1}. ${item.nombre}\n`;
    mensaje += `   ⚡ Energía: +${item.energia}\n`;
    mensaje += `   📦 Cantidad: ${item.cantidad}\n\n`;
  });
  
  mensaje += '💡 Próximamente: Usa comida para alimentar a tus Pokémon';
  
  await conn.sendMessage(m.chat, { text: mensaje }, { quoted: m });
}

// Función auxiliar para texto de objetivo
function obtenerTextoObjetivo(objetivo) {
  switch (objetivo.tipo) {
    case 'capturas':
      return `Capturar ${objetivo.cantidad} Pokémon ${objetivo.rareza.toUpperCase()}`;
    case 'dinero':
      return `Ganar ${objetivo.cantidad} dinero`;
    default:
      return 'Objetivo desconocido';
  }
}

handler.tags = ['game', 'pokemon', 'economy'];
handler.help = ['misiones [ver/aceptar/tienda/comprar/inventario]'];
handler.command = ['misiones', 'mision', 'quests'];
export default handler;
