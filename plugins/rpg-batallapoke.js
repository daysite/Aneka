import fs from 'fs'
import path from 'path'

const usuariosPath = './src/database/usuarios.json'

// Asegurar que el directorio existe
function asegurarDirectorio(rutaArchivo) {
  const directorio = path.dirname(rutaArchivo);
  if (!fs.existsSync(directorio)) {
    fs.mkdirSync(directorio, { recursive: true });
  }
}

function leerUsuarios() {
  try {
    asegurarDirectorio(usuariosPath);
    if (!fs.existsSync(usuariosPath)) {
      fs.writeFileSync(usuariosPath, JSON.stringify({}, null, 2));
      return {};
    }
    
    const data = fs.readFileSync(usuariosPath, 'utf8')
    if (!data.trim()) {
      return {};
    }
    return JSON.parse(data) || {}
  } catch (error) {
    console.error('Error al leer usuarios:', error)
    return {}
  }
}

function guardarUsuarios(usuarios) {
  try {
    asegurarDirectorio(usuariosPath);
    fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2))
    return true;
  } catch (error) {
    console.error('Error al guardar usuarios:', error)
    return false;
  }
}

// Función MEJORADA para obtener Pokémon con más validaciones
function obtenerPokemonesUsuario(user) {
  console.log('🔍 Analizando usuario:', user?.id || 'sin id');
  
  if (!user) {
    console.log('❌ Usuario no definido');
    return [];
  }
  
  if (!user.pokemons) {
    console.log('❌ Usuario no tiene propiedad pokemons');
    user.pokemons = []; // Inicializar si no existe
    return [];
  }
  
  if (!Array.isArray(user.pokemons)) {
    console.log('❌ pokemons no es un array:', typeof user.pokemons);
    user.pokemons = []; // Corregir si no es array
    return [];
  }
  
  const pokemonesValidos = user.pokemons.filter(p => {
    const tieneNombre = p && p.nombre && p.nombre !== 'undefined' && p.nombre !== '';
    if (!tieneNombre) {
      console.log('⚠️ Pokémon inválido filtrado:', p);
    }
    return tieneNombre;
  });
  
  console.log(`✅ Pokémon válidos encontrados: ${pokemonesValidos.length} de ${user.pokemons.length}`);
  return pokemonesValidos;
}

function calcularPoder(pokemon) {
  if (!pokemon) return 0
  const stats = pokemon.stats || {}
  return (stats.hp || 50) + (stats.attack || 10) + (stats.defense || 5) + ((pokemon.nivel || 1) * 2)
}

// Función para verificar si un Pokémon puede pelear
function puedePelear(pokemon) {
  if (!pokemon) return false;
  
  // Si el Pokémon no tiene estado, puede pelear
  if (!pokemon.estado) return true;
  
  // Verificar estados que impiden pelear
  const estadosInvalidos = ['debilitado', 'cansado', 'dormido', 'congelado', 'paralizado'];
  return !estadosInvalidos.includes(pokemon.estado);
}

// Función MEJORADA para aplicar daño y estado después de la batalla
function aplicarEfectosBatalla(pokemon, esGanador) {
  if (!pokemon) return null;
  
  // Crear copia profunda para no modificar el original
  const pokemonModificado = JSON.parse(JSON.stringify(pokemon));
  
  // Asegurar que tenga las propiedades necesarias
  if (!pokemonModificado.estado) {
    pokemonModificado.estado = 'normal';
  }
  
  if (!pokemonModificado.experiencia) {
    pokemonModificado.experiencia = 0;
  }
  
  if (!pokemonModificado.nivel) {
    pokemonModificado.nivel = 1;
  }
  
  if (esGanador) {
    pokemonModificado.estado = 'cansado';
    pokemonModificado.experiencia += 25;
  } else {
    pokemonModificado.estado = 'debilitado';
    pokemonModificado.experiencia += 10;
  }
  
  // Verificar si sube de nivel
  if (pokemonModificado.experiencia >= 100) {
    pokemonModificado.nivel += 1;
    pokemonModificado.experiencia = 0;
  }
  
  return pokemonModificado;
}

