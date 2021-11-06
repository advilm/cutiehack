const Command = require('../structures/Command.js');

class Ping extends Command {
    constructor() {
        super({
            name: 'ping',
            description: 'Sends pong',
            slashCommand: true,
        });
    }

    async run(interaction) {
        interaction.reply('Pong!');
    }
}

module.exports = Ping;