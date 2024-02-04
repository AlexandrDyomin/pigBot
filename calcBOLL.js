function calcBOLL(data, stdDevNumber = 2) {
    let ml = calcSMA(data);
    let closePriceIdx = 4; 
    let e = data.reduce((acc, item) => acc + (item[closePriceIdx] - ml)**2, 0);
    
    let stdDev = Math.sqrt(e / data.length);
    let tl = (ml + (stdDevNumber * stdDev));
    let bl = (ml - (stdDevNumber * stdDev));
    return { tl, ml, bl };
}

function calcSMA(data) {
    let closePriceIdx = 4; 
    return data.reduce((acc, item) => {
        return acc + parseFloat(item[closePriceIdx]) / data.length;
    }, 0);
}

export { calcBOLL };