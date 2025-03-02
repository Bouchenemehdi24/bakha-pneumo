// Supabase Initialization
const SUPABASE_URL = 'https://nwdxzkmpugzkcxkocder.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53ZHh6a21wdWd6a2N4a29jZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MTM0MDYsImV4cCI6MjA1NjQ4OTQwNn0.J9Ot3uUY3zLxbFpEppcgCVLyEUjwd3Pw2r5yQsqLhTo';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Set minimum date to today
document.addEventListener('DOMContentLoaded', function() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    
    dateInputs.forEach(input => {
        input.min = today;
        
        // Disable Fridays (weekend in Algeria)
        input.addEventListener('input', function(e) {
            const selectedDate = new Date(this.value);
            if (selectedDate.getDay() === 5) { // 5 is Friday
                showToast('عذراً، العيادة مغلقة يوم الجمعة. يرجى اختيار يوم آخر.', 'warning');
                this.value = '';
            }
        });
    });
    
    // Initialize phone number formatting
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            // Remove non-numeric characters
            let value = this.value.replace(/\D/g, '');
            
            // Ensure it starts with 0
            if (value.length > 0 && value[0] !== '0') {
                value = '0' + value;
            }
            
            // Limit to 10 digits
            if (value.length > 10) {
                value = value.slice(0, 10);
            }
            
            this.value = value;
        });
    });
});

// Create a toast notification system
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    
    // Add close button
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;';
    closeBtn.className = 'toast-close';
    closeBtn.onclick = function() {
        toast.remove();
    };
    toast.appendChild(closeBtn);
    
    // Add to document
    document.body.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(toast)) {
            toast.classList.add('toast-hiding');
            setTimeout(() => toast.remove(), 500);
        }
    }, 5000);
}

// Check if date is available before submission
async function checkDateAvailability(date) {
    try {
        // Get count of appointments for the selected date
        const { data, error, count } = await supabaseClient
            .from('appointments')
            .select('*', { count: 'exact' })
            .eq('appointment_date', date);
        
        if (error) throw error;
        
        // Assuming max 10 appointments per day
        const MAX_APPOINTMENTS_PER_DAY = 10;
        return {
            available: count < MAX_APPOINTMENTS_PER_DAY,
            remaining: MAX_APPOINTMENTS_PER_DAY - count
        };
    } catch (error) {
        console.error('Error checking availability:', error);
        return { available: false, error: error.message };
    }
}

// Form validation
function validateForm(formData) {
    const name = formData.get('name');
    const phone = formData.get('phone');
    const date = formData.get('appointment_date');
    
    if (!name || name.trim().length < 3) {
        return { valid: false, message: 'يرجى إدخال الاسم الكامل (3 أحرف على الأقل)' };
    }
    
    if (!phone || !/^0\d{9}$/.test(phone)) {
        return { valid: false, message: 'يرجى إدخال رقم هاتف صحيح مكون من 10 أرقام يبدأ بـ 0' };
    }
    
    if (!date) {
        return { valid: false, message: 'يرجى اختيار تاريخ للموعد' };
    }
    
    // Validate date is not in the past
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        return { valid: false, message: 'لا يمكن حجز موعد في تاريخ سابق' };
    }
    
    // Validate date is not a Friday
    if (selectedDate.getDay() === 5) { // 5 is Friday
        return { valid: false, message: 'العيادة مغلقة يوم الجمعة. يرجى اختيار يوم آخر' };
    }
    
    return { valid: true };
}

