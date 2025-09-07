import axios from 'axios';
import fs from 'fs';

const usuariosPath = './src/database/usuarios.json';

// Misiones (debes tener el mismo array que en misiones.js)
const MISIONES = [
  {
    id: 1,
    nombre: "🌿 Captura Básica",
    descripcion: "Captura 3 Pokémon comunes",
    objetivo: { tipo: 'capturas', cantidad: 3, rareza: 'comun' },
    recompensa: { dinero: 50, experiencia: 10 },
    duracion: 30
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

let handler = async (m, { conn }) => {
  try {
    const sender = m.sender;
    const usuarios = leerUsuarios();
    const LIMITE_POKEMONES = 5;

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

    // Verificar límite de Pokémon
    if (usuarios[sender].pokemons.length >= LIMITE_POKEMONES) {
      return await conn.sendMessage(m.chat, { 
        text: `❌ *¡Límite alcanzado!*\n\nSolo puedes tener un máximo de ${LIMITE_POKEMONES} Pokémon en tu colección.\n\nUsa *.liberar* [número] para liberar alguno y dejar espacio.` 
      }, { quoted: m });
    }

    let mensajeCaptura = await conn.sendMessage(m.chat, { 
      text: '🎣 *Lanzando Pokébola...*' 
    }, { quoted: m });

    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await conn.relayMessage(m.chat, {
      protocolMessage: {
        key: mensajeCaptura.key,
        type: 14,
        editedMessage: {
          conversation: '⚡ *¡Pokébola en movimiento!*'
        }
      }
    }, {});

    await new Promise(resolve => setTimeout(resolve, 1500));
    
    await conn.relayMessage(m.chat, {
      protocolMessage: {
        key: mensajeCaptura.key,
        type: 14,
        editedMessage: {
          conversation: '✨ *La Pokébola se está agitando...*'
        }
      }
    }, {});

    await new Promise(resolve => setTimeout(resolve, 2000));

    const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1000');
    const pokemons = response.data.results;
    const randomPokemon = pokemons[Math.floor(Math.random() * pokemons.length)];
    const pokemonData = await axios.get(randomPokemon.url);
    
    const pokemonName = pokemonData.data.name.charAt(0).toUpperCase() + pokemonData.data.name.slice(1);
    const pokemonImage = pokemonData.data.sprites.other['official-artwork']?.front_default || 
                         pokemonData.data.sprites.front_default;

    // CALCULAR RAREZA
    const totalStats = Object.values(pokemonData.data.stats).reduce((acc, stat) => acc + stat.base_stat, 0);
    let rareza = '⭐ Común';
    let rarezaTipo = 'comun';
    if (totalStats > 400) {
      rareza = '🌟🌟 Raro';
      rarezaTipo = 'raro';
    }
    if (totalStats > 500) {
      rareza = '🌟🌟🌟 Épico';
      rarezaTipo = 'epico';
    }
    if (totalStats > 600) {
      rareza = '💎💎💎 Legendario';
      rarezaTipo = 'legendario';
    }

    // OBJETO POKÉMON COMPATIBLE CON POKÉDEX
    const pokemonCapturado = {
      id: pokemonData.data.id,
      name: pokemonName,
      nombre: pokemonName, // ← PROPiedad que busca Pokédex
      image: pokemonImage,
      imagen: pokemonImage, // ← PROPiedad que busca Pokédex
      height: pokemonData.data.height / 10,
      weight: pokemonData.data.weight / 10,
      types: pokemonData.data.types.map(t => t.type.name),
      tipos: pokemonData.data.types.map(t => t.type.name), // ← PROPiedad que busca Pokédex
      captured: new Date().toLocaleDateString(),
      rareza: rarezaTipo, // ← PROPiedad que busca Pokédex
      idUnico: Date.now() + '-' + Math.random().toString(36).substr(2, 9), // ← ID único para Pokédex
      stats: pokemonData.data.stats.reduce((acc, stat) => {
        acc[stat.stat.name] = stat.base_stat;
        return acc;
      }, {})
    };

    // AGREGAR POKÉMON A LA COLECCIÓN
    usuarios[sender].pokemons.push(pokemonCapturado);

    // ✅ SISTEMA DE MISIONES - VERIFICAR Y ACTUALIZAR
    const usuario = usuarios[sender];
    let misionesCompletadas = [];

    if (usuario.misiones && usuario.misiones.length > 0) {
      for (const mision of usuario.misiones) {
        const misionData = MISIONES.find(m => m.id === mision.id);
        
        if (misionData && misionData.objetivo.tipo === 'capturas') {
          // Verificar si la rareza coincide con la misión
          if (misionData.objetivo.rareza === rarezaTipo) {
            mision.progreso = (mision.progreso || 0) + 1;
            
            // Verificar si completó la misión
            if (mision.progreso >= misionData.objetivo.cantidad) {
              // Dar recompensa
              usuario.dinero += misionData.recompensa.dinero;
              usuario.experiencia += misionData.recompensa.experiencia;
              
              // Agregar a misiones completadas
              misionesCompletadas.push(misionData);
              
              // Remover misión completada
              usuario.misiones = usuario.misiones.filter(m => m.id !== mision.id);
            }
          }
        }
      }
    }

    // GUARDAR CAMBIOS
    guardarUsuarios(usuarios);

    // MENSAJE DE CAPTURA EXITOSA
    let mensajeFinal = `🎊 *¡POKÉMON CAPTURADO!*\n\n🌟 *Nombre:* ${pokemonName}\n📊 *Rareza:* ${rareza}\n📏 *Altura:* ${pokemonCapturado.height}m\n⚖️ *Peso:* ${pokemonCapturado.weight}kg\n❤️ *HP:* ${pokemonCapturado.stats.hp}\n⚔️ *Ataque:* ${pokemonCapturado.stats.attack}\n🛡️ *Defensa:* ${pokemonCapturado.stats.defense}\n🌀 *Tipo:* ${pokemonCapturado.types.join(' / ').toUpperCase()}\n📅 *Capturado:* ${pokemonCapturado.captured}\n\n¡Agregado a tu Pokédex! 🎯 (${usuario.pokemons.length}/${LIMITE_POKEMONES})`;

    // AGREGAR INFO DE DINERO SI TIENE MISIONES ACTIVAS
    if (usuario.misiones && usuario.misiones.length > 0) {
      mensajeFinal += `\n💰 *Dinero:* ${usuario.dinero}`;
    }

    // ENVIAR MENSAJE DE CAPTURA
    if (!pokemonImage) {
      await conn.relayMessage(m.chat, {
        protocolMessage: {
          key: mensajeCaptura.key,
          type: 14,
          editedMessage: {
            conversation: `🎊 *¡CAPTURADO!*\n\n🌟 *${pokemonName}* - ${rareza}\n❌ No tiene imagen disponible\n\n¡Agregado a tu Pokédex! (${usuario.pokemons.length}/${LIMITE_POKEMONES})`
          }
        }
      }, {});
    } else {
      await conn.sendFile(
        m.chat, 
        pokemonImage, 
        'pokemon.png', 
        mensajeFinal,
        m
      );
    }

    // ENVIAR MENSAJES DE MISIONES COMPLETADAS
    if (misionesCompletadas.length > 0) {
      for (const mision of misionesCompletadas) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await conn.sendMessage(m.chat, {
          text: `🎉 *¡MISIÓN COMPLETADA!*\n\n${mision.nombre}\n📝 ${mision.descripcion}\n💰 *Recompensa:* +${mision.recompensa.dinero} dinero\n⭐ *Experiencia:* +${mision.recompensa.experiencia} XP\n\n¡Felicidades! 🎯`
        }, { quoted: m });
      }
    }

    // VERIFICAR MISIÓN DE DINERO (si ganó dinero por captura)
    if (usuario.misiones && usuario.misiones.length > 0) {
      const ahora = Date.now();
      for (const mision of usuario.misiones) {
        const misionData = MISIONES.find(m => m.id === mision.id);
        if (misionData && misionData.objetivo.tipo === 'dinero') {
          // Simular ganancia de dinero por captura (10-30 dinero)
          const ganancia = Math.floor(Math.random() * 21) + 10;
          usuario.dinero += ganancia;
          mision.progreso = (mision.progreso || 0) + ganancia;
          
          // Verificar si completó la misión de dinero
          if (mision.progreso >= misionData.objetivo.cantidad) {
            usuario.dinero += misionData.recompensa.dinero;
            usuario.experiencia += misionData.recompensa.experiencia;
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            await conn.sendMessage(m.chat, {
              text: `🎉 *¡MISIÓN COMPLETADA!*\n\n${misionData.nombre}\n💰 *Recompensa:* +${misionData.recompensa.dinero} dinero\n⭐ *Experiencia:* +${misionData.recompensa.experiencia} XP\n\n¡Felicidades! 🎯`
            }, { quoted: m });
            
            usuario.misiones = usuario.misiones.filter(m => m.id !== mision.id);
          }
        }
      }
      guardarUsuarios(usuarios);
    }
    
  } catch (error) {
    console.error('Error en comando pokemon:', error);
    await m.reply('❌ *La Pokébola falló!* Ocurrió un error al intentar capturar el Pokémon. Intenta de nuevo.');
  }
};

handler.tags = ['game', 'pokemon'];
handler.help = ['pokemon'];
handler.command = ['pokemon', 'capturar', 'poke'];
export default handler;
