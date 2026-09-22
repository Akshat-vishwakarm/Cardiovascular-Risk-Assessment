/*
   GeneGuard Client-side Logic, Dynamic Unit Switcher & BMI Calculation
*/

document.addEventListener('DOMContentLoaded', () => {
    // Elements for Height
    const heightInput = document.getElementById('height');
    const heightFtInput = document.getElementById('height_ft');
    const heightInInput = document.getElementById('height_in');
    const heightUnitSelect = document.getElementById('height_unit');
    const heightCmContainer = document.getElementById('height-cm-container');
    const heightFtContainer = document.getElementById('height-ft-container');

    // Elements for Weight
    const weightInput = document.getElementById('weight');
    const weightUnitSelect = document.getElementById('weight_unit');
    const weightUnitTag = document.getElementById('weight-unit-tag');

    // Display
    const bmiValueDisplay = document.getElementById('bmi-value');

    // 1. Toggle Height Unit Display (cm vs ft/in)
    function updateHeightUnitUI() {
        if (!heightUnitSelect || !heightCmContainer || !heightFtContainer) return;

        if (heightUnitSelect.value === 'ft') {
            heightCmContainer.style.display = 'none';
            heightFtContainer.style.display = 'flex';
            heightInput.required = false;
            if (heightFtInput) heightFtInput.required = true;
        } else {
            heightCmContainer.style.display = 'block';
            heightFtContainer.style.display = 'none';
            heightInput.required = true;
            if (heightFtInput) heightFtInput.required = false;
        }
        calculateBMI();
    }

    // 2. Toggle Weight Unit Tag
    function updateWeightUnitUI() {
        if (!weightUnitSelect || !weightUnitTag) return;
        weightUnitTag.textContent = weightUnitSelect.value === 'lbs' ? 'lbs' : 'kg';
        calculateBMI();
    }

    // 3. Live BMI Calculation with Unit Conversions
    function calculateBMI() {
        if (!bmiValueDisplay) return;

        let heightCm = 0;
        let weightKg = 0;

        // Calculate Height in CM
        if (heightUnitSelect && heightUnitSelect.value === 'ft') {
            const ft = parseFloat(heightFtInput ? heightFtInput.value : 0) || 0;
            const inch = parseFloat(heightInInput ? heightInInput.value : 0) || 0;
            if (ft > 0) {
                heightCm = (ft * 30.48) + (inch * 2.54);
            }
        } else {
            const h = parseFloat(heightInput ? heightInput.value : 0) || 0;
            if (h > 0) {
                heightCm = h;
            }
        }

        // Calculate Weight in KG
        const w = parseFloat(weightInput ? weightInput.value : 0) || 0;
        if (w > 0) {
            if (weightUnitSelect && weightUnitSelect.value === 'lbs') {
                weightKg = w * 0.45359237;
            } else {
                weightKg = w;
            }
        }

        // Calculate BMI
        if (heightCm > 0 && weightKg > 0) {
            const hMeters = heightCm / 100.0;
            const bmi = weightKg / (hMeters * hMeters);
            bmiValueDisplay.textContent = bmi.toFixed(1);
        } else {
            bmiValueDisplay.textContent = '--.-';
        }
    }

    // Event Listeners for Height
    if (heightUnitSelect) heightUnitSelect.addEventListener('change', updateHeightUnitUI);
    if (heightInput) heightInput.addEventListener('input', calculateBMI);
    if (heightFtInput) heightFtInput.addEventListener('input', calculateBMI);
    if (heightInInput) heightInInput.addEventListener('input', calculateBMI);

    // Event Listeners for Weight
    if (weightUnitSelect) weightUnitSelect.addEventListener('change', updateWeightUnitUI);
    if (weightInput) weightInput.addEventListener('input', calculateBMI);

    // Initial setup
    updateHeightUnitUI();
    updateWeightUnitUI();

    // 4. Client-side Form Validation
    const assessmentForm = document.getElementById('assessment-form');
    const errorBanner = document.getElementById('error-banner');

    if (assessmentForm) {
        assessmentForm.addEventListener('submit', (event) => {
            const errors = [];

            // Age check
            const age = parseFloat(document.getElementById('age').value);
            if (isNaN(age) || age < 1 || age > 120) {
                errors.push("Please enter a valid age between 1 and 120 years.");
            }

            // Height check
            if (heightUnitSelect && heightUnitSelect.value === 'ft') {
                const ft = parseFloat(heightFtInput.value);
                const inch = parseFloat(heightInInput.value || 0);
                if (isNaN(ft) || ft < 1 || ft > 8 || isNaN(inch) || inch < 0 || inch >= 12) {
                    errors.push("Please enter a valid height in feet (1-8) and inches (0-11).");
                }
            } else {
                const height = parseFloat(heightInput.value);
                if (isNaN(height) || height < 50 || height > 250) {
                    errors.push("Please enter a valid height between 50 cm and 250 cm.");
                }
            }

            // Weight check
            const weight = parseFloat(weightInput.value);
            if (weightUnitSelect && weightUnitSelect.value === 'lbs') {
                if (isNaN(weight) || weight < 40 || weight > 700) {
                    errors.push("Please enter a valid weight between 40 lbs and 700 lbs.");
                }
            } else {
                if (isNaN(weight) || weight < 20 || weight > 350) {
                    errors.push("Please enter a valid weight between 20 kg and 350 kg.");
                }
            }

            // Blood Pressure checks
            const apHi = parseFloat(document.getElementById('ap_hi').value);
            const apLo = parseFloat(document.getElementById('ap_lo').value);

            if (isNaN(apHi) || apHi < 60 || apHi > 250) {
                errors.push("Please enter a realistic Systolic blood pressure (60-250 mmHg).");
            }

            if (isNaN(apLo) || apLo < 30 || apLo > 180) {
                errors.push("Please enter a realistic Diastolic blood pressure (30-180 mmHg).");
            }

            if (!isNaN(apHi) && !isNaN(apLo) && apHi <= apLo) {
                errors.push("Systolic blood pressure must be higher than Diastolic blood pressure.");
            }

            if (errors.length > 0) {
                event.preventDefault();
                errorBanner.textContent = errors.join(" ");
                errorBanner.classList.add('show');
                errorBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                errorBanner.classList.remove('show');
            }
        });
    }

    // 5. Animated Gauge for Result Page
    const gaugeFill = document.getElementById('gauge-fill');
    if (gaugeFill) {
        const prob = parseFloat(gaugeFill.getAttribute('data-probability') || '0');
        const maxArc = 283;
        const offset = maxArc - (maxArc * (prob / 100));
        
        setTimeout(() => {
            gaugeFill.style.strokeDashoffset = offset;
        }, 150);
    }
});
