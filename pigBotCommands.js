const fs = require('fs');
const { URL_CHART } = require('./api/urls.js');
const callBinance = require('./api/callBinance.js');
const { contacts, intervals } = require('./store.js');
const { 
    pathToContacts, 
    regExpKeyI, 
    regExpKeyP, 
    regExpKeyL, 
    regExpKeyF, 
    regExpIds 
} = require('./variables.js');

let commands = {
    '/start': (req, res) => {
        var { id } = req.from;
        var msg = 'Привет!. Отправь команду <code>/help</code> чтобы узнать что я умею.';

        res.sendMessage(id, msg, { 
            parse_mode: 'HTML'
        }).catch(console.error); 
    },
    '/analize_hc': sendSummary.bind(null, { interval: '1h' }),
    '/analize_dc': sendSummary.bind(null, { interval: '1d' }),
    '/analize_wc': sendSummary.bind(null, { interval: '1w' }),
    '/analize_mc': sendSummary.bind(null, { interval: '1M' }),
    '/subscribe': (req, res) => {
        var { id } = req.from;
        var command = req.text;
        var props = {
            periodicity: command.match(regExpKeyP)?.[1],
            interval: command.match(regExpKeyI)?.[1],
            filter: command.match(regExpKeyF)?.[1].split(/,\s*/),
            limit: +command.match(regExpKeyL)?.[1] || undefined
        }
        console.log(props, command, command.match(regExpKeyF)?.[1])
        try {
            let [msg, sub] = addSub(id, props);
            res.sendMessage(id, msg).catch(console.error);
            if (sub) {
                activateSub(sub, req, res);
                let { interval, filter, limit } = sub;
                sendSummary({ interval, filter, limit }, req, res).catch(console.error);
                sub.lastMsgTime = new Date();
                updateBase();
            }
        } catch (error) {
            console.error(error.messages);
        }
    
        function addSub(contactId, {
            interval, 
            periodicity,
            filter = ['1', '2', '3', '4', '5'],
            limit = 100
        }) {
            if (!interval || !periodicity) return ['Недостаточно данных для подписки!'];
            
            try {
                // проверка наличия контакта и подписки
                let contact = getContact(contacts, contactId);
                if (!contact) {
                    contact = { id: contactId, subscriptions: [] };
                    contacts.push(contact);
                }
        
                let isSubscriptionExist = contact.subscriptions.find((subscription) => (
                        subscription.interval === interval && 
                        subscription.periodicity === periodicity &&
                        subscription.limit === limit &&
                        compareArray(subscription.filter, filter)
                ));
        
                // обновление БД
                if (!isSubscriptionExist) {
                    let lastSub = contact.subscriptions.at(-1);
                    let subscription = {
                        id: lastSub ? (+lastSub.id + 1).toString() : '1',
                        interval,
                        filter ,
                        periodicity,
                        limit,
                    };
                    contact.subscriptions.push(subscription);
                    updateBase();
        
                    return ['Подписка оформлена.', subscription];
                }
        
                return ['Такая подписка была оформлена ранее.'];
            } catch (error) {
                throw error;
            }
        
            function compareArray(f1, f2) {
                let f1Copy = [...f1], f2Copy = [...f2];
                (f1Copy.sort(), f2Copy.sort());
                return JSON.stringify(f1Copy) === JSON.stringify(f2Copy);
            }
        }
    },
    '/unsubscribe': (req, res) => {
        var { id } = req.from;
        var command = req.text;
        var props = command.match(regExpIds)?.[1].split(/,\s*/);
    
        try {
            let [msg, deletedSubs] = deleteSub(id, props);
            res.sendMessage(id, msg).catch(console.error);
            deletedSubs.forEach((sub) => {
                let intervalId = intervals.get(sub);
                clearInterval(intervalId);
            });
        } catch (error) {
            throw error;
        }
    
        function deleteSub(contactId, ids) {
            if (!ids || !ids.length) return ['Не передано ни одного id подписки для удаления!'];
        
            let subscriptions = getContact(contacts, contactId).subscriptions;
            
            let deletedSubs = [];
            for (let id of ids) {
                let i = subscriptions.findIndex((item) => item.id === id);
                i >= 0 && deletedSubs.push((subscriptions.splice(i, 1))[0]);
            }
        
            // обновим базу
            try {
                updateBase();    
                return ids.length > 1 ? 
                    [`${deletedSubs.length} из ${ids.length} подписок удалены.`, deletedSubs] : 
                    ['Подписка удалена.', deletedSubs];
            } catch (error) {
                throw error;
            }
        }
    },
    '/help': (req, res) => {
        var { id } = req.from;
        var msg = '<b>Бот информирует о положении свечей криптовалют, торгуемых за USDT и ' +
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
            '   <i>5 - Свеча рядом со средней линией Боллиндженра</i>';

        res.sendMessage(id, msg, { 
            parse_mode: 'HTML'
        }).catch(console.error); 
    }
}

