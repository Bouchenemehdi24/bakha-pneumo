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

function getElement(id) {
    return document.getElementById(id);
}

function formatTimeArabic(hours24) {
    const ampm = hours24 >= 12 ? 'مساءً' : 'صباحاً';
    let hours = hours24 % 12;
    hours = hours ? hours : 12;
    if (hours24 === 12) return `12:00 ظهراً`;
    return `${hours}:00 ${ampm}`;
}

function getCountdownText(targetHourAlgeria, targetMinuteAlgeria, currentHourAlgeria, currentMinuteAlgeria) {
    const currentTimeInMinutes = currentHourAlgeria * 60 + currentMinuteAlgeria;
    let targetTimeInMinutes = targetHourAlgeria * 60 + targetMinuteAlgeria;
    let diffInMinutes = targetTimeInMinutes - currentTimeInMinutes;

    if (diffInMinutes <= 0) return ""; 
    
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    
    let countdownStr = " (خلال ";
    if (hours > 0) {
        countdownStr += `${hours} ساعة`;
        if (minutes > 0) countdownStr += " و ";
    }
    if (minutes > 0) {
        countdownStr += `${minutes} دقيقة`;
    }
    countdownStr += ")";

    return (hours > 0 || minutes > 0) ? countdownStr : "";
}

function updateClinicStatus() {
    const nowUTC = new Date();
    const algeriaTimezoneOffsetHours = 1;
    let algeriaHour = nowUTC.getUTCHours() + algeriaTimezoneOffsetHours;
    let algeriaDay = nowUTC.getUTCDay();
    const algeriaMinute = nowUTC.getUTCMinutes();

    if (algeriaHour >= 24) {
        algeriaHour -= 24;
        algeriaDay = (algeriaDay + 1) % 7;
    } else if (algeriaHour < 0) {
        algeriaHour += 24;
        algeriaDay = (algeriaDay - 1 + 7) % 7;
    }
    
    const day = algeriaDay;
    const hours = algeriaHour;
    const minutes = algeriaMinute;
    const todayHours = clinicHours[day];
    
    const statusMessage = getElement('status-message');
    const nextOpening = getElement('next-opening');
    const clinicStatusElem = getElement('clinic-status');
    
    if (!statusMessage || !nextOpening || !clinicStatusElem) {
        // console.warn("Clinic status elements not found.");
        return;
    }
    
    const arabicTimeElem = getElement('arabic-time');
    if (arabicTimeElem) {
        const displayOptions = { 
            timeZone: 'Africa/Algiers', // CRUCIAL for Algeria time
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
        };
        try {
            // Using ar-SA (Saudi Arabia) for formatting as it's widely supported,
            // but timeZone: 'Africa/Algiers' should give Algeria's time.
            const algeriaTimeString = new Date().toLocaleTimeString('ar-SA', displayOptions);
            
            // --- DEBUGGING LOG ---
            // console.log("Attempting to display Algeria Time. Current Date object:", new Date());
            // console.log("Options for toLocaleTimeString:", displayOptions);
            // console.log("Generated Algeria Time String:", algeriaTimeString);
            // Compare this ^ with actual Algeria time and your local time.
            // --- END DEBUGGING LOG ---

            arabicTimeElem.textContent = algeriaTimeString;
        } catch (e) {
            console.error("Error formatting time for Algeria display:", e);
            arabicTimeElem.textContent = "لا يمكن عرض الوقت حالياً";
        }
    }
    
    clinicStatusElem.classList.remove('open', 'closed', 'soon');
    
    if (todayHours && todayHours.open !== null) {
        const isOpenNow = (hours > todayHours.open && hours < todayHours.close) ||
                          (hours === todayHours.open && minutes >= 0) ||
                          (hours === todayHours.close -1 && minutes >=0 && todayHours.close !== todayHours.open) || 
                          (hours === todayHours.close && minutes === 0 && todayHours.close !== todayHours.open);

        if (isOpenNow) {
            statusMessage.innerHTML = '<span class="status-with-icon"><i class="fas fa-door-open status-icon"></i> العيادة مفتوحة حالياً</span>';
            const countdown = getCountdownText(todayHours.close, 0, hours, minutes);
            nextOpening.textContent = `تغلق اليوم في ${formatTimeArabic(todayHours.close)}${countdown}`;
            clinicStatusElem.classList.add('open');
        } else if (hours === todayHours.open - 1 && minutes >=0) {
            statusMessage.innerHTML = '<span class="status-with-icon"><i class="fas fa-clock status-icon"></i> ستفتح العيادة قريباً</span>';
            const countdown = getCountdownText(todayHours.open, 0, hours, minutes);
            nextOpening.textContent = `تفتح اليوم في ${formatTimeArabic(todayHours.open)}${countdown}`;
            clinicStatusElem.classList.add('soon');
        } else if (hours < todayHours.open) {
            statusMessage.innerHTML = '<span class="status-with-icon"><i class="fas fa-door-closed status-icon"></i> العيادة مغلقة حالياً</span>';
            const countdown = getCountdownText(todayHours.open, 0, hours, minutes);
            nextOpening.textContent = `تفتح اليوم في ${formatTimeArabic(todayHours.open)}${countdown}`;
            clinicStatusElem.classList.add('closed');
        } else { 
            statusMessage.innerHTML = '<span class="status-with-icon"><i class="fas fa-door-closed status-icon"></i> العيادة مغلقة حالياً</span>';
            let nextOpenDayInfoFound = false;
            for (let i = 1; i <= 7; i++) {
                const nextCheckDay = (day + i) % 7;
                const nextDayHours = clinicHours[nextCheckDay];
                if (nextDayHours && nextDayHours.open !== null) {
                    const dayName = i === 1 ? "غداً" : `يوم ${arabicDays[nextCheckDay]}`;
                    nextOpening.textContent = `تفتح ${dayName} (${arabicDays[nextCheckDay]}) في ${formatTimeArabic(nextDayHours.open)}`;
                    nextOpenDayInfoFound = true;
                    break;
                }
            }
            if (!nextOpenDayInfoFound) nextOpening.textContent = "يرجى مراجعة مواقيت العمل.";
            clinicStatusElem.classList.add('closed');
        }
    } else { 
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
         if (!nextOpenDayInfoFound) nextOpening.textContent = "يرجى مراجعة مواقيت العمل.";
        clinicStatusElem.classList.add('closed');
    }
    
    createBackToTopButton();
}

