async function getInfoAboutCryptocurrencyPairs({ 
    url, 
    quotedCoin, 
    order,  
    limit, 
    orderFunc='desc'
}) {
    try {
        let orderDesc = (a, b) => b[order] - a[order];
        let orderAsc = (a, b) => a[order] - b[order];
        let orderFunctions = {
            asc: orderAsc,
            desc: orderDesc
        };
        let data = await getMarketInfo(url);
        let filteredPairs = filterByQuotedCryptocurrency(data, quotedCoin);
        order && filteredPairs.sort(orderFunctions[orderFunc]);
        return filteredPairs.slice(0, limit);
    } catch(error) {
        throw error;
    }
}

async function getMarketInfo(url, isSecondAttempt = false) {
    try {
        let response = await fetch(url, { signal: AbortSignal.timeout(1500) });
        if (!response.ok) throw Error(`Статусный код ответа: ${response.ok}`);
        return await response.json();
    } catch(error) {
        if (isSecondAttempt) {
            throw Error('Вторая попытка получить список криптовалют закончились неудачей');
        }

        if (error.name === 'TimeoutError') {
            console.error('Запрос на получение списка криптовалют отменен. Ожидание ответа сервера более 1500 мс');
        } else {
            console.error('Попытка получить список криптовалют закончились неудачей');
        }

        return getMarketInfo(url, true);
    }
}   

function filterByQuotedCryptocurrency(pairs, quotedCryptocurrency) {
    return  pairs.reduce((acc, item) => {
        if (!item.symbol.endsWith(quotedCryptocurrency)) return acc;
        acc.push(item);
        return acc;
    }, []);
}

module.exports = getInfoAboutCryptocurrencyPairs;