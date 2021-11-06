const Discord = require('discord.js');
const Command = require('../structures/Command.js');

let channels = new Set();

class Game extends Command {
    constructor() {
        super({
            name: 'game',
            description: 'Runs the game of the pig',
            slashCommand: false,
        });
    }

    async run(interaction) {
        if (channels.has(interaction.channel.id))
            return interaction.reply('You already have a game running in this channel.');
        channels.add(interaction.channel.id);

        const collector = interaction.channel.createMessageCollector({ time: 10000000 });

        const embed = new Discord.MessageEmbed()
            .setTitle('Instructions')
            .setDescription('Pig is a folk jeopardy dice game with simple rules: Two players race to reach 50 points.' +
                ' Each turn, a player repeatedly rolls a die until either a 1 ("pig") is rolled or the player holds and' +
                ' scores the sum of the rolls(i.e.the turn total).At any time during a player\'s turn, the player is faced with two decisions:\n\n' +
                '**roll** - if the player rolls\n' +
                '1: the player scores nothing and it becomes the opponents turn.\n' +
                '2 - 6: the number is added to the player\'s turn total and the player\'s turn continues.\n' +
                '**hold** - The turn total is added to the player\'s score and it becomes the opponent\'s turn.'
            ).setColor('#2f3136');
            
        
        // Phase 0 is people joining, phase 1 is the game start, and phase 2 is the game itself
        let phase = 0;
        let players = new Set();
        let scores;
        let currentScore = 0;

        interaction.channel.send({ embeds: [embed] });
        let message = await interaction.channel.send('Say **join** to play. Game will start in 15 seconds.\nCurrent Players: ');
        
        setTimeout(() => { phase = 1; collector.emit('collect', null);}, 15000);

        // which players turn it is
        let turn = 0;

        collector.on('collect', c => {
            if (c && c.author.id === c.client.user.id) return;
            
            if (c && c.content === 'end') collector.stop();
            else if (phase === 0) {
                if (c.content.toLowerCase() === 'join') {
                    players.add(c.author.id);
                    message.edit(message.content + '\n' + c.member.displayName);
                    c.delete();
                }
            } else if (phase === 1) {
                if (players.size < 2) {
                    interaction.channel.send('You need at least 2 players to play. Aborting game.');
                    collector.stop();
                } else {
                    interaction.channel.send('**Game started!**');
                    players = [...players];
                    scores = new Array(players.length).fill(0);
                    interaction.channel.send(`It is <@${players[0]}>'s turn.`);
                    phase = 2;
                }
            } else if (phase === 2 && c.author.id === players[turn]) {
                let char = c.content[0].toLowerCase();
                if (char === 'r') {
                    let rolled = (Math.random() * 6 | 0) + 1;
                    if (rolled > 1) {
                        currentScore += rolled;
                        if (scores[turn] + currentScore >= 50) {
                            interaction.channel.send(`You rolled a ${rolled}. Current score ${currentScore + scores[turn]}. <@${players[turn]}> won the game!`);
                            collector.stop();
                        }
                        interaction.channel.send('You rolled a ' + rolled + '. Current score ' + (currentScore + scores[turn]) + '. **R**oll or **H**old?');
                    } else {
                        interaction.channel.send('You rolled a 1. All points you gained this turn are lost.');
                        turn < players.length - 1 ? turn++ : turn = 0;
                        currentScore = 0;
                        interaction.channel.send('<@' + players[turn] + '>, You\'re up. **R**oll or **H**old?');
                    }
                } else if (char === 'h') {
                    scores[turn] += currentScore;
                    currentScore = 0;
                    if (scores[turn] >= 50) {
                        interaction.channel.send(`<@${players[turn]}> won the game!`);
                        collector.stop();
                    } else {
                        turn < players.length - 1 ? turn++ : turn = 0;
                        interaction.channel.send('You held. Moving on to next players turn.');
                        interaction.channel.send('<@' + players[turn] + '>, You\'re up. **R**oll or **H**old?');
                    }
                }
            }
        });

        collector.on('end', () => {
            interaction.channel.send('Game has ended.');
            channels.delete(interaction.channel.id);
        });
    }
}

module.exports = Game;