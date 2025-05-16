// Enhanced clinic-status.js - Uses Algeria Time (UTC+1)

// Define clinic hours (for each day, Saturday to Thursday)
const clinicHours = {
    6: { open: 8, close: 16 }, // Saturday
    0: { open: 8, close: 16 }, // Sunday
    1: { open: 8, close: 16 }, // Monday
    2: { open: 8, close: 16 }, // Tuesday
    3: { open: 8, close: 16 }, // Wednesday
    4: { open: 8, close: 16 }, // Thursday
    5: { open: null, close: null } // Friday (Closed)
};

// Days of the week in Arabic
const arabicDays = [
    "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"
];

// Check if an element exists before accessing it
function getElement(id) {
    return document.getElementById(id);
}

// Format time with AM/PM in Arabic (takes 24-hour format)
function formatTimeArabic(hours24) {
    const ampm = hours24 >= 12 ? 'مساءً' : 'صباحاً';
    let hours = hours24 % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    if (hours24 === 12) return `12:00 ظهراً`; // Noon specifically
    return `${hours}:00 ${ampm}`;
}

// Calculate and display countdown based on target Algerian hour/minute
function getCountdownText(targetHourAlgeria, targetMinuteAlgeria, currentHourAlgeria, currentMinuteAlgeria) {
    // Convert current and target times to total minutes from midnight in Algeria time
    const currentTimeInMinutes = currentHourAlgeria * 60 + currentMinuteAlgeria;
    let targetTimeInMinutes = targetHourAlgeria * 60 + targetMinuteAlgeria;

    let diffInMinutes = targetTimeInMinutes - currentTimeInMinutes;

    // If diff is negative, it means the target time is on the "next day" conceptually for countdown purposes
    // (e.g., current 17:00, target for next day 08:00. This case is handled by main logic for next day opening)
    // This function assumes target is on the same logical "day" or very soon.
    // For simple same-day countdown:
    if (diffInMinutes <= 0) return ""; 
    
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    
    if (hours > 0) {
        return ` (خلال ${hours} ساعة و ${minutes} دقيقة)`;
    } else if (minutes > 0) { // Only show if there are minutes to count down
        return ` (خلال ${minutes} دقيقة)`;
    }
    return ""; // Should not be reached if diffInMinutes > 0 and minutes is 0 but hours is 0.
}


