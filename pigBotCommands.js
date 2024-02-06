const callBinance = require('./api/callBinance.js');

let commands = {
    '/start': (contacts, id) => {
        
        if (!contacts.includes(id)) {
            contacts.push(id);
            fs.writeFileSync(pathToContacts, JSON.stringify(contacts));
        }

        return ['Hi'];
    },
    '/analize_hc': analizeChart.bind(null, '1h'),
    '/analize_dc': analizeChart.bind(null, '1d'),
    '/analize_wc': analizeChart.bind(null, '1w'),
    '/help': () => {
        return ([
            '<b>Бот анализирует положение свечей криптовалютых пар(<i>X/USDT</i>), ' +
            'входящих в топ 100 по объему торгов(<i>в USD</i>) за 24 часа на бирже Binance, ' +
            'на графике относительно линий Боллинджера(<i>BOLL(21,2)</i>).</b>' + 
            '\n\n' +
            '<b>С командами <i>analize_*</i> можно передавать аргуметы:</b>\n' + 
            '   <i>-l количество криптовалют в топ-листе(по умолчанию -l 100)</i>\n' +
            '   <i>-f коды интересующих Вас положений свечи через запятую(по умолчанию -f 1, 2, 3, 4, 5)</i>' + 
            '\n\n' + 
            '<b>Коды сообщений:</b>\n' +
            '   <i>1 - Предыдущая свеча закрылась ниже нижней линии Боллинджера</i> \n' +
            '   <i>2 - Предыдущая свеча закрылась ниже верхней линии Боллинджера</i> \n' +
            '   <i>3 - Свеча рядом с нижней линией Боллиндженра</i> \n' +
            '   <i>4 - Свеча рядом с верхней линией Боллиндженра</i> \n' +
            '   <i>5 - Свеча рядом со средней линией Боллиндженра</i>'
        ]);
    }
}

async function analizeChart(interval, { limit = 100, maxMessageLength = 4096, filter = [1, 2, 3, 4, 5] }) {
    let info = await callBinance({
        limit,
        interval
    });
    let msg = '';
    
    info.forEach((item) => {
        if (!filter.includes(item.messageCode)) return;
        msg += `<a href="${item.chart}">${item.symbol}</a>\n<b>${item.msg}</b>\nЦена: ${item.currentPrice}\nОбъём за 24ч(USD): ${item.quoteVolume}\nОтклонение цены от линии Боллинджера(%): ${item.diviation}\n\n`;
    });

    let messages = [];
    let header = `<b>Анализ свечного графика(${interval})</b>\n\n`;
    if (msg.length <= maxMessageLength - header.length) {
        messages.push(header + msg);
        return messages;
    };
    
    let parts = msg.split('\n\n');
    let quantity = Math.ceil(msg.length / maxMessageLength);
    let step = Math.ceil(parts.length / quantity);
    for (let i = 0, start = i, stop = step; i < quantity; i++, start += step, stop *= 2) {
        let part = parts.slice(start, stop).join('\n\n');
        header = `<b>Анализ свечного графика(${interval})\nЧасть ${i + 1}</b>\n\n`;
        messages.push(header + part);
    }

    return messages;
}

module.exports = commands;