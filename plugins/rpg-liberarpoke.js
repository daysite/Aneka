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

let handler = async (m, { conn, usedPrefix, args }) => {
  try {
    const sender = m.sender;
    const usuarios = leerUsuarios();
    
    if (!usuarios[sender]) {
      return conn.sendMessage(m.chat, { 
        text: '❌ No estás registrado. Usa *.registrar* primero.' 
      }, { quoted: m });
    }
    
    const user = usuarios[sender];
    
    // Asegurarse de que pokemons es un array
    if (!user.pokemons || !Array.isArray(user.pokemons)) {
      user.pokemons = [];
    }
    
    if (user.pokemons.length === 0) {
      return conn.sendMessage(m.chat, { 
        text: '❌ No tienes Pokémon para liberar.' 
      }, { quoted: m });
    }
    
    if (args.length === 0) {
      let listaPokemon = `📋 *TUS POKÉMON (${user.pokemons.length})*\n\n`;
      
      user.pokemons.forEach((poke, index) => {
        // ✅ COMPATIBLE CON AMBAS PROPIEDADES
        const nombrePokemon = poke.nombre || poke.name || 'Desconocido';
        const emojiRareza = obtenerEmojiRareza(poke.rareza);
        listaPokemon += `${index + 1}. ${emojiRareza} ${nombrePokemon}\n`;
      });
      
      listaPokemon += `\n💡 *Usa ${usedPrefix}liberar [número] para liberar un Pokémon*`;
      listaPokemon += `\n*Ejemplo:* ${usedPrefix}liberar 1`;
      
      return conn.sendMessage(m.chat, { text: listaPokemon }, { quoted: m });
    }
    
    // LIBERAR POKÉMON ESPECÍFICO
    const index = parseInt(args[0]) - 1;
    
    if (isNaN(index) || index < 0 || index >= user.pokemons.length) {
      return conn.sendMessage(m.chat, { 
        text: `❌ Número inválido. Usa *${usedPrefix}liberar* para ver la lista.` 
      }, { quoted: m });
    }
    
    // ✅ COMPATIBLE CON AMBAS PROPIEDADES
    const pokemonLiberado = user.pokemons[index];
    const nombrePokemon = pokemonLiberado.nombre || pokemonLiberado.name || 'Desconocido';
    
    // Eliminar el Pokémon
    user.pokemons.splice(index, 1);
    guardarUsuarios(usuarios);
    
    await conn.sendMessage(m.chat, { 
      text: `🎉 *¡POKÉMON LIBERADO!*\n\n✨ *${nombrePokemon}* ha sido liberado.\n\n📊 *Pokémon restantes:* ${user.pokemons.length}` 
    }, { quoted: m });
    
  } catch (error) {
    console.error('Error en comando liberar:', error);
    await conn.sendMessage(m.chat, { 
      text: '❌ Error al liberar el Pokémon. Intenta nuevamente.' 
    }, { quoted: m });
  }
};

// Función para obtener emoji de rareza (misma que en Pokédex)
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

handler.help = ['liberar', 'liberar [número]'];
handler.tags = ['pokemon'];
handler.command = /^(liberar|release)$/i;
handler.register = true;

export default handler;
