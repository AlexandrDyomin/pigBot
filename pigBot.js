const fs = require('fs');
const commands = require('./pigBotCommands.js');
const TelegramBot = require('node-telegram-bot-api');
const { argv } = require('process');

const bot = new TelegramBot(process.env.API_KEY_BOT, {
    polling: {
      interval: 1000,
      autoStart: true
    }
});

let pathToContacts = './subscribers.json';
let contacts;
let log;

try {
    contacts = JSON.parse(fs.readFileSync(pathToContacts));
    contacts.forEach(greet);
} catch (error) {
    console.error(error);
}

let menu = [
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
    try {
        let { id } = msg.from;
        let command = msg.text;
        let regExpKeyL = /-l\s(\d+)/;
        let regExpKeyF = /-f\s(\d(,\s*\d)*)/;
        let args = [{}];
        if (/^\/analize_[h, d, w]c/.test(command)) {
            if (command.length > command.match(/^\/analize_[h, d, w]c/)[0].length) {
                args = [{ 
                    limit: +command.match(regExpKeyL)?.[1],
                    filter: command.match(regExpKeyF)?.[1].split(/,\s*/),
                }];
            }
        }
            
        if (/^\/subscribe/.test(command)) {
            let regExpKeyI = /-i\s(1[h, d, w])/;
            let regExpKeyP = /-p\s(\d+[s, m, h, d])/;
            
            // let periodicity = command.match(regExpKeyP)?.[1];
            // let factors = {
            //     'm': 60000,
            //     'h': 3600000,
            //     'd': 86400000
            // };
            // let digit = periodicity?.match(/\d+/)?.[0];
            // let periodicityPerMs = digit * factors[periodicity?.match(/[m, h, d]$/)?.[0]];
            // let subscribtionId = setInterval(() => {
                
            // }, periodicityPerMs);
            args = [id, {
                periodicity: command.match(regExpKeyP)?.[1],
                interval: command.match(regExpKeyI)?.[1],
                filter: command.match(regExpKeyF)?.[1].split(/,\s*/) || ['1', '2', '3', '4', '5'],
                limit: +command.match(regExpKeyL)?.[1] || 100
            }];
        }

        if (/^\/unsubscribe/.test(command)) {
            let regExpIds = /(\d+(,\s*\d+)*)/;
            args = [id, command.match(regExpIds)?.[1].split(/,\s*/)];
        }
            
        command = command.match(/\/\w*/)?.[0];
            let messages = await commands[command]?.(...args) || [];
            for (let msg of messages) {
                await bot.sendMessage(id, msg, { 
                    parse_mode: 'HTML', 
                    disable_web_page_preview: true 
                });
            }
    } catch(error) {
        console.error(error);
    }
});

bot.on('polling_error', err => console.log(err.data.error.message));



function greet({ id }) {
    bot.sendMessage(id, 'Hello');
}