// Main submission function
async function submitToSupabase(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const successPopup = document.getElementById('success-popup');
    const formData = new FormData(form);
    
    // Validate form data
    const validation = validateForm(formData);
    if (!validation.valid) {
        showToast(validation.message, 'error');
        return;
    }
    
    const data = {
        name: formData.get('name'),
        sex: formData.get('sex'),
        phone: formData.get('phone'),
        appointment_date: formData.get('appointment_date')
    };
    
    // Update UI to show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
    
    try {
        // Check if date is available
        const availability = await checkDateAvailability(data.appointment_date);
        
        if (!availability.available) {
            if (availability.error) {
                throw new Error(availability.error);
            }
            
            showToast(`عذراً، هذا التاريخ ممتلئ بالحجوزات. يرجى اختيار تاريخ آخر.`, 'warning');
            submitButton.disabled = false;
            submitButton.innerHTML = 'إرسال';
            return;
        }
        
        if (availability.remaining <= 3) {
            showToast(`تبقى ${availability.remaining} مواعيد فقط في هذا اليوم`, 'info');
        }
        
        // Insert appointment
        const { error } = await supabaseClient
            .from('appointments')
            .insert([data]);
            
        if (error) throw error;
        
        // Fill the popup with user details
        document.getElementById('popup-name').textContent = data.name;
        document.getElementById('popup-phone').textContent = data.phone;
        
        // Format date for display
        const appointmentDate = new Date(data.appointment_date);
        const formattedDate = appointmentDate.toLocaleDateString('ar-DZ', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('popup-date').textContent = formattedDate;
        
        // Show the popup
        successPopup.style.display = 'flex';
        
        // Add appointment to calendar if supported
        if (window.isSecureContext && 'showSaveFilePicker' in window) {
            addCalendarButton(appointmentDate, data.name);
        }
        
        // Reset the form
        form.reset();
        
        // Record successful appointment in analytics
        if (typeof gtag === 'function') {
            gtag('event', 'appointment_booked', {
                'event_category': 'engagement',
                'event_label': data.appointment_date
            });
        }
        
    } catch (error) {
        showToast('حدث خطأ: ' + error.message, 'error');
        console.error('Appointment submission error:', error);
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = 'إرسال';
    }
}

// Add calendar option
function addCalendarButton(date, patientName) {
    const popupContent = document.querySelector('.popup-content');
    
    // Check if the button already exists
    if (document.getElementById('add-to-calendar')) {
        return;
    }
    
    const calendarBtn = document.createElement('button');
    calendarBtn.id = 'add-to-calendar';
    calendarBtn.className = 'calendar-button';
    calendarBtn.innerHTML = '<i class="fas fa-calendar-plus"></i> إضافة إلى التقويم';
    
    calendarBtn.addEventListener('click', function() {
        // Create a calendar event
        const event = new Date(date);
        const endTime = new Date(event);
        endTime.setMinutes(endTime.getMinutes() + 30); // 30 minute appointment
        
        const calendarEvent = {
            title: `موعد طبي - ${patientName}`,
            description: `موعد في عيادة الدكتورة بخة س للأمراض الصدرية والحساسية`,
            location: 'حي 19 جوان، خلف مستشفى الحكيم عقبي، ڨالمة',
            startTime: event.toISOString(),
            endTime: endTime.toISOString()
        };
        
        // Generate ICS file content
        const icsContent = generateICS(calendarEvent);
        
        // Download file
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'appointment.ics';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    
    popupContent.appendChild(calendarBtn);
}

// Generate ICS file content
function generateICS(event) {
    const formatDate = (date) => {
        return date.replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };
    
    return `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:${event.title}
DTSTART:${formatDate(event.startTime)}
DTEND:${formatDate(event.endTime)}
LOCATION:${event.location}
DESCRIPTION:${event.description}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT30M
DESCRIPTION:Reminder
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;
}

// Close popup when clicking the X
document.querySelector('.close-popup').addEventListener('click', function() {
    document.getElementById('success-popup').style.display = 'none';
});

// Close popup when clicking outside of it
document.getElementById('success-popup').addEventListener('click', function(event) {
    if (event.target === this) {
        this.style.display = 'none';
    }
});

// Add key event to allow closing with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const popup = document.getElementById('success-popup');
        if (popup.style.display === 'flex') {
            popup.style.display = 'none';
        }
    }
});

// Add this to your CSS file for toast notifications
/*
.toast-notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 24px;
    background-color: #3498db;
    color: white;
    border-radius: 4px;
    z-index: 1000;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 250px;
    max-width: 80%;
    animation: slideIn 0.3s ease-out;
    direction: rtl;
}

.toast-error {
    background-color: #e74c3c;
}

.toast-success {
    background-color: #2ecc71;
}

.toast-warning {
    background-color: #f39c12;
}

.toast-close {
    margin-right: 12px;
    cursor: pointer;
    font-size: 18px;
}

.toast-hiding {
    animation: slideOut 0.5s ease-out forwards;
}

@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}

.calendar-button {
    margin-top: 15px;
    background-color: #2ecc71;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
}

.calendar-button i {
    margin-left: 8px;
}

.calendar-button:hover {
    background-color: #27ae60;
}
*/
