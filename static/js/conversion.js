document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality - Make selectors more specific to avoid conflicts
    setupTabs('.conversion-tabs .tab-button', '.conversion-content .tab-content');
    setupTabs('.reference-tabs .reference-tab-button', '.reference-content .reference-tab-content');
    
    // Fill the fraction reference table
    fillFractionReferenceTable();
    
    // Setup event listeners for conversions
    setupEventListeners();
    
    // Make sure we don't interfere with main tab navigation
    console.log('Conversion.js loaded - Setting up conversion tools only');
});

// Tab functionality
function setupTabs(tabSelector, contentSelector) {
    const tabs = document.querySelectorAll(tabSelector);
    const contents = document.querySelectorAll(contentSelector);
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const tabId = this.getAttribute('data-tab');
            const content = document.getElementById(tabId + '-tab');
            if (content) {
                content.classList.add('active');
            }
        });
    });
}

// Fill the fraction reference table
function fillFractionReferenceTable() {
    const table = document.getElementById('fraction-reference-table');
    if (!table) return;
    
    // Common fractions used in surveying
    const fractions = [
        { num: 1, den: 16 },
        { num: 1, den: 8 },
        { num: 3, den: 16 },
        { num: 1, den: 4 },
        { num: 5, den: 16 },
        { num: 3, den: 8 },
        { num: 7, den: 16 },
        { num: 1, den: 2 },
        { num: 9, den: 16 },
        { num: 5, den: 8 },
        { num: 11, den: 16 },
        { num: 3, den: 4 },
        { num: 13, den: 16 },
        { num: 7, den: 8 },
        { num: 15, den: 16 },
        { num: 1, den: 1 }
    ];
    
    // Add custom fractions often used by surveyors
    const customFractions = [
        { num: 1, den: 3 },
        { num: 2, den: 3 },
        { num: 1, den: 6 },
        { num: 5, den: 6 }
    ];
    
    // Combine and sort all fractions
    const allFractions = [...fractions, ...customFractions].sort((a, b) => {
        return (a.num / a.den) - (b.num / b.den);
    });
    
    allFractions.forEach(fraction => {
        const decimalInches = fraction.num / fraction.den;
        const decimalFeet = decimalInches / 12;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${fraction.num}/${fraction.den}</td>
            <td>${decimalInches.toFixed(6)}</td>
            <td>${decimalFeet.toFixed(6)}</td>
        `;
        table.appendChild(row);
    });
}

// Setup event listeners for conversions
function setupEventListeners() {
    // Feet, Inches & Fractions to Decimal Feet
    const convertToDecimalBtn = document.getElementById('convert-to-decimal-btn');
    if (convertToDecimalBtn) {
        convertToDecimalBtn.addEventListener('click', function() {
            const feet = parseFloat(document.getElementById('feet-input').value) || 0;
            const inches = parseFloat(document.getElementById('inches-input').value) || 0;
            const numerator = parseFloat(document.getElementById('fraction-numerator').value) || 0;
            const denominator = parseFloat(document.getElementById('fraction-denominator').value) || 1;
            
            const decimalFeet = feetInchesToDecimal(feet, inches, numerator, denominator);
            
            document.getElementById('decimal-feet-result').textContent = decimalFeet.toFixed(6);
        });
    }
    
    // Decimal Feet to Feet, Inches & Fractions
    const convertFromDecimalBtn = document.getElementById('convert-from-decimal-btn');
    if (convertFromDecimalBtn) {
        convertFromDecimalBtn.addEventListener('click', function() {
            const decimalFeet = parseFloat(document.getElementById('decimal-feet-input').value) || 0;
            const precision = parseInt(document.getElementById('fraction-precision').value) || 16;
            
            const { feet, inches, numerator, denominator } = decimalToFeetInches(decimalFeet, precision);
            
            document.getElementById('feet-result').textContent = feet;
            document.getElementById('inches-result').textContent = inches;
            document.getElementById('fraction-result').textContent = 
                numerator === 0 ? '0' : `${numerator}/${denominator}`;
        });
    }
    
    // Square Feet to Acres
    const convertToAcresBtn = document.getElementById('convert-to-acres-btn');
    if (convertToAcresBtn) {
        convertToAcresBtn.addEventListener('click', function() {
            const sqFeet = parseFloat(document.getElementById('sq-feet-input').value) || 0;
            const acres = sqFeet / 43560;
            
            document.getElementById('acres-result').textContent = acres.toFixed(6);
        });
    }
    
    // Acres to Square Feet
    const convertToSqFeetBtn = document.getElementById('convert-to-sq-feet-btn');
    if (convertToSqFeetBtn) {
        convertToSqFeetBtn.addEventListener('click', function() {
            const acres = parseFloat(document.getElementById('acres-input').value) || 0;
            const sqFeet = acres * 43560;
            
            document.getElementById('sq-feet-result').textContent = sqFeet.toFixed(2);
        });
    }
    
    // Degrees, Minutes, Seconds to Decimal Degrees
    const convertToDecDegreesBtn = document.getElementById('convert-to-dec-degrees-btn');
    if (convertToDecDegreesBtn) {
        convertToDecDegreesBtn.addEventListener('click', function() {
            const degrees = parseFloat(document.getElementById('degrees-input').value) || 0;
            const minutes = parseFloat(document.getElementById('minutes-input').value) || 0;
            const seconds = parseFloat(document.getElementById('seconds-input').value) || 0;
            
            const decimalDegrees = dmsToDecimal(degrees, minutes, seconds);
            
            document.getElementById('dec-degrees-result').textContent = decimalDegrees.toFixed(6) + '°';
        });
    }
    
    // Decimal Degrees to Degrees, Minutes, Seconds
    const convertFromDecDegreesBtn = document.getElementById('convert-from-dec-degrees-btn');
    if (convertFromDecDegreesBtn) {
        convertFromDecDegreesBtn.addEventListener('click', function() {
            const decimalDegrees = parseFloat(document.getElementById('dec-degrees-input').value) || 0;
            
            const { degrees, minutes, seconds } = decimalToDms(decimalDegrees);
            
            document.getElementById('dms-result').textContent = 
                `${degrees}° ${minutes}' ${seconds.toFixed(3)}"`;
        });
    }
    
    // Bearing to Azimuth
    const convertToAzimuthBtn = document.getElementById('convert-to-azimuth-btn');
    if (convertToAzimuthBtn) {
        convertToAzimuthBtn.addEventListener('click', function() {
            const quadrant = document.getElementById('bearing-quadrant').value;
            const degrees = parseFloat(document.getElementById('bearing-degrees').value) || 0;
            
            const azimuth = bearingToAzimuth(quadrant, degrees);
            
            document.getElementById('azimuth-result').textContent = azimuth.toFixed(4) + '°';
        });
    }
    
    // Azimuth to Bearing
    const convertToBearingBtn = document.getElementById('convert-to-bearing-btn');
    if (convertToBearingBtn) {
        convertToBearingBtn.addEventListener('click', function() {
            const azimuth = parseFloat(document.getElementById('azimuth-input').value) || 0;
            
            const { quadrant, degrees } = azimuthToBearing(azimuth);
            
            document.getElementById('bearing-result').textContent = 
                `${quadrant.charAt(0)} ${degrees.toFixed(4)}° ${quadrant.charAt(1)}`;
        });
    }
    
    // Length unit conversion
    const convertLengthBtn = document.getElementById('convert-length-btn');
    if (convertLengthBtn) {
        convertLengthBtn.addEventListener('click', function() {
            const value = parseFloat(document.getElementById('length-value').value) || 0;
            const fromUnit = document.getElementById('length-from-unit').value;
            const toUnit = document.getElementById('length-to-unit').value;
            
            const result = convertLength(value, fromUnit, toUnit);
            
            document.getElementById('length-result').textContent = result.toFixed(6);
            document.getElementById('length-result-unit').textContent = getUnitDisplayName(toUnit);
        });
    }
    
    // Area unit conversion
    const convertAreaBtn = document.getElementById('convert-area-btn');
    if (convertAreaBtn) {
        convertAreaBtn.addEventListener('click', function() {
            const value = parseFloat(document.getElementById('area-value').value) || 0;
            const fromUnit = document.getElementById('area-from-unit').value;
            const toUnit = document.getElementById('area-to-unit').value;
            
            const result = convertArea(value, fromUnit, toUnit);
            
            document.getElementById('area-result').textContent = result.toFixed(6);
            document.getElementById('area-result-unit').textContent = getUnitDisplayName(toUnit);
        });
    }
    
    // Clear All button
    const clearAllBtn = document.getElementById('clear-all');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', function() {
            // Clear all input fields
            document.querySelectorAll('input[type="number"]').forEach(input => {
                if (input.id.includes('input') || input.id.includes('value')) {
                    input.value = '0';
                }
            });
            
            // Reset all result displays
            document.querySelectorAll('.result-display span').forEach(span => {
                if (span.id.includes('result')) {
                    span.textContent = span.id.includes('degrees') ? '0.0000°' : 
                                      span.id.includes('dms') ? '0° 0\' 0.000"' : 
                                      span.id.includes('bearing') ? 'N 0.0000° E' : '0.0000';
                }
            });
        });
    }
}

