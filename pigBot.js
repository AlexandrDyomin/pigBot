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
        description: 'Узнать положение свечи на графике с интервалом 1h'
    },
    {
        command: 'analize_dc',
        description: 'Узнать положение свечи на графике с интервалом 1d'
    },
    {
        command: 'analize_wc',
        description: 'Узнать положение свечи с интервалом 1w'
    },
    {
        command: 'help',
        description: 'Вызов справки'
    }
];
bot.setMyCommands(menu);

bot.on('text', async (msg) => {
    let { id } = msg.from;
    let command = msg.text;
    try {
        let arguments;
        if (command === '/start') {
            arguments = [contacts, id];
        } else {
            let regExpKeyL = /-l\s(\d*)/;
            let regExpKeyF = /-f\s(\d(,\s\d)*)/;
            arguments = [{ 
                limit: command.match(regExpKeyL)?.[1] || 100,
                filter: command.match(regExpKeyF)?.[1] || [1, 2, 3, 4, 5],
            }];
        }

        command = command.match(/\/\w*/)?.[0];
        let messages = await commands[command]?.(...arguments);
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