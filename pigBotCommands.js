const fs = require('fs');
const { URL_CHART } = require('./api/urls.js');
const callBinance = require('./api/callBinance.js');

let commands = {
    '/start': () => {
        return ['Привет!. Отправь команду <code>/help</code> чтобы узнать что я умею.'];
    },
    '/analize_hc': analizeChart.bind(null, '1h'),
    '/analize_dc': analizeChart.bind(null, '1d'),
    '/analize_wc': analizeChart.bind(null, '1w'),
    '/subscribe': subscribe,
    '/help': () => {
        return ([
            '<b>Бот информирует о положении свечей криптовалют, торгуемых за USDT и ' +
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

async function analizeChart(interval, { 
    limit = 100, 
    maxMessageLength = 4096, 
    filter = ['1', '2', '3', '4', '5'] 
}) {
    try {
        if (!limit || !filter) return ['С командой переданы неверные агрументы!'];

        let info = await callBinance({
            limit,
            interval
        });
        let msg = '';
        let header = '<b>По следующим парам не удалось получить информацию: </b>';
        let messages = [];
        info.unsuccessful.forEach((item) => {
            msg += `<a href="${URL_CHART}/${item.slice(0,-4)}_USDT?type=spot">${item}</a>, `
        });
        msg && messages.push(header + msg.replace(/, $/, '.'));
        
        msg = ''
        info.successful.forEach((item) => {
            if (!filter.includes(item.messageCode)) return;
            msg += `<a href="${item.chart}">${item.symbol}</a>\n<b>${item.msg}</b>\nЦена: ${item.currentPrice}\nОбъём за 24ч(USD): ${item.quoteVolume}\nОтклонение цены от линии Боллинджера(%): ${item.diviation}\n\n`;
        });

        if (msg.length <= maxMessageLength - header.length) {
            header = `<b>Анализ свечного графика(${interval})</b>\n\n`;
            msg && messages.push(header + msg);
            return messages;
        };
        
        let parts = msg.split('\n\n');
        let quantity = Math.ceil(msg.length / maxMessageLength);
        let step = Math.ceil(parts.length / quantity);
        for (let i = 0, start = i, stop = step; i < quantity; i++, start += step, stop += step) {
            let part = parts.slice(start, stop).join('\n\n');
            header = `<b>Анализ свечного графика(${interval})\nЧасть ${i + 1}</b>\n\n`;
            messages.push(header + part);
        }

        return messages;
    } catch(error) {
        throw error;
    }
}

async function subscribe(contactId, pathToContacts, {
    interval, 
    periodicity,
    filter = ['1', '2', '3', '4', '5'],
    limit = 100
}) {
    try {
        if (!interval || !periodicity) return ['Недостаточно данных для подписки!'];
       
        // запись в журнал
        let log = JSON.parse(fs.readFileSync(pathToContacts));
        let contact = log.find((item) => item.id === contactId);
        if (!contact) {
            contact = { id: contactId, subscriptions: [] };
            log.push(contact);
        }

        let isSubscriptionExist = contact.subscriptions.find((subscription) => (
                subscription.interval === interval && 
                subscription.periodicity === periodicity &&
                subscription.limit === limit &&
                compareArray(subscription.filter, filter
            )
        ));
        if (!isSubscriptionExist) {
            contact.subscriptions.push({
                id: contact.subscriptions.length + 1,
                interval,
                filter ,
                periodicity,
                limit,
            });

            fs.writeFileSync(pathToContacts, JSON.stringify(log));
            return ['Подписка оформлена'];
        }
        
        return ['Такая подписка была оформлена ранее'];
        
        function compareArray(f1, f2) {
            let f1Copy = [...f1], f2Copy = [...f2];
            (f1Copy.sort(), f2Copy.sort());
            return JSON.stringify(f1Copy) === JSON.stringify(f2Copy);
        }
    } catch (error) {
        throw error;
    }
}

module.exports = commands;