function createBackToTopButton() {
    if (!getElement('back-to-top')) {
        const backToTop = document.createElement('div');
        backToTop.id = 'back-to-top';
        backToTop.className = 'back-to-top';
        backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
        backToTop.title = 'العودة إلى الأعلى';
        document.body.appendChild(backToTop);
        
        backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
    
    function toggleBackToTop() {
        const backToTop = getElement('back-to-top');
        if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 300);
    }
    
    if (!window.hasBackToTopListener) {
        window.addEventListener('scroll', toggleBackToTop);
        window.hasBackToTopListener = true;
    }
}

function formatServiceCards() {
    const servicesSection = getElement('services');
    if (!servicesSection) return;
    const servicesList = servicesSection.querySelector('ul');
    if (!servicesList) return;
    if (servicesSection.dataset.formatted === 'true') return;

    const items = Array.from(servicesList.querySelectorAll('li'));
    if (items.length === 0) return;

    const serviceGrid = document.createElement('div');
    serviceGrid.className = 'service-grid';
    
    const serviceIcons = {
        'تشخيص': 'fa-stethoscope', 'قياس': 'fa-chart-line', 'اشعة': 'fa-x-ray',
        'علاج': 'fa-heartbeat', 'اختبارات': 'fa-vial', 'انقطاع': 'fa-bed',
        'طوارئ': 'fa-ambulance', 'الاسترواح': 'fa-lungs-virus',
        'تدخين': 'fa-smoking-ban', 'فحوصات': 'fa-user-md'
    };
    
    items.forEach(item => {
        const text = item.textContent.trim();
        if (!text) return;
        let iconClass = 'fa-clinic-medical';
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
    servicesSection.dataset.formatted = 'true';
}

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

function checkAndAddEmergencyNotice() {
    const nowUTC = new Date();
    let algeriaHour = nowUTC.getUTCHours() + 1;
    if (algeriaHour >= 24) algeriaHour -=24;
    const algeriaDay = (algeriaHour >= 24) ? (nowUTC.getUTCDay() + 1) % 7 : nowUTC.getUTCDay();

    const isBusyTime = (algeriaDay === 0 && algeriaHour >= 9 && algeriaHour <= 11) || 
                       (algeriaDay >= 0 && algeriaDay <=4 && algeriaHour >= 8 && algeriaHour <= 9);

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

function initClinicFeatures() {
    updateClinicStatus();
    setInterval(() => {
        updateClinicStatus();
        addStatusTransitionEffects();
        checkAndAddEmergencyNotice();
    }, 60000);
    
    formatServiceCards();
    checkAndAddEmergencyNotice();
    
    const appointmentSection = getElement('appointment');
    if (appointmentSection && !document.querySelector('.waiting-time-indicator-container')) {
        const waitingTimeContainer = document.createElement('div');
        waitingTimeContainer.className = 'waiting-time-indicator-container';
        waitingTimeContainer.innerHTML = `
            <p class="waiting-time-label">الوقت المتوقع للانتظار حالياً:</p>
            <div class="waiting-time-indicator">أقل من 20 دقيقة</div>
        `;
        const h2Appointment = appointmentSection.querySelector('h2');
        if (h2Appointment) {
            h2Appointment.parentNode.insertBefore(waitingTimeContainer, h2Appointment.nextSibling);
        } else {
            appointmentSection.insertBefore(waitingTimeContainer, appointmentSection.firstChild);
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClinicFeatures);
} else {
    initClinicFeatures();
}
