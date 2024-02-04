const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.API_KEY_BOT, {
    polling: {
      interval: 1000,
      autoStart: true
    }
});

let pathToContacts = './contacts.json';
let contacts = JSON.parse(fs.readFileSync(pathToContacts));

bot.on('text', msg => {
    let commands = {
        "/start": () => {
            let { id } = msg.from;
            bot.sendMessage(id, 'Вы запустили бота!');
            if (!contacts.includes(id)) {
                contacts.push(id);
                fs.writeFileSync(pathToContacts, JSON.stringify(contacts));
            }

        }
    }
    try {
        commands[msg.text]?.();
        console.log(msg)
    } catch(e) {
        console.log(e)
    }
});

bot.on("polling_error", err => console.log(err.data.error.message));


contacts.forEach(sendMsg);

function sendMsg(id) {
    bot.sendMessage(id, 'hello');
}