// Convert feet, inches, and fractions to decimal feet
function feetInchesToDecimal(feet, inches, numerator, denominator) {
    // First convert everything to inches
    const totalInches = (feet * 12) + inches + (numerator / denominator);
    
    // Then convert inches to decimal feet with high precision
    return totalInches / 12;
}

// Convert decimal feet to feet, inches, and fractions
function decimalToFeetInches(decimalFeet, precision) {
    // Convert decimal feet to total inches
    const totalInches = decimalFeet * 12;
    
    // Extract whole feet
    const feet = Math.floor(decimalFeet);
    
    // Extract remaining inches
    const remainingInches = totalInches - (feet * 12);
    
    // Extract whole inches
    const inches = Math.floor(remainingInches);
    
    // Extract fractional inches and convert to specified precision
    const fractionalInches = remainingInches - inches;
    const { numerator, denominator } = findClosestFraction(fractionalInches, precision);
    
    // Handle cases where the fraction rounds up to 1
    if (numerator === denominator) {
        return {
            feet: feet,
            inches: inches + 1,
            numerator: 0,
            denominator: precision
        };
    }
    
    return {
        feet,
        inches,
        numerator,
        denominator
    };
}

// Find closest fraction with given denominator
function findClosestFraction(decimal, denominator) {
    if (decimal === 0) {
        return { numerator: 0, denominator };
    }
    
    // Calculate the exact numerator (may be a floating-point number)
    const exactNumerator = decimal * denominator;
    
    // Round to the nearest integer for accuracy
    const roundedNumerator = Math.round(exactNumerator);
    
    // Simplify the fraction if possible
    const gcd = findGCD(roundedNumerator, denominator);
    
    return {
        numerator: roundedNumerator / gcd,
        denominator: denominator / gcd
    };
}

