const callBinance = require('./api/callBinance.js');

let commands = {
    '/start': () => {
        bot.sendMessage(id, '<b>Вы запустили бота!</b><b>Yooo</b>', { parse_mode: 'HTML' });
        
        if (!contacts.includes(id)) {
            contacts.push(id);
            fs.writeFileSync(pathToContacts, JSON.stringify(contacts));
        }

    },
    '/analize_dc': prepareMessages.bind(null, '1d'),
    '/analize_wc': prepareMessages.bind(null, '1w'),
    '/help': ()=>{},
}

async function prepareMessages(interval, { limit = 100, maxMessageLength = 4096, filter }) {
    let info = await callBinance({
        limit,
        interval
    });
    let msg = `<b>Анализ свечного графика(${interval})</b>\n\n`;
    
    info.forEach((item) => {
        if (filter && !filter.includes(item.messageCode)) return;
        msg += `<a href="${item.chart}">${item.symbol}</a>\n<b>${item.msg}</b>\nЦена: ${item.currentPrice}\nОбъём за 24ч(USD): ${item.quoteVolume}\nОтклонение цены от линии Боллинджера(%): ${item.diviation}\n\n`;
    });

    let messages = [];
    if (msg.length <= maxMessageLength) {
        messages.push(msg);
        return messages;
    };
   
    let parts = msg.split('\n\n');
    let quantity = Math.ceil(msg.length / maxMessageLength);
    let step = Math.ceil(parts.length / quantity);
    for (let i = 0, start = i, stop = step; i < quantity; i++, start += step, stop *= 2) {
        let part = parts.slice(start, stop).join('\n\n');
        messages.push(part);
    }

    return messages;
}

module.exports = commands;