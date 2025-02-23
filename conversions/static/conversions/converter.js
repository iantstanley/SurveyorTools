document.addEventListener('DOMContentLoaded', function() {
    // Helper function to convert decimal to fraction
    function decimalToFraction(decimal, tolerance = 0.0001) {
        let denominator = 1;
        let numerator = decimal;
        let whole = Math.floor(numerator);
        numerator -= whole;

        let fraction = numerator;
        let prevFraction = 0;

        while (Math.abs(fraction - prevFraction) > tolerance) {
            denominator *= 2;
            prevFraction = fraction;
            fraction = Math.round(numerator * denominator) / denominator;
        }

        let gcd = (a, b) => b ? gcd(b, a % b) : a;
        let commonDivisor = gcd(Math.round(numerator * denominator), denominator);
        let simplifiedNumerator = Math.round(numerator * denominator) / commonDivisor;
        let simplifiedDenominator = denominator / commonDivisor;

        if (whole > 0) {
            return `${whole} ${simplifiedNumerator}/${simplifiedDenominator}`;
        } else if (simplifiedNumerator === 0) {
            return '';
        } else {
            return `${simplifiedNumerator}/${simplifiedDenominator}`;
        }
    }

    // Feet & Inches to Decimal Feet
    const feetInput = document.getElementById('feet');
    const inchesInput = document.getElementById('inches');
    const fractionInput = document.getElementById('fraction');
    const decimalFeetOutput = document.getElementById('decimal-feet');

    function updateDecimalFeet() {
        let feet = parseFloat(feetInput.value) || 0;
        let inches = parseFloat(inchesInput.value) || 0;
        let fraction = fractionInput.value.trim();
        let fractionValue = 0;

        if (fraction) {
            let [numerator, denominator] = fraction.split('/').map(Number);
            if (denominator && !isNaN(numerator) && !isNaN(denominator)) {
                fractionValue = numerator / denominator;
            }
        }

        let totalInches = inches + fractionValue;
        let decimalFeet = feet + (totalInches / 12);
        decimalFeetOutput.textContent = decimalFeet.toFixed(4);
    }

    feetInput.addEventListener('input', updateDecimalFeet);
    inchesInput.addEventListener('input', updateDecimalFeet);
    fractionInput.addEventListener('input', updateDecimalFeet);

    // Decimal Feet to Feet & Inches
    const decimalInput = document.getElementById('decimal');
    const feetOutput = document.getElementById('feet-output');
    const inchesOutput = document.getElementById('inches-output');

    function updateFeetInches() {
        let decimal = parseFloat(decimalInput.value) || 0;
        let feet = Math.floor(decimal);
        let inchesDecimal = (decimal - feet) * 12;
        let inchesWhole = Math.floor(inchesDecimal);
        let inchesFraction = inchesDecimal - inchesWhole;

        let fractionStr = '';
        if (inchesFraction > 0) {
            fractionStr = decimalToFraction(inchesFraction);
        }

        let inchesDisplay = inchesWhole > 0 ? `${inchesWhole}` : '';
        if (fractionStr) {
            inchesDisplay += inchesWhole > 0 ? ` ${fractionStr}` : fractionStr;
        } else if (inchesWhole === 0) {
            inchesDisplay = '0';
        }

        feetOutput.textContent = feet;
        inchesOutput.textContent = inchesDisplay;
    }

    decimalInput.addEventListener('input', updateFeetInches);

    // Square Feet to Acreage
    const squareFeetInput = document.getElementById('square-feet');
    const acreageInput = document.getElementById('acreage');

    function updateAcreage() {
        let squareFeet = parseFloat(squareFeetInput.value) || 0;
        let acreage = squareFeet / 43560;
        acreageInput.value = acreage.toFixed(4);
    }

    function updateSquareFeet() {
        let acreage = parseFloat(acreageInput.value) || 0;
        let squareFeet = acreage * 43560;
        squareFeetInput.value = squareFeet.toFixed(2);
    }

    squareFeetInput.addEventListener('input', updateAcreage);
    acreageInput.addEventListener('input', updateSquareFeet);

    // Chains to Feet
    const chainsInput = document.getElementById('chains');
    const chainsToFeetOutput = document.getElementById('chains-to-feet');

    function updateChainsToFeet() {
        let chains = parseFloat(chainsInput.value) || 0;
        let feet = chains * 66; // 1 chain = 66 feet
        chainsToFeetOutput.textContent = feet.toFixed(4);
    }

    chainsInput.addEventListener('input', updateChainsToFeet);

    // Rods to Feet
    const rodsInput = document.getElementById('rods');
    const rodsToFeetOutput = document.getElementById('rods-to-feet');

    function updateRodsToFeet() {
        let rods = parseFloat(rodsInput.value) || 0;
        let feet = rods * 16.5; // 1 rod = 16.5 feet
        rodsToFeetOutput.textContent = feet.toFixed(4);
    }

    rodsInput.addEventListener('input', updateRodsToFeet);

    // Links to Feet
    const linksInput = document.getElementById('links');
    const linksToFeetOutput = document.getElementById('links-to-feet');

    function updateLinksToFeet() {
        let links = parseFloat(linksInput.value) || 0;
        let feet = links * 0.66; // 1 link = 0.66 feet
        linksToFeetOutput.textContent = feet.toFixed(4);
    }

    linksInput.addEventListener('input', updateLinksToFeet);

    // Furlongs to Feet
    const furlongsInput = document.getElementById('furlongs');
    const furlongsToFeetOutput = document.getElementById('furlongs-to-feet');

    function updateFurlongsToFeet() {
        let furlongs = parseFloat(furlongsInput.value) || 0;
        let feet = furlongs * 660; // 1 furlong = 660 feet
        furlongsToFeetOutput.textContent = feet.toFixed(4);
    }

    furlongsInput.addEventListener('input', updateFurlongsToFeet);

    // Basic Calculator
    const calcDisplay = document.getElementById('calc-display');
    let expression = '';

    document.querySelectorAll('.calc-btn').forEach(button => {
        button.addEventListener('click', function() {
            const value = this.value;
            if (value === 'C') {
                expression = '';
                calcDisplay.value = '';
            } else if (value === '=') {
                try {
                    calcDisplay.value = eval(expression) || '';
                    expression = calcDisplay.value;
                } catch (error) {
                    calcDisplay.value = 'Error';
                    expression = '';
                }
            } else {
                expression += value;
                calcDisplay.value = expression;
            }
        });
    });

    // Clear All Button
    const clearButton = document.getElementById('clear');
    clearButton.addEventListener('click', function() {
        feetInput.value = '';
        inchesInput.value = '';
        fractionInput.value = '';
        decimalInput.value = '';
        squareFeetInput.value = '';
        acreageInput.value = '';
        chainsInput.value = '';
        rodsInput.value = '';
        linksInput.value = '';
        furlongsInput.value = '';
        calcDisplay.value = '';
        expression = '';
        decimalFeetOutput.textContent = '0.0000';
        feetOutput.textContent = '0';
        inchesOutput.textContent = '0';
        chainsToFeetOutput.textContent = '0.0000';
        rodsToFeetOutput.textContent = '0.0000';
        linksToFeetOutput.textContent = '0.0000';
        furlongsToFeetOutput.textContent = '0.0000';
    });

    // Tab Switching Functionality
    const tabs = document.querySelectorAll('.tabs a');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId + '-content').classList.add('active');
            console.log('Switched to tab:', tabId);
        });
    });

    // Ordinance Search Functionality
    const ordinanceSearch = document.getElementById('ordinance-search');
    const ordinanceList = document.querySelector('.ordinance-list');

    ordinanceSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        ordinanceList.querySelectorAll('li').forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(searchTerm) ? 'block' : 'none';
        });
    });

    // Initialize with Unit Conversion Suite active
    document.getElementById('unit-conversion-content').classList.add('active');
});