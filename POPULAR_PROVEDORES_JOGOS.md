# 🎮 Popular Provedores e Jogos Automaticamente

Este script adiciona automaticamente os provedores e jogos mais populares ao banco de dados.

## 📋 Provedores Incluídos

- **Evolution** - Jogos ao vivo (Lightning Roulette, Crazy Time, etc.)
- **Pragmatic Play** - Slots populares (Gates of Olympus, Sweet Bonanza, etc.)
- **Play'n GO** - Slots clássicos (Book of Dead, Reactoonz, etc.)
- **NetEnt** - Slots famosos (Starburst, Gonzo's Quest, etc.)
- **Microgaming** - Slots com jackpot (Mega Moolah, etc.)
- **Red Tiger** - Jogos ao vivo e slots
- **Yggdrasil** - Slots inovadores
- **Quickspin** - Slots modernos
- **Push Gaming** - Slots únicos
- **BGaming** - Slots e jogos de cassino

## 🎯 Jogos Incluídos

O script adiciona automaticamente os jogos mais populares de cada provedor:

### Evolution (5 jogos)
- Lightning Roulette ⭐
- Lightning Dice ⭐
- Mega Ball
- Crazy Time ⭐
- Monopoly Live ⭐

### Pragmatic Play (8 jogos)
- Gates of Olympus ⭐
- Sweet Bonanza ⭐
- Big Bass Bonanza ⭐
- The Dog House
- Wild West Gold
- Joker Jewels
- Fruit Party
- Wolf Gold

### Play'n GO (4 jogos)
- Book of Dead ⭐
- Reactoonz ⭐
- Fire Joker
- Razor Shark

### NetEnt (4 jogos)
- Starburst ⭐
- Gonzo's Quest ⭐
- Dead or Alive 2
- Jumanji

### Microgaming (3 jogos)
- Mega Moolah ⭐
- Immortal Romance
- Thunderstruck II

### Red Tiger (3 jogos)
- Dragon Tiger ⭐
- Lightning Roulette ⭐
- Dream Catcher

### Yggdrasil (2 jogos)
- Valley of the Gods ⭐
- Vikings Go Berzerk

### Quickspin (2 jogos)
- Big Bad Wolf ⭐
- Sakura Fortune

### Push Gaming (2 jogos)
- Fat Rabbit ⭐
- Jammin Jars

### BGaming (2 jogos)
- Plinko ⭐
- Dice

⭐ = Jogo em destaque (featured)

## 🚀 Como Usar

### Opção 1: Via npm (Recomendado)

```bash
cd backend-api
npm run populate-providers-games
```

### Opção 2: Direto com Node.js

```bash
cd backend-api
node src/database/populate_providers_and_games.js
```

## ⚙️ Configuração

Certifique-se de que o arquivo `.env` está configurado com as credenciais do banco de dados:

```env
DB_HOST=seu-host
DB_PORT=3306
DB_USER=seu-usuario
DB_PASSWORD=sua-senha
DB_NAME=seu-banco
```

## 📝 O que o Script Faz

1. **Verifica conexão** com o banco de dados
2. **Adiciona provedores** (se não existirem)
3. **Adiciona jogos** (se não existirem)
4. **Evita duplicatas** - não adiciona se já existir
5. **Mostra relatório** de quantos itens foram adicionados

## ✅ Exemplo de Saída

```
🚀 Iniciando população de provedores e jogos...

✅ Conexão com banco de dados estabelecida

📦 Adicionando provedores...
  ✅ Provedor "Evolution" adicionado (ID: 1)
  ✅ Provedor "Pragmatic Play" adicionado (ID: 2)
  ...

🎮 Adicionando jogos...

  📂 Provedor: evolution (5 jogos)
    ✅ Jogo "Lightning Roulette" adicionado (ID: 1)
    ✅ Jogo "Lightning Dice" adicionado (ID: 2)
    ...

📊 Resumo:
  ✅ Jogos adicionados: 35
  ⏭️  Jogos já existentes: 0

✨ População concluída com sucesso!
```

## 🔄 Executar Novamente

O script é **seguro para executar múltiplas vezes**. Ele verifica se os itens já existem antes de adicionar, então você pode executar quantas vezes quiser sem criar duplicatas.

## 📝 Notas

- Os jogos são adicionados com **status ativo** por padrão
- Jogos marcados com ⭐ são definidos como **featured** (em destaque)
- Todos os jogos são configurados para aparecer na **homepage** (`show_home: true`)
- O campo `original` é definido como `1` (jogos originais do provedor)
- Uma imagem placeholder é usada para a capa (você pode atualizar depois pelo admin)

## 🎨 Personalizar

Para adicionar mais provedores ou jogos, edite o arquivo:
```
backend-api/src/database/populate_providers_and_games.js
```

Adicione novos itens nos arrays `providers` e `games`.

