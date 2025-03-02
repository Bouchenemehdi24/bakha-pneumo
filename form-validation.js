// form-validation.js

document.addEventListener('DOMContentLoaded', () => {
    // Get the appointment form
    const appointmentForm = document.getElementById('appointmentForm-ar');
    
    // Get form inputs
    const nameInput = document.getElementById('name-ar');
    const sexSelect = document.getElementById('sex-ar');
    const phoneInput = document.getElementById('phone-ar');
    const dateInput = document.getElementById('appointmentDate-ar');
    
    // Add validation functions
    function validateName(name) {
        return name.trim().length >= 3;
    }
    
    function validatePhone(phone) {
        return /^[0-9]{10}$/.test(phone);
    }
    
    function validateDate(date) {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Check if date is in the future
        if (selectedDate < today) {
            return false;
        }
        
        // Check if date is not more than 3 months in the future
        const threeMonthsLater = new Date();
        threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
        if (selectedDate > threeMonthsLater) {
            return false;
        }
        
        // Check if it's not a Friday (Friday = 5)
        return selectedDate.getDay() !== 5;
    }
    
    // Add input event listeners for real-time validation
    nameInput.addEventListener('input', () => {
        if (!validateName(nameInput.value)) {
            nameInput.setCustomValidity('الاسم يجب أن يحتوي على 3 أحرف على الأقل');
        } else {
            nameInput.setCustomValidity('');
        }
    });
    
    phoneInput.addEventListener('input', () => {
        if (!validatePhone(phoneInput.value)) {
            phoneInput.setCustomValidity('يرجى إدخال رقم هاتف صحيح مكون من 10 أرقام');
        } else {
            phoneInput.setCustomValidity('');
        }
    });
    
    dateInput.addEventListener('change', () => {
        if (!validateDate(dateInput.value)) {
            const selectedDay = new Date(dateInput.value).getDay();
            if (selectedDay === 5) {
                dateInput.setCustomValidity('العيادة مغلقة يوم الجمعة، يرجى اختيار يوم آخر');
            } else {
                dateInput.setCustomValidity('يرجى اختيار تاريخ صحيح (من اليوم وحتى 3 أشهر في المستقبل)');
            }
        } else {
            dateInput.setCustomValidity('');
        }
    });
    
    // Disable past dates in the date picker
    function disablePastDates() {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        
        // Set max date to 3 months from now
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        dateInput.max = maxDate.toISOString().split('T')[0];
    }
    
    // Call the function to disable past dates
    disablePastDates();
    
    // Form submission validation
    appointmentForm.addEventListener('submit', (event) => {
        // Prevent submission if any validation fails
        if (!validateName(nameInput.value)) {
            nameInput.setCustomValidity('الاسم يجب أن يحتوي على 3 أحرف على الأقل');
            event.preventDefault();
            return;
        }
        
        if (sexSelect.value === '') {
            sexSelect.setCustomValidity('يرجى اختيار الجنس');
            event.preventDefault();
            return;
        }
        
        if (!validatePhone(phoneInput.value)) {
            phoneInput.setCustomValidity('يرجى إدخال رقم هاتف صحيح مكون من 10 أرقام');
            event.preventDefault();
            return;
        }
        
        if (!validateDate(dateInput.value)) {
            dateInput.setCustomValidity('يرجى اختيار تاريخ صحيح');
            event.preventDefault();
            return;
        }
        
        // If we reach here, validation passed
        // The form will now submit or the submitToSupabase function will handle it
    });
});