// Update clinic status with enhanced information using Algeria Time
function updateClinicStatus() {
    const nowUTC = new Date(); // Get current date/time in UTC

    // Calculate Algeria time (UTC+1)
    const algeriaTimezoneOffsetHours = 1;
    let algeriaHour = nowUTC.getUTCHours() + algeriaTimezoneOffsetHours;
    let algeriaDay = nowUTC.getUTCDay();
    const algeriaMinute = nowUTC.getUTCMinutes();

    if (algeriaHour >= 24) {
        algeriaHour -= 24;
        algeriaDay = (algeriaDay + 1) % 7; // Move to next day
    } else if (algeriaHour < 0) { // Should not happen with UTC+1 but good for robustness
        algeriaHour += 24;
        algeriaDay = (algeriaDay - 1 + 7) % 7; // Move to previous day
    }
    
    const day = algeriaDay;
    const hours = algeriaHour;
    const minutes = algeriaMinute;
    const todayHours = clinicHours[day];
    
    // Get DOM elements
    const statusMessage = getElement('status-message');
    const nextOpening = getElement('next-opening');
    const clinicStatusElem = getElement('clinic-status');
    
    if (!statusMessage || !nextOpening || !clinicStatusElem) return;
    
    const arabicTimeElem = getElement('arabic-time');
    if (arabicTimeElem) {
        const options = { 
            timeZone: 'Africa/Algiers', // Correct timezone for Algeria
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
            hour: '2-digit', minute: '2-digit', hour12: true 
        };
        // Use new Date() for toLocaleTimeString as it handles the timeZone option correctly
        arabicTimeElem.textContent = new Date().toLocaleTimeString('ar-DZ', options); // ar-DZ for Algerian Arabic
    }
    
    clinicStatusElem.classList.remove('open', 'closed', 'soon');
    
    if (todayHours && todayHours.open !== null) { // Check if todayHours is defined
        const isOpenNow = (hours > todayHours.open && hours < todayHours.close) ||
                          (hours === todayHours.open && minutes >= 0) ||
                          (hours === todayHours.close -1 && minutes >=0 && todayHours.close !== todayHours.open) || // Handles closing at X:00
                          (hours === todayHours.close && minutes === 0 && todayHours.close !== todayHours.open) ; // Exactly at closing hour, still open

        if (isOpenNow) {
            statusMessage.innerHTML = '<span class="status-with-icon"><i class="fas fa-door-open status-icon"></i> العيادة مفتوحة حالياً</span>';
            const countdown = getCountdownText(todayHours.close, 0, hours, minutes);
            nextOpening.textContent = `تغلق اليوم في ${formatTimeArabic(todayHours.close)}${countdown}`;
            clinicStatusElem.classList.add('open');
        } else if (hours === todayHours.open - 1 && minutes >=0) { // Opening within the hour before
            statusMessage.innerHTML = '<span class="status-with-icon"><i class="fas fa-clock status-icon"></i> ستفتح العيادة قريباً</span>';
            const countdown = getCountdownText(todayHours.open, 0, hours, minutes);
            nextOpening.textContent = `تفتح اليوم في ${formatTimeArabic(todayHours.open)}${countdown}`;
            clinicStatusElem.classList.add('soon');
        } else if (hours < todayHours.open) {
            statusMessage.innerHTML = '<span class="status-with-icon"><i class="fas fa-door-closed status-icon"></i> العيادة مغلقة حالياً</span>';
            const countdown = getCountdownText(todayHours.open, 0, hours, minutes);
            nextOpening.textContent = `تفتح اليوم في ${formatTimeArabic(todayHours.open)}${countdown}`;
            clinicStatusElem.classList.add('closed');
        } else { // Closed for today (after closing hours), check next opening
            statusMessage.innerHTML = '<span class="status-with-icon"><i class="fas fa-door-closed status-icon"></i> العيادة مغلقة حالياً</span>';
            let nextOpenDayInfoFound = false;
            for (let i = 1; i <= 7; i++) {
                const nextCheckDay = (day + i) % 7;
                const nextDayHours = clinicHours[nextCheckDay];
                if (nextDayHours && nextDayHours.open !== null) {
                    const dayName = i === 1 ? "غداً" : `يوم ${arabicDays[nextCheckDay]}`;
                    nextOpening.textContent = `تفتح ${dayName} في ${formatTimeArabic(nextDayHours.open)}`;
                    nextOpenDayInfoFound = true;
                    break;
                }
            }
            if (!nextOpenDayInfoFound) {
                nextOpening.textContent = "يرجى مراجعة مواقيت العمل."; // Fallback
            }
            clinicStatusElem.classList.add('closed');
        }
    } else { // Today is a holiday (e.g., Friday or not in clinicHours)
        statusMessage.innerHTML = '<span class="status-with-icon"><i class="fas fa-calendar-times status-icon"></i> العيادة مغلقة اليوم</span>';
        let nextOpenDayInfoFound = false;
        for (let i = 1; i <= 7; i++) {
            const nextCheckDay = (day + i) % 7;
            const nextDayHours = clinicHours[nextCheckDay];
            if (nextDayHours && nextDayHours.open !== null) {
                 const dayName = arabicDays[nextCheckDay];
                nextOpening.textContent = `تفتح يوم ${dayName} في ${formatTimeArabic(nextDayHours.open)}`;
                nextOpenDayInfoFound = true;
                break;
            }
        }
         if (!nextOpenDayInfoFound) {
            nextOpening.textContent = "يرجى مراجعة مواقيت العمل."; // Fallback
        }
        clinicStatusElem.classList.add('closed');
    }
    
    createBackToTopButton(); // Moved here to ensure it's always checked
}