// Find greatest common divisor (for fraction simplification)
function findGCD(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    
    if (b > a) {
        [a, b] = [b, a];
    }
    
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    
    return a;
}

// Convert degrees, minutes, seconds to decimal degrees
function dmsToDecimal(degrees, minutes, seconds) {
    const sign = degrees < 0 ? -1 : 1;
    degrees = Math.abs(degrees);
    
    return sign * (degrees + (minutes / 60) + (seconds / 3600));
}

// Convert decimal degrees to degrees, minutes, seconds
function decimalToDms(decimalDegrees) {
    const sign = decimalDegrees < 0 ? -1 : 1;
    decimalDegrees = Math.abs(decimalDegrees);
    
    const degrees = Math.floor(decimalDegrees);
    
    const minutesDecimal = (decimalDegrees - degrees) * 60;
    const minutes = Math.floor(minutesDecimal);
    
    const seconds = (minutesDecimal - minutes) * 60;
    
    return {
        degrees: sign * degrees,
        minutes,
        seconds
    };
}

// Convert bearing to azimuth
function bearingToAzimuth(quadrant, degrees) {
    if (degrees < 0 || degrees > 90) {
        degrees = degrees % 90;
    }
    
    switch (quadrant) {
        case 'NE':
            return degrees;
        case 'SE':
            return 180 - degrees;
        case 'SW':
            return 180 + degrees;
        case 'NW':
            return 360 - degrees;
        default:
            return degrees;
    }
}

