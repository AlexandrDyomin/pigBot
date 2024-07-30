const fs = require('fs');
const { contacts, intervals } = require('./store.js');
const { commands, activateSub, convertTimeToMs, sendSummary, updateBase } = require('./pigBotCommands.js');
const TelegramBot = require('node-telegram-bot-api');
const { pathToContacts } = require('./variables.js');


const bot = new TelegramBot(process.env.API_KEY_BOT, {
    polling: {
      interval: 1000,
      autoStart: true
    }
});

contacts.forEach((contact) => {
    var { id } = contact
    contact.subscriptions.forEach((subscription) => {
        var lastMsgTime = subscription.lastMsgTime.getTime();
        var now = Date.now();
        var periodicity = convertTimeToMs(subscription.periodicity);
        var timeSinceLastMessage = now - lastMsgTime;
        if (timeSinceLastMessage >= periodicity) return start();
        setTimeout(() => start(), periodicity - timeSinceLastMessage);

        function start() {
            let { interval, filter, limit } = subscription;
            sendSummary({ interval, filter, limit }, { from: { id } }, bot).catch(console.error);
            subscription.lastMsgTime = new Date();
            try {
                updateBase();
            } catch(error) {
                console.error(error.message);
            }
            activateSub(subscription, { from: { id } }, bot);
        }
    });
});

var menu = [
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
        command: 'analize_mc',
        description: 'Узнать положение свечи с интервалом 1M'
    },
    {
        command: 'show_subscription',
        description: 'Показать подписки'
    },
    {
        command: 'unsubscribe',
        description: 'Удалить все подписки'
    },
    {
        command: 'help',
        description: 'Вызов справки'
    }
];
bot.setMyCommands(menu);

bot.on('text', async (msg) => {
    try {
        commands[msg.text.match(/\/\w*/)?.[0]]?.(msg, bot);
    } catch(error) {
        bot.sendMessage(msg.from, error.message);
        console.error(error);
    }
});

bot.on('polling_error', err => console.log(err));