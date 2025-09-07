import fs from 'fs';
import path from 'path';

const usuariosPath = './src/database/usuarios.json';

// Función para leer usuarios
function leerUsuarios() {
  try {
    if (!fs.existsSync(usuariosPath)) {
      return {};
    }
    
    const data = fs.readFileSync(usuariosPath, 'utf8');
    return JSON.parse(data) || {};
  } catch (error) {
    console.error('Error al leer usuarios:', error);
    return {};
  }
}

let handler = async (m, { conn, usedPrefix, command, args }) => {
  try {
    const usuarios = leerUsuarios();
    const userId = m.sender;
    
    if (!usuarios[userId]) {
      return conn.sendMessage(m.chat, { 
        text: '❌ No estás registrado. Usa *.registrar* primero.' 
      }, { quoted: m });
    }
    
    const user = usuarios[userId];
    
    // Asegurarse de que la propiedad pokemons existe y es un array
    if (!user.pokemons || !Array.isArray(user.pokemons)) {
      user.pokemons = [];
    }
    
    // 🎯 SEGUNDA OPCIÓN: MOSTRAR TODOS LOS POKÉMON SIN FILTRAR
    const pokemonesValidos = user.pokemons;
    
    // COMANDO: verpokemon (sin argumentos - lista todos)
    if (args.length === 0) {
      if (pokemonesValidos.length === 0) {
        return conn.sendMessage(m.chat, { 
          text: `❌ *No tienes Pokémon en tu inventario.*\n\n🎯 Usa *${usedPrefix}pokemon* para capturar nuevos Pokémon!` 
        }, { quoted: m });
      }
      
      let listaPokemon = `📖 *POKÉDEX - ${user.pokemons.length} POKÉMON*\n\n`;
      
      pokemonesValidos.forEach((poke, index) => {
        // Usar nombre o name según lo que tenga el Pokémon
        const nombrePokemon = poke.nombre || poke.name || 'Desconocido';
        const emojiRareza = obtenerEmojiRareza(poke.rareza);
        listaPokemon += `${index + 1}. ${emojiRareza} ${nombrePokemon}\n`;
      });
      
      listaPokemon += `\n💡 *Usa ${usedPrefix}verpokemon [número] para ver detalles*\n`;
      listaPokemon += `*Ejemplo:* ${usedPrefix}verpokemon 1`;
      
      return conn.sendMessage(m.chat, { text: listaPokemon }, { quoted: m });
    }
    
    // COMANDO: verpokemon [número] (ver detalles específicos)
    if (args.length > 0) {
      const index = parseInt(args[0]) - 1;
      
      if (isNaN(index) || index < 0 || index >= pokemonesValidos.length) {
        return conn.sendMessage(m.chat, { 
          text: `❌ Número de Pokémon inválido. Usa *${usedPrefix}verpokemon* para ver la lista.` 
        }, { quoted: m });
      }
      
      const pokemon = pokemonesValidos[index];
      
      // Obtener nombre (compatible con ambas propiedades)
      const nombrePokemon = pokemon.nombre || pokemon.name || 'Desconocido';
      const emojiRareza = obtenerEmojiRareza(pokemon.rareza);
      
      let detalles = `📖 *DETALLES DE POKÉMON*\n\n`;
      detalles += `${emojiRareza} *${nombrePokemon}*\n\n`;
      detalles += `🆔 ID Único: ${pokemon.idUnico || 'N/A'}\n`;
      detalles += `📊 Nivel: ${pokemon.nivel || 1}\n`;
      
      // Tipos (compatible con ambas propiedades)
      if (pokemon.tipos || pokemon.types) {
        const tipos = Array.isArray(pokemon.tipos) ? pokemon.tipos : 
                     Array.isArray(pokemon.types) ? pokemon.types : ['Desconocido'];
        detalles += `🎯 Tipo: ${tipos.join(' / ').toUpperCase()}\n`;
      } else {
        detalles += `🎯 Tipo: Desconocido\n`;
      }
      
      detalles += `⭐ Rareza: ${pokemon.rareza || 'Común'}\n`;
      detalles += `📅 Capturado: ${pokemon.captured || 'Fecha desconocida'}\n\n`;
      
      // Estadísticas
      if (pokemon.stats) {
        detalles += `❤️ HP: ${pokemon.stats.hp || 0}\n`;
        detalles += `⚔️ Ataque: ${pokemon.stats.attack || 0}\n`;
        detalles += `🛡️ Defensa: ${pokemon.stats.defense || 0}\n`;
        detalles += `🏃 Velocidad: ${pokemon.stats.speed || 0}\n\n`;
      }
      
      detalles += `💡 Usa *${usedPrefix}pokemon* para ver más opciones`;
      
      // Intentar enviar con imagen si está disponible
      const imagenPokemon = pokemon.imagen || pokemon.image;
      if (imagenPokemon) {
        try {
          await conn.sendFile(
            m.chat, 
            imagenPokemon, 
            'pokemon.png', 
            detalles, 
            m
          );
          return;
        } catch (error) {
          console.error('Error al enviar imagen, enviando solo texto:', error);
        }
      }
      
      return conn.sendMessage(m.chat, { text: detalles }, { quoted: m });
    }
    
  } catch (error) {
    console.error('Error en comando verpokemon:', error);
    return conn.sendMessage(m.chat, { 
      text: '❌ Error al cargar el Pokédex. Intenta nuevamente.' 
    }, { quoted: m });
  }
};

// Función para obtener emoji de rareza (debe coincidir con la de la tienda)
function obtenerEmojiRareza(rareza) {
  if (!rareza) return '📦';
  
  switch (rareza.toLowerCase()) {
    case 'común': return '⭐';
    case 'raro': return '🌟🌟';
    case 'épico': return '🌟🌟🌟';
    case 'legendario': return '💎💎💎';
    default: return '📦';
  }
}

handler.help = ['verpokemon', 'verpokemon [número]'];
handler.tags = ['pokemon'];
handler.command = /^(verpokemon|pokedex|dex)$/i;
handler.register = true;

export default handler;
