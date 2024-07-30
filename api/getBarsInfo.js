async function getBarsInfo({ url, symbol, interval, limit }, isSecondAttempt = false) {
    try {
        let response = await fetch(
            `${url}?symbol=${symbol}&interval=${interval}&limit=${limit}`,
            { signal: AbortSignal.timeout(10000) }
        );
        if (!response.ok) throw Error(`Статусный код ответа: ${response.ok}`);
        return await response.json();
    } catch(error) {
        if (isSecondAttempt) {
            throw Error(`Вторая попытка получить данные по свечам для ${symbol} закончились неудачей`);
        }
        if (error.name === 'TimeoutError') {
            console.error(`Запрос на получение данные по свечам для ${symbol} отменён. Ожидание ответа сервера более 9000 мс`);
        } else {
            console.error(`Не удалось получить данные по свечам для ${symbol}`);
        }

        return getBarsInfo({ url, symbol, interval, limit }, true);
    }
}

module.exports = getBarsInfo;