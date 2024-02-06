const fs = require('fs');
const commands = require('./pigBotCommands.js');
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.API_KEY_BOT, {
    polling: {
      interval: 1000,
      autoStart: true
    }
});

let pathToContacts = './contacts.json';
let contacts = JSON.parse(fs.readFileSync(pathToContacts));
contacts.forEach(greet);

let menu = [
    {
        command: 'start',
        description: 'Запуск бота'
    },
    {
        command: 'analize_hc',
        description: 'Узнать положение свечи относительно индикатора BOLL на графике с интервалом 1h'
    },
    {
        command: 'analize_dc',
        description: 'Узнать положение свечи относительно индикатора BOLL на графике с интервалом 1d'
    },
    {
        command: 'analize_wc',
        description: 'Узнать положение свечи относительно индикатора BOLL на графике с интервалом 1w'
    },
    {
        command: 'help',
        description: 'Узнать положение свечи относительно индикатора BOLL на графике с интервалом 1d'
    }
];
bot.setMyCommands(menu);

bot.on('text', async (msg) => {
    let { id } = msg.from;

    try {
        let command = msg.text;
        let argument;
        if (command === 'start') {
            argument = contacts;
        } else {
            let keyLimit = '-l', keyFilter = '-f';
            let startL = command.indexOf((item) => item === '-l');
            let startF = command.indexOf((item) => item === '-f');

            argument = { 
                limit: startL > 1 ? command.slice(startL + keyLimit.length + 1) : 100,
                filter: startF > 1 ? command.slice(start + keyFilter.length + 1).split(',') : [1, 2, 3, 4, 5],
            };
        }

        let messages = await commands[command]?.(argument);
        messages?.forEach((msg) => bot.sendMessage(id, msg, { 
            parse_mode: 'HTML', 
            disable_web_page_preview: true 
        }))
    } catch(error) {
        console.error(error)
    }
});

bot.on('polling_error', err => console.log(err.data.error.message));

function greet(id) {
    bot.sendMessage(id, 'Hello');
}