// Create and handle back-to-top button
function createBackToTopButton() {
    if (!getElement('back-to-top')) {
        const backToTop = document.createElement('div');
        backToTop.id = 'back-to-top';
        backToTop.className = 'back-to-top';
        backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
        backToTop.title = 'العودة إلى الأعلى';
        document.body.appendChild(backToTop);
        
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    function toggleBackToTop() {
        const backToTop = getElement('back-to-top');
        if (backToTop) {
            backToTop.classList.toggle('visible', window.scrollY > 300);
        }
    }
    
    if (!window.hasBackToTopListener) {
        window.addEventListener('scroll', toggleBackToTop);
        window.hasBackToTopListener = true;
    }
}

// Format services as cards if they exist
function formatServiceCards() {
    const servicesSection = getElement('services');
    if (!servicesSection) return;
    const servicesList = servicesSection.querySelector('ul');
    if (!servicesList) return;

    if (servicesSection.dataset.formatted === 'true') return; // Already formatted

    const items = Array.from(servicesList.querySelectorAll('li'));
    if (items.length === 0) return;

    const serviceGrid = document.createElement('div');
    serviceGrid.className = 'service-grid';
    
    const serviceIcons = {
        'تشخيص': 'fa-stethoscope', 'قياس': 'fa-chart-line', 'اشعة': 'fa-x-ray',
        'علاج': 'fa-heartbeat', 'اختبارات': 'fa-vial', 'انقطاع': 'fa-bed',
        'طوارئ': 'fa-ambulance', 'الاسترواح': 'fa-lungs-virus', // Changed icon slightly
        'تدخين': 'fa-smoking-ban', 'فحوصات': 'fa-user-md'
    };
    
    items.forEach(item => {
        const text = item.textContent.trim();
        if (!text) return;

        let iconClass = 'fa-clinic-medical'; // Default icon
        for (const [keyword, icon] of Object.entries(serviceIcons)) {
            if (text.includes(keyword)) {
                iconClass = icon;
                break;
            }
        }
        
        const card = document.createElement('div');
        card.className = 'service-card';
        card.innerHTML = `
            <div class="service-icon"><i class="fas ${iconClass}"></i></div>
            <div class="service-title">${text.split(/[(,]/)[0].trim()}</div> 
            <div class="service-description">${text}</div>
        `;
        serviceGrid.appendChild(card);
    });
    
    servicesList.parentNode.replaceChild(serviceGrid, servicesList);
    servicesSection.dataset.formatted = 'true'; // Mark as formatted
}

// Enhancement for clinic status change animations
function addStatusTransitionEffects() {
    const statusElem = getElement('clinic-status');
    if (statusElem) {
        const currentClass = statusElem.className;
        if (statusElem.dataset.prevClass && statusElem.dataset.prevClass !== currentClass) {
            statusElem.classList.add('status-transition');
            setTimeout(() => statusElem.classList.remove('status-transition'), 1000);
        }
        statusElem.dataset.prevClass = currentClass;
    }
}

// Add emergency notice during high-volume periods
function checkAndAddEmergencyNotice() {
    const nowUTC = new Date();
    let algeriaHour = nowUTC.getUTCHours() + 1;
    if (algeriaHour >= 24) algeriaHour -=24;
    const algeriaDay = (algeriaHour >= 24) ? (nowUTC.getUTCDay() + 1) % 7 : nowUTC.getUTCDay();

    const isBusyTime = (algeriaDay === 0 && algeriaHour >= 9 && algeriaHour <= 11) || // Sunday morning
                       (algeriaDay >= 0 && algeriaDay <=4 && algeriaHour >= 8 && algeriaHour <= 9); // Weekday early morning

    const contactSection = getElement('contact');
    let existingNotice = document.querySelector('.emergency-notice');
    
    if (isBusyTime && contactSection && !existingNotice) {
        const notice = document.createElement('div');
        notice.className = 'emergency-notice';
        notice.innerHTML = `
            <div class="emergency-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <div>
                <strong>تنبيه:</strong> قد تكون هناك فترة ازدحام حالياً. يرجى الاتصال قبل الحضور أو حجز موعد مسبقاً لتجنب الانتظار.
            </div>
        `;
        contactSection.parentNode.insertBefore(notice, contactSection);
    } else if (!isBusyTime && existingNotice) {
        existingNotice.remove();
    }
}

// Initialize all enhancements
function initClinicFeatures() {
    updateClinicStatus();
    setInterval(() => {
        updateClinicStatus();
        addStatusTransitionEffects();
        checkAndAddEmergencyNotice();
    }, 60000); // Every minute
    
    formatServiceCards();
    checkAndAddEmergencyNotice();
    
    const appointmentSection = getElement('appointment');
    if (appointmentSection && !document.querySelector('.waiting-time-indicator-container')) {
        const waitingTimeContainer = document.createElement('div');
        waitingTimeContainer.className = 'waiting-time-indicator-container'; // New container class
        waitingTimeContainer.innerHTML = `
            <p class="waiting-time-label">الوقت المتوقع للانتظار حالياً:</p>
            <div class="waiting-time-indicator">أقل من 20 دقيقة</div>
        `;
        // Insert after the H2 in the appointment section
        const h2Appointment = appointmentSection.querySelector('h2');
        if (h2Appointment) {
            h2Appointment.parentNode.insertBefore(waitingTimeContainer, h2Appointment.nextSibling);
        } else { // Fallback if H2 not found
            appointmentSection.insertBefore(waitingTimeContainer, appointmentSection.firstChild);
        }
    }
}

// Run when document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClinicFeatures);
} else {
    initClinicFeatures();
}
