// Function to format date as YYYY-MM-DD
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

// Function to get today's date at midnight for comparison
function getTodayAtMidnight() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

// Function to initialize date input restrictions
function initializeDateInputs() {
    const dateInputs = [
        document.getElementById('appointmentDate-ar'),
        document.getElementById('appointmentDate-fr')
    ];

    const today = formatDate(new Date());

    dateInputs.forEach(input => {
        if (input) {
            input.min = today;
        }
    });
}

// Validate form fields
function validateForm(formId) {
    const form = document.getElementById(formId);
    const name = form.querySelector('input[name="name"]');
    const sex = form.querySelector('select[name="sex"]');
    const phone = form.querySelector('input[name="phone"]');
    const appointmentDate = form.querySelector('input[name="appointmentDate"]');

    // Validate name
    if (!name.value.trim()) {
        alert(formId.includes('-ar') ? 'الرجاء إدخال الاسم الكامل' : 'Veuillez entrer votre nom complet');
        name.focus();
        return false;
    }

    // Validate gender
    if (!sex.value) {
        alert(formId.includes('-ar') ? 'الرجاء اختيار الجنس' : 'Veuillez sélectionner votre sexe');
        sex.focus();
        return false;
    }

    // Validate phone number (10 digits)
    if (!phone.value.trim() || !/^[0-9]{10}$/.test(phone.value)) {
        alert(formId.includes('-ar') ? 'الرجاء إدخال رقم هاتف صحيح من 10 أرقام' : 'Veuillez entrer un numéro de téléphone valide à 10 chiffres');
        phone.focus();
        return false;
    }

    // Validate appointment date
    if (!appointmentDate.value) {
        alert(formId.includes('-ar') ? 'الرجاء اختيار تاريخ الموعد' : 'Veuillez sélectionner une date de rendez-vous');
        appointmentDate.focus();
        return false;
    }

    // Check if appointment date is not in the past
    const selectedDate = new Date(appointmentDate.value);
    selectedDate.setHours(0, 0, 0, 0);
    const today = getTodayAtMidnight();

    if (selectedDate < today) {
        alert(formId.includes('-ar') ? 'الرجاء اختيار تاريخ من اليوم فصاعداً' : 'Veuillez sélectionner une date à partir d\'aujourd\'hui');
        appointmentDate.focus();
        return false;
    }

    return true;
}

// Handle form submission
function submitForm(event, formId) {
    event.preventDefault();

    if (!validateForm(formId)) return;

    const form = document.getElementById(formId);
    const formData = new FormData(form);
    const successMessageId = formId === "appointmentForm-ar" ? "success-message-ar" : "success-message-fr";
    const successMessage = document.getElementById(successMessageId);

    fetch("https://formspree.io/f/xnnqdaka", {
        method: "POST",
        headers: {
            'Accept': 'application/json'
        },
        body: formData
    })
    .then(response => {
        if (response.ok) {
            form.reset();
            form.style.display = "none"; // Hide the form after successful submission
            successMessage.style.display = "block";
            // Hide success message after 5 seconds (optional)
            setTimeout(() => {
                successMessage.style.display = "none";
            }, 5000);
        } else {
            alert(formId.includes('-ar') ? 
                'حدث خطأ. يرجى المحاولة مرة أخرى.' : 
                'Une erreur s\'est produite. Veuillez réessayer.');
        }
    })
    .catch(error => {
        alert(formId.includes('-ar') ? 
            'خطأ في الشبكة. تأكد من الاتصال بالإنترنت وحاول مجددًا.' : 
            'Erreur réseau. Vérifiez votre connexion et réessayez.');
    });
}


// Initialize date inputs when the document is loaded
document.addEventListener('DOMContentLoaded', initializeDateInputs);