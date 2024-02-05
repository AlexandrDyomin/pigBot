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
            interval: msg.text.replace('/', ''), 
            limit: 100,
            filter: [1, 2, 3, 4]
        });
        messages?.forEach((msg) => bot.sendMessage(id, msg, { 
            parse_mode: 'HTML', 
            disable_web_page_preview: true 
        }))
    } catch(e) {
        console.log(e)
    }
});

bot.on('polling_error', err => console.log(err.data.error.message));

contacts.forEach(greet);

function greet(id) {
    bot.sendMessage(id, 'Hello');
}