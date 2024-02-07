async function getBarsInfo({ url, symbol, interval, limit }) {
    try {
        let response = await fetch(
            `${url}?symbol=${symbol}&interval=${interval}&limit=${limit}`,
            { signal: AbortSignal.timeout(900) }
        );
        if (!response.ok) return [];
        return await response.json();
    } catch(error) {
        if (error.name === 'TimeoutError') {
            console.error(`Не удалось получить данные по свечам для ${symbol}. Ожидание ответа сервера более 900 мс`);
        } else {
            console.error(`Не удалось получить данные по свечам для ${symbol}`, error);
        }

        return getBarsInfo({ url, symbol, interval, limit });
    }
}

module.exports = getBarsInfo;