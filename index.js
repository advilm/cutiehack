const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
require('dotenv').config();

const commands = fs.readdirSync('commands').map(x => new (require(`./commands/${x}`))());

const rest = new REST({ version: '9' }).setToken(process.env.token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands('906563340686487612', '906565147005427734'),
            {
                body: commands.filter(x => x.slashCommand).map(x => {
                    return { name: x.name, description: x.description };
                })
            },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    commands.find(x => x.name === interaction.commandName)?.run(interaction);
});

client.on('messageCreate', async message => {
    let command;
    if (message.content.startsWith('!') && (command = commands.find(x => x.name === message.content.slice(1).split(' ')[0].toLowerCase()))) {
        command.run(message);
    }
});

client.login(process.env.token);