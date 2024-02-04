function analizePrice({ 
    beforePenultimatePrice,
    penultimatePrice,
    currentPrice,
    beforePenultimateBOLL, 
    penultimateBOLL, 
    currentBOLL, 
    toleranceLimit = 0.25
}) {
    let wasCrossedBl = beforePenultimatePrice > beforePenultimateBOLL.bl && penultimatePrice < penultimateBOLL.bl;
    let wasCrossedTl = beforePenultimatePrice > beforePenultimateBOLL.tl && penultimatePrice < penultimateBOLL.tl;
    let priceDeviation = (currentBOLL.tl - currentBOLL.bl) * toleranceLimit;
    let isPriceNearBl = currentPrice <= (currentBOLL.bl + priceDeviation);
    let isPriceNearTl = currentPrice >= (currentBOLL.tl - priceDeviation);
    
    let summary = {};
        
    if (wasCrossedBl) {
        summary.messageCode = 1;
        summary.msg = 'Цена закрытия предыдущей свечи ниже нижней линии Боллинджера';
        summary.diviation = caclDiviationFromLine('bl');
        return summary;
    }

    if (wasCrossedTl) {
        summary.messageCode = 2;
        summary.msg = 'Цена закрытия предыдущей свечи ниже верхней линии Боллинджера';
        summary.diviation = caclDiviationFromLine('tl');
        return summary;
    }

    if (isPriceNearBl) {
        summary.messageCode = 3;
        summary.msg = 'Текущая цена находится рядом с нижней линией Болиндженра';
        summary.diviation = caclDiviationFromLine('bl');
        return summary;
    }

    if (isPriceNearTl) {
        summary.messageCode = 4;
        summary.msg = 'Текущая цена находится рядом с верхней линией Болиндженра';
        summary.diviation = caclDiviationFromLine('tl');
        return summary;
    }

    summary.code = 5;
    summary.msg = 'Текущая цена находится радом со средней линией Болиндженра';
    summary.diviation = caclDiviationFromLine('ml');
    return summary;

    function caclDiviationFromLine(lineName) {
        return ((currentPrice - currentBOLL[lineName]) / currentBOLL[lineName]).toFixed(4);
    }
}   

export { analizePrice };