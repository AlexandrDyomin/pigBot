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

bot.on('text', async (msg) => {
    let { id } = msg.from;

    try {
        let messages = await commands[msg.text]?.({
            limit: 100,
            filter: [3]
        });
        messages?.forEach((msg) => bot.sendMessage(id, msg, { 
            parse_mode: 'HTML', 
            disable_web_page_preview: true 
        }))
    } catch(error) {
        console.error(error)
    }
});

bot.on('polling_error', err => console.log(err.data.error.message));

let menu = [
    {
        command: 'start',
        description: 'Запуск бота'
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
]
bot.setMyCommands(menu);

contacts.forEach(greet);

function greet(id) {
    bot.sendMessage(id, 'Hello');
}