function simularBatalla(pokeAtacante, pokeDefensor, userName, rivalName) {
  const poderAtacante = calcularPoder(pokeAtacante)
  const poderDefensor = calcularPoder(pokeDefensor)
  
  let resultado = `⚔️ *BATALLA POKÉMON* ⚔️\n\n`
  resultado += `👤 ${userName}\n`
  resultado += `🐾 ${pokeAtacante.nombre} (Nivel ${pokeAtacante.nivel || 1})`
  
  if (pokeAtacante.estado && pokeAtacante.estado !== 'normal') {
    resultado += ` [${pokeAtacante.estado.toUpperCase()}]`
  }
  
  resultado += `\n⚡ Poder: ${Math.round(poderAtacante)}\n\n`
  resultado += `🆚\n\n`
  resultado += `👤 ${rivalName}\n`
  resultado += `🐾 ${pokeDefensor.nombre} (Nivel ${pokeDefensor.nivel || 1})`
  
  if (pokeDefensor.estado && pokeDefensor.estado !== 'normal') {
    resultado += ` [${pokeDefensor.estado.toUpperCase()}]`
  }
  
  resultado += `\n⚡ Poder: ${Math.round(poderDefensor)}\n\n`
  
  resultado += `🎯 *INICIO DE BATALLA*:\n`
  resultado += `¡${pokeAtacante.nombre} usa ${obtenerAtaqueAleatorio(pokeAtacante.tipos)}!\n`
  resultado += `¡${pokeDefensor.nombre} contraataca con ${obtenerAtaqueAleatorio(pokeDefensor.tipos)}!\n\n`
  
  resultado += `🎯 *RESULTADO FINAL*:\n`
  
  let ganador = null;
  let perdedor = null;
  
  if (poderAtacante > poderDefensor) {
    resultado += `🎉 ¡${userName} gana la batalla!\n`
    resultado += `✨ ${pokeAtacante.nombre} ganó 25 EXP y está CANSADO\n`
    resultado += `😵 ${pokeDefensor.nombre} está DEBILITADO y ganó 10 EXP\n`
    ganador = pokeAtacante;
    perdedor = pokeDefensor;
  } else if (poderDefensor > poderAtacante) {
    resultado += `😵 ¡${rivalName} gana la batalla!\n`
    resultado += `✨ ${pokeDefensor.nombre} ganó 25 EXP y está CANSADO\n`
    resultado += `😵 ${pokeAtacante.nombre} está DEBILITADO y ganó 10 EXP\n`
    ganador = pokeDefensor;
    perdedor = pokeAtacante;
  } else {
    resultado += `🤝 ¡Empate! Ambos lucharon valientemente.\n`
    resultado += `✨ Ambos ganaron 15 EXP y quedaron CANSADOS\n`
  }
  
  resultado += `\n💡 *Estados:* CANSADO → recupera en 30 min | DEBILITADO → necesita curación`
  
  return { resultado, ganador, perdedor, empate: poderAtacante === poderDefensor }
}

function obtenerAtaqueAleatorio(tipos) {
  const ataquesComunes = ['Placaje', 'Gruñido', 'Arañazo', 'Destructor'];
  const ataquesPorTipo = {
    fuego: ['Lanzallamas', 'Ascuas', 'Giro Fuego', 'Infierno'],
    agua: ['Hidrobomba', 'Pistola Agua', 'Surf', 'Burbuja'],
    eléctrico: ['Impactrueno', 'Rayo', 'Trueno', 'Electrobola'],
    planta: ['Latigazo', 'Hoja Afilada', 'Rayo Solar', 'Drenadoras'],
    veneno: ['Ácido', 'Tóxico', 'Residuos', 'Bomba Lodo'],
    volador: ['Tornado', 'Ataque Aéreo', 'Picotazo', 'Remolino'],
  };
  
  if (!tipos || !Array.isArray(tipos) || tipos.length === 0) {
    return ataquesComunes[Math.floor(Math.random() * ataquesComunes.length)];
  }
  
  const primerTipo = tipos[0].toLowerCase();
  if (ataquesPorTipo[primerTipo]) {
    return ataquesPorTipo[primerTipo][Math.floor(Math.random() * ataquesPorTipo[primerTipo].length)];
  }
  
  return ataquesComunes[Math.floor(Math.random() * ataquesComunes.length)];
}

let handler = async (m, { conn, args, usedPrefix }) => {
  try {
    console.log('🎯 Iniciando comando pelear...');
    const usuarios = leerUsuarios();
    console.log('📊 Usuarios en DB:', Object.keys(usuarios).length);
    
    const userId = m.sender;
    console.log('👤 Usuario actual:', userId);
    
    if (!usuarios[userId]) {
      console.log('❌ Usuario no registrado');
      return m.reply('❌ No estás registrado. Usa *.registrar* primero.');
    }
    
    const user = usuarios[userId];
    const pokemonesUser = obtenerPokemonesUsuario(user);
    console.log('🐾 Pokémon del usuario:', pokemonesUser.length);
    
    if (pokemonesUser.length === 0) {
      return m.reply('❌ No tienes Pokémon capturados. Usa *.pokemon* para capturar alguno.');
    }

    if (args.length === 0) {
      let lista = `📋 *TUS POKÉMON* (${pokemonesUser.length})\n\n`;
      pokemonesUser.forEach((poke, index) => {
        const poder = Math.round(calcularPoder(poke));
        const estado = poke.estado && poke.estado !== 'normal' ? `[${poke.estado.toUpperCase()}]` : '';
        lista += `${index + 1}. ${poke.nombre} - Nvl ${poke.nivel || 1} ${estado} | ⚡ ${poder}\n`;
      });
      
      lista += `\n⚔️ *Para pelear:*\n`;
      lista += `${usedPrefix}pelear @usuario - Desafiar a alguien\n`;
      lista += `${usedPrefix}pelear 1 @usuario - Usar Pokémon 1\n`;
      lista += `\n💡 *Estados:*\n• CANSADO: Recupera en 30 min\n• DEBILITADO: Necesita curación\n• NORMAL: Listo para combatir`;
      
      return m.reply(lista);
    }

    // BUSCAR USUARIO MENCIONADO
    let mentionedJid = null;
    let pokemonIndex = 0;

    if (m.mentionedJid && m.mentionedJid.length > 0) {
      mentionedJid = m.mentionedJid[0];
      console.log('🎯 Usuario mencionado:', mentionedJid);
    }

    for (let i = 0; i < args.length; i++) {
      if (!isNaN(args[i]) && parseInt(args[i]) > 0) {
        pokemonIndex = parseInt(args[i]) - 1;
        break;
      }
    }

    if (!mentionedJid) {
      return m.reply(`❌ Debes mencionar a alguien.\nEjemplo: *${usedPrefix}pelear @usuario*`);
    }

    if (userId === mentionedJid) {
      return m.reply('❌ No puedes pelear contra ti mismo.');
    }

    // BUSCAR RIVAL
    const rivalId = mentionedJid;
    console.log('🥊 Buscando rival:', rivalId);
    
    let rival = usuarios[rivalId];
    if (!rival) {
      console.log('❌ Rival no encontrado en usuarios:', rivalId);
      console.log('Usuarios disponibles:', Object.keys(usuarios));
      return m.reply('❌ El usuario mencionado no está registrado en el sistema Pokémon.');
    }

    console.log('✅ Rival encontrado:', rival.nombre || 'sin nombre');
    console.log('🔍 Propiedades del rival:', Object.keys(rival));
    
    const pokemonesRival = obtenerPokemonesUsuario(rival);
    console.log('🐾 Pokémon del rival encontrados:', pokemonesRival.length);
    
    if (pokemonesRival.length === 0) {
      console.log('❌ Rival no tiene Pokémon válidos');
      console.log('Estructura completa del rival:', JSON.stringify(rival, null, 2));
      return m.reply('❌ El oponente no tiene Pokémon capturados.');
    }

    if (pokemonIndex < 0 || pokemonIndex >= pokemonesUser.length) {
      return m.reply(`❌ Pokémon inválido. Elige del 1 al ${pokemonesUser.length}.`);
    }

    const pokemonUser = pokemonesUser[pokemonIndex];
    console.log('⚡ Pokémon usuario seleccionado:', pokemonUser.nombre);
    
    if (!puedePelear(pokemonUser)) {
      return m.reply(`❌ *${pokemonUser.nombre}* no puede pelear ahora (Estado: ${pokemonUser.estado || 'desconocido'}).\n💡 Usa pociones o espera a que se recupere.`);
    }

    const pokemonesRivalDisponibles = pokemonesRival.filter(p => puedePelear(p));
    console.log('🎯 Pokémon rival disponibles:', pokemonesRivalDisponibles.length);
    
    if (pokemonesRivalDisponibles.length === 0) {
      return m.reply('❌ Tu rival no tiene Pokémon disponibles para pelear.');
    }
    
    const pokemonRival = pokemonesRivalDisponibles[Math.floor(Math.random() * pokemonesRivalDisponibles.length)];
    console.log('🥊 Pokémon rival seleccionado:', pokemonRival.nombre);
    
    const batalla = simularBatalla(
      pokemonUser,
      pokemonRival,
      user.nombre || conn.getName(userId),
      rival.nombre || conn.getName(rivalId)
    );
    
    if (!batalla.empate) {
      const pokemonUserModificado = aplicarEfectosBatalla(pokemonUser, batalla.ganador === pokemonUser);
      const pokemonRivalModificado = aplicarEfectosBatalla(pokemonRival, batalla.ganador === pokemonRival);
      
      // Actualizar Pokémon del usuario
      const userPokemonIndex = user.pokemons.findIndex(p => 
        p && pokemonUser && (p.idUnico === pokemonUser.idUnico || p.nombre === pokemonUser.nombre)
      );

      if (userPokemonIndex !== -1 && pokemonUserModificado) {
        user.pokemons[userPokemonIndex] = pokemonUserModificado;
      }

      // Actualizar Pokémon del rival
      const rivalPokemonIndex = rival.pokemons.findIndex(p => 
        p && pokemonRival && (p.idUnico === pokemonRival.idUnico || p.nombre === pokemonRival.nombre)
      );

      if (rivalPokemonIndex !== -1 && pokemonRivalModificado) {
        rival.pokemons[rivalPokemonIndex] = pokemonRivalModificado;
      }
      
      usuarios[userId] = user;
      usuarios[rivalId] = rival;
      guardarUsuarios(usuarios);
    }
    
    await m.reply(batalla.resultado);

  } catch (error) {
    console.error('💥 Error detallado en pelear:', error);
    console.error('📋 Stack trace:', error.stack);
    m.reply('❌ Error en la batalla. Revisa la consola para más detalles.');
  }
}

handler.help = ['pelear @usuario', 'pelear [número] @usuario']
handler.tags = ['pokemon', 'rpg']
handler.command = /^(pelear|batalla|battle)$/i
handler.register = true;

export default handler;
