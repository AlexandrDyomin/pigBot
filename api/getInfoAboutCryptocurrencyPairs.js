async function getInfoAboutCryptocurrencyPairs({ url, quotedCoin, order,  limit, orderFunc='desc'}) {
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
}

async function getMarketInfo(url) {
    try {
        let response = await fetch(url, { signal: AbortSignal.timeout(2000) });
        if (!response.ok) return [];
        return await response.json();
    } catch(error) {
        if (error.name === 'TimeoutError') {
            console.error('Запрос на получение данных отменен. Ожидание ответа сервера более 2000 мс');
        } else {
            console.error('Не удалось получить ответ:', error);
        }

        return getMarketInfo(url);
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