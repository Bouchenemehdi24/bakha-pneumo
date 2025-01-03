// BMI Calculator
function calculateBMI() {
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value) / 100; // Convert cm to m

    // Input validation
    if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
        document.getElementById('bmi-result').innerHTML = `
            <p class="error">الرجاء إدخال قيم صحيحة للوزن والطول.</p>
        `;
        return;
    }

    const bmi = (weight / (height * height)).toFixed(2);

    let category;
    if (bmi < 18.5) category = 'نقص الوزن';
    else if (bmi >= 18.5 && bmi < 25) category = 'وزن طبيعي';
    else if (bmi >= 25 && bmi < 30) category = 'زيادة الوزن';
    else category = 'سمنة';

    document.getElementById('bmi-result').innerHTML = `
        <p>مؤشر كتلة الجسم (BMI) هو: <strong>${bmi}</strong>.</p>
        <p>التصنيف: <strong>${category}</strong>.</p>
    `;
}

// BMR Calculator
function calculateBMR() {
    const gender = document.getElementById('gender').value;
    const weight = parseFloat(document.getElementById('bmr-weight').value);
    const height = parseFloat(document.getElementById('bmr-height').value);
    const age = parseFloat(document.getElementById('age').value);

    // Input validation
    if (isNaN(weight) || isNaN(height) || isNaN(age) || weight <= 0 || height <= 0 || age <= 0) {
        document.getElementById('bmr-result').innerHTML = `
            <p class="error">الرجاء إدخال قيم صحيحة للوزن والطول والعمر.</p>
        `;
        return;
    }

    let bmr;
    if (gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    document.getElementById('bmr-result').innerHTML = `
        <p>معدل الأيض الأساسي (BMR) هو: <strong>${bmr.toFixed(2)}</strong> سعرة حرارية/يوم.</p>
    `;
}

// Daily Calorie Calculator
function calculateCalories() {
    const activityLevel = parseFloat(document.getElementById('activity-level').value);
    const bmrText = document.getElementById('bmr-result').textContent;

    // Check if BMR is calculated
    if (!bmrText.includes("سعرة حرارية")) {
        document.getElementById('calorie-result').innerHTML = `
            <p class="error">الرجاء حساب معدل الأيض الأساسي (BMR) أولاً.</p>
        `;
        return;
    }

    const bmr = parseFloat(bmrText.match(/\d+\.\d+/)[0]);
    const calories = (bmr * activityLevel).toFixed(2);

    document.getElementById('calorie-result').innerHTML = `
        <p>احتياجك اليومي من السعرات الحرارية هو: <strong>${calories}</strong> سعرة حرارية/يوم.</p>
    `;
}

// WHR Calculator
function calculateWHR() {
    const waist = parseFloat(document.getElementById('waist').value);
    const hip = parseFloat(document.getElementById('hip').value);

    // Input validation
    if (isNaN(waist) || isNaN(hip) || waist <= 0 || hip <= 0) {
        document.getElementById('whr-result').innerHTML = `
            <p class="error">الرجاء إدخال قيم صحيحة لمحيط الخصر والورك.</p>
        `;
        return;
    }

    const whr = (waist / hip).toFixed(2);

    let risk;
    if (whr < 0.9) risk = 'منخفض';
    else if (whr >= 0.9 && whr < 1) risk = 'متوسط';
    else risk = 'مرتفع';

    document.getElementById('whr-result').innerHTML = `
        <p>نسبة الخصر إلى الورك (WHR) هي: <strong>${whr}</strong>.</p>
        <p>مستوى الخطورة: <strong>${risk}</strong>.</p>
    `;
}

// Smoking Cost Calculator
function calculateSmokingCost() {
    const costPerPack = parseFloat(document.getElementById('cost-per-pack').value);
    const packsPerDay = parseFloat(document.getElementById('packs-per-day').value);
    const smokingYears = parseFloat(document.getElementById('smoking-years').value);

    // Input validation
    if (isNaN(costPerPack) || isNaN(packsPerDay) || isNaN(smokingYears) || costPerPack <= 0 || packsPerDay <= 0 || smokingYears <= 0) {
        document.getElementById('smoking-cost-result').innerHTML = `
            <p class="error">الرجاء إدخال قيم صحيحة للتكلفة وعدد العلب وسنوات التدخين.</p>
        `;
        return;
    }

    const totalCost = (costPerPack * packsPerDay * 365 * smokingYears).toFixed(2);

    document.getElementById('smoking-cost-result').innerHTML = `
        <p>التكلفة الإجمالية للتدخين: <strong>${totalCost}</strong> دينار.</p>
    `;
}

// Lung Age Calculator
function calculateLungAge() {
    const height = parseFloat(document.getElementById('lung-height').value);
    const fev1 = parseFloat(document.getElementById('fev1').value);

    // Input validation
    if (isNaN(height) || isNaN(fev1) || height <= 0 || fev1 <= 0) {
        document.getElementById('lung-age-result').innerHTML = `
            <p class="error">الرجاء إدخال قيم صحيحة للطول وحجم الزفير القسري (FEV1).</p>
        `;
        return;
    }

    const lungAge = (2.87 * height) - (31.25 * fev1) - 39.375;

    document.getElementById('lung-age-result').innerHTML = `
        <p>عمر رئتيك هو: <strong>${lungAge.toFixed(2)}</strong> سنة.</p>
    `;
}

// Hydration Calculator
function calculateHydration() {
    const weight = parseFloat(document.getElementById('hydration-weight').value);

    // Input validation
    if (isNaN(weight) || weight <= 0) {
        document.getElementById('hydration-result').innerHTML = `
            <p class="error">الرجاء إدخال قيمة صحيحة للوزن.</p>
        `;
        return;
    }

    const waterIntake = (weight * 0.033).toFixed(2);

    document.getElementById('hydration-result').innerHTML = `
        <p>احتياجك اليومي من الماء هو: <strong>${waterIntake}</strong> لتر/يوم.</p>
    `;
}