async function sendSummary(props, req, res) {
    var { id } = req.from;
    var command = req.text;
    var mixin = { ...props };
    mixin.limit = mixin.limit || +command.match(regExpKeyL)?.[1] || undefined;
    mixin.filter = mixin.filter || command.match(regExpKeyF)?.[1].split(/,\s*/);

    try {
        var messages = await analizeChart(mixin);
        for (let msg of messages) {
            await res.sendMessage(id, msg, { 
                parse_mode: 'HTML', 
                disable_web_page_preview: true 
            });
        }
    } catch(error) {
        res.sendMessage(id, error.message);
        console.error(error);
    }

    async function analizeChart({ 
        interval,
        limit = 100, 
        filter = ['1', '2', '3', '4', '5'], 
        maxMessageLength = 4096,
    }) {
        try {
            if (!limit || !filter) return ['С командой переданы неверные агрументы!'];
    
            let info = await callBinance({
                limit,
                interval
            });
    
            // создание сообщения по с парами, по которым не удалось получить информацию
            let msg = '';
            let header = '<b>По следующим парам не удалось получить информацию: </b>';
            let messages = [];
            info.unsuccessful.forEach((item) => {
                msg += `<a href="${URL_CHART}/${item.slice(0,-4)}_USDT?type=spot">${item}</a>, `
            });
            msg && messages.push(header + msg.replace(/, $/, '.'));
            
            // создание сообщения
            msg = ''
            info.successful.forEach((item) => {
                if (!filter.includes(item.messageCode)) return;
                msg += `<a href="${item.chart}">${item.symbol}</a>\n<b>${item.msg}</b>\nЦена: ${item.currentPrice}\nОбъём за 24ч(USD): ${item.quoteVolume}\nОтклонение цены от линии Боллинджера(%): ${item.diviation}\n\n`;
            });
    
            header = `<b>Анализ свечного графика(${interval})</b>\n\n`;
            if (msg.length + header.length <= maxMessageLength) {
                msg && messages.push(header + msg);
                return messages;
            };
            
            // разбивка сообщения на несколько частей в случае превышения максимально допустимой длины
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
}

function getContact(data, contactId) {
    return data.find((contact) => contact.id === contactId);
}

function convertTimeToMs(time) {
    let factors = {
        's': 1000,
        'm': 60000,
        'h': 3600000,
        'd': 86400000
    };

    let digit = time?.match(/\d+/)?.[0];
    return digit * factors[time?.match(/[s, m, h, d]$/)?.[0]];
}

function updateBase() {
    try {
        fs.writeFileSync(pathToContacts, JSON.stringify(contacts, null, 4));
    } catch(error) {
        throw error;
    }
}

function activateSub(sub, req, res) {
    let { periodicity, interval, filter, limit } = sub;
    let delay = convertTimeToMs(periodicity);
    let intervalId = setInterval(() => {
        try {
            sendSummary({ interval, filter, limit }, req, res).catch(console.error);
            sub.lastMsgTime = new Date();
            updateBase();
        } catch(error) {
            console.error(error.message);
        }
    }, delay);
    intervals.set(sub, intervalId);
}

module.exports =  { commands, activateSub, convertTimeToMs, sendSummary, updateBase };