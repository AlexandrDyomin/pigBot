async function getBarsInfo({ url, symbol, interval, limit }) {
    try {
        let response = await fetch(`${url}?symbol=${symbol}&interval=${interval}&limit=${limit}`);
        if (!response.ok) return [];
        return await response.json();
    } catch(e) {
        console.log(e);
        return [];
    }
}
export { getBarsInfo };