// Convert azimuth to bearing
function azimuthToBearing(azimuth) {
    // Normalize azimuth to 0-360 range
    azimuth = ((azimuth % 360) + 360) % 360;
    
    let quadrant, degrees;
    
    if (azimuth >= 0 && azimuth < 90) {
        quadrant = 'NE';
        degrees = azimuth;
    } else if (azimuth >= 90 && azimuth < 180) {
        quadrant = 'SE';
        degrees = 180 - azimuth;
    } else if (azimuth >= 180 && azimuth < 270) {
        quadrant = 'SW';
        degrees = azimuth - 180;
    } else {
        quadrant = 'NW';
        degrees = 360 - azimuth;
    }
    
    return { quadrant, degrees };
}

// Length unit conversion
function convertLength(value, fromUnit, toUnit) {
    // First convert from source unit to US feet
    let usFeet;
    
    switch (fromUnit) {
        case 'us-ft':
            usFeet = value;
            break;
        case 'int-ft':
            usFeet = value * 1.000002;
            break;
        case 'meter':
            usFeet = value / 0.3048006096;
            break;
        case 'chain':
            usFeet = value * 66;
            break;
        case 'link':
            usFeet = value * 0.66;
            break;
        case 'rod':
            usFeet = value * 16.5;
            break;
        case 'yard':
            usFeet = value * 3;
            break;
        case 'mile':
            usFeet = value * 5280;
            break;
        default:
            usFeet = value;
    }
    
    // Then convert from US feet to target unit
    switch (toUnit) {
        case 'us-ft':
            return usFeet;
        case 'int-ft':
            return usFeet / 1.000002;
        case 'meter':
            return usFeet * 0.3048006096;
        case 'chain':
            return usFeet / 66;
        case 'link':
            return usFeet / 0.66;
        case 'rod':
            return usFeet / 16.5;
        case 'yard':
            return usFeet / 3;
        case 'mile':
            return usFeet / 5280;
        default:
            return usFeet;
    }
}

// Area unit conversion
function convertArea(value, fromUnit, toUnit) {
    // First convert from source unit to square US feet
    let squareFeet;
    
    switch (fromUnit) {
        case 'sq-ft':
            squareFeet = value;
            break;
        case 'acre':
            squareFeet = value * 43560;
            break;
        case 'sq-meter':
            squareFeet = value * 10.76391;
            break;
        case 'hectare':
            squareFeet = value * 107639.1;
            break;
        case 'sq-mile':
            squareFeet = value * 27878400;
            break;
        case 'sq-chain':
            squareFeet = value * 4356;
            break;
        default:
            squareFeet = value;
    }
    
    // Then convert from square US feet to target unit
    switch (toUnit) {
        case 'sq-ft':
            return squareFeet;
        case 'acre':
            return squareFeet / 43560;
        case 'sq-meter':
            return squareFeet / 10.76391;
        case 'hectare':
            return squareFeet / 107639.1;
        case 'sq-mile':
            return squareFeet / 27878400;
        case 'sq-chain':
            return squareFeet / 4356;
        default:
            return squareFeet;
    }
}

// Get display names for units
function getUnitDisplayName(unitCode) {
    const displayNames = {
        'us-ft': 'US Feet',
        'int-ft': 'International Feet',
        'meter': 'Meters',
        'chain': 'Chains',
        'link': 'Links',
        'rod': 'Rods',
        'yard': 'Yards',
        'mile': 'Miles',
        'sq-ft': 'Square Feet',
        'acre': 'Acres',
        'sq-meter': 'Square Meters',
        'hectare': 'Hectares',
        'sq-mile': 'Square Miles',
        'sq-chain': 'Square Chains'
    };
    
    return displayNames[unitCode] || unitCode;
}