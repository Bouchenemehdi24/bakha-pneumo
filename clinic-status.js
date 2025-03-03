// Enhanced clinic-status.js - Improved functionality and performance

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

// Format time with AM/PM in Arabic
function formatTimeArabic(hours) {
    if (hours < 12) {
        return `${hours}:00 صباحاً`;
    } else if (hours === 12) {
        return `${hours}:00 ظهراً`;
    } else {
        return `${hours - 12}:00 مساءً`;
    }
}

// Calculate and display countdown
function getCountdownText(targetDate) {
    const now = new Date();
    const diff = targetDate - now;
    
    if (diff <= 0) return "";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
        return ` (خلال ${hours} ساعة و ${minutes} دقيقة)`;
    } else {
        return ` (خلال ${minutes} دقيقة)`;
    }
}

// Update clinic status with enhanced information
function updateClinicStatus() {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const todayHours = clinicHours[day];
    
    // Get DOM elements
    const statusMessage = getElement('status-message');
    const nextOpening = getElement('next-opening');
    const clinicStatusElem = getElement('clinic-status');
    
    // If elements don't exist, don't proceed
    if (!statusMessage || !nextOpening || !clinicStatusElem) return;
    
    // Update current time display if it exists
    const arabicTimeElem = getElement('arabic-time');
    if (arabicTimeElem) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        arabicTimeElem.textContent = now.toLocaleTimeString('ar-SA', options);
    }
    
    // Remove all possible classes first
    clinicStatusElem.classList.remove('open', 'closed', 'soon');
    
    // Check if the clinic should be open
    if (todayHours.open !== null) {
        // Within opening hours
        if ((hours > todayHours.open && hours < todayHours.close) || 
            (hours === todayHours.open && minutes >= 0) || 
            (hours === todayHours.close && minutes === 0)) {
            
            // Open now
            statusMessage.innerHTML = '<span class="status-with-icon"><i class="fas fa-door-open status-icon"></i> العيادة مفتوحة حالياً</span>';
            
            // Calculate closing time today
            const closingTime = new Date(now);
            closingTime.setHours(todayHours.close, 0, 0, 0);
            const countdown = getCountdownText(closingTime);
            
            nextOpening.textContent = `تغلق اليوم في ${formatTimeArabic(todayHours.close)}${countdown}`;
            clinicStatusElem.classList.add('open');
            
        // Opening soon (within 1 hour)
        } else if (hours === todayHours.open - 1) {
            
            statusMessage.innerHTML = '<span class="status-with-icon"><i class="fas fa-clock status-icon"></i> ستفتح العيادة قريباً</span>';
            
            // Calculate opening time today
            const openingTime = new Date(now);
            openingTime.setHours(todayHours.open, 0, 0, 0);
            const countdown = getCountdownText(openingTime);
            
            nextOpening.textContent = `تفتح اليوم في ${formatTimeArabic(todayHours.open)}${countdown}`;
            clinicStatusElem.classList.add('soon');
            
        // Will open today
        } else if (hours < todayHours.open) {
            
            statusMessage.innerHTML = '<span class="status-with-icon"><i class="fas fa-door-closed status-icon"></i> العيادة مغلقة حالياً</span>';
            
            // Calculate opening time today
            const openingTime = new Date(now);
            openingTime.setHours(todayHours.open, 0, 0, 0);
            const countdown = getCountdownText(openingTime);
            
            nextOpening.textContent = `تفتح اليوم في ${formatTimeArabic(todayHours.open)}${countdown}`;
            clinicStatusElem.classList.add('closed');
            
        // Closed for today, check next opening
        } else {
            const nextDay = (day + 1) % 7;
            const nextDayHours = clinicHours[nextDay];
            
            statusMessage.innerHTML = '<span class="status-with-icon"><i class="fas fa-door-closed status-icon"></i> العيادة مغلقة حالياً</span>';
            
            if (nextDayHours.open !== null) {
                nextOpening.textContent = `تفتح غداً (${arabicDays[nextDay]}) في ${formatTimeArabic(nextDayHours.open)}`;
            } else {
                // Find the next day after tomorrow that's open
                let daysToAdd = 2;
                let nextOpenDay = (day + daysToAdd) % 7;
                
                while (clinicHours[nextOpenDay].open === null && daysToAdd < 7) {
                    daysToAdd++;
                    nextOpenDay = (day + daysToAdd) % 7;
                }
                
                nextOpening.textContent = `تفتح يوم ${arabicDays[nextOpenDay]} في ${formatTimeArabic(clinicHours[nextOpenDay].open)}`;
            }
            
            clinicStatusElem.classList.add('closed');
        }
    } else {
        // Today is a holiday (Friday)
        statusMessage.innerHTML = '<span class="status-with-icon"><i class="fas fa-calendar-times status-icon"></i> العيادة مغلقة اليوم</span>';
        
        // Find next open day
        let daysToAdd = 1;
        let nextOpenDay = (day + daysToAdd) % 7;
        
        while (clinicHours[nextOpenDay].open === null && daysToAdd < 7) {
            daysToAdd++;
            nextOpenDay = (day + daysToAdd) % 7;
        }
        
        nextOpening.textContent = `تفتح يوم ${arabicDays[nextOpenDay]} في ${formatTimeArabic(clinicHours[nextOpenDay].open)}`;
        clinicStatusElem.classList.add('closed');
    }
    
    // Add back-to-top button if it doesn't exist
    createBackToTopButton();
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
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Show/hide back-to-top based on scroll position
    function toggleBackToTop() {
        const backToTop = getElement('back-to-top');
        if (backToTop) {
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    }
    
    // Add scroll event listener if not already added
    if (!window.hasBackToTopListener) {
        window.addEventListener('scroll', toggleBackToTop);
        window.hasBackToTopListener = true;
    }
}

// Format services as cards if they exist
function formatServiceCards() {
    const servicesSection = getElement('services');
    if (servicesSection) {
        const servicesList = servicesSection.querySelector('ul');
        
        if (servicesList) {
            const items = Array.from(servicesList.querySelectorAll('li'));
            
            // Create a service grid
            const serviceGrid = document.createElement('div');
            serviceGrid.className = 'service-grid';
            
            // Map of service keywords to Font Awesome icons
            const serviceIcons = {
                'تشخيص': 'fa-stethoscope',
                'قياس': 'fa-chart-line',
                'اشعة': 'fa-x-ray',
                'علاج': 'fa-heartbeat',
                'اختبارات': 'fa-vial',
                'انقطاع': 'fa-bed',
                'طوارئ': 'fa-ambulance',
                'الاسترواح': 'fa-lungs',
                'تدخين': 'fa-smoking-ban',
                'فحوصات': 'fa-user-md'
            };
            
            // Create a card for each service
            items.forEach(item => {
                const text = item.textContent;
                
                // Find appropriate icon
                let iconClass = 'fa-lungs';
                for (const [keyword, icon] of Object.entries(serviceIcons)) {
                    if (text.includes(keyword)) {
                        iconClass = icon;
                        break;
                    }
                }
                
                // Create card
                const card = document.createElement('div');
                card.className = 'service-card';
                card.innerHTML = `
                    <div class="service-icon"><i class="fas ${iconClass}"></i></div>
                    <div class="service-title">${text.split(',')[0]}</div>
                    <div class="service-description">${text}</div>
                `;
                
                serviceGrid.appendChild(card);
            });
            
            // Replace the list with the grid
            servicesList.parentNode.replaceChild(serviceGrid, servicesList);
        }
    }
}

// Enhancement for clinic status change animations
function addStatusTransitionEffects() {
    const statusElem = getElement('clinic-status');
    if (statusElem) {
        // Add transition class if status changes
        const currentClass = statusElem.className;
        
        if (statusElem.dataset.prevClass && statusElem.dataset.prevClass !== currentClass) {
            statusElem.classList.add('status-transition');
            setTimeout(() => {
                statusElem.classList.remove('status-transition');
            }, 1000);
        }
        
        statusElem.dataset.prevClass = currentClass;
    }
}

// Add emergency notice during high-volume periods
function checkAndAddEmergencyNotice() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // Check if it's a typically busy time (e.g., Sunday mornings)
    const isBusyTime = (day === 0 && hour >= 9 && hour <= 11) || (hour >= 8 && hour <= 9);
    
    const contactSection = getElement('contact');
    const existingNotice = document.querySelector('.emergency-notice');
    
    if (isBusyTime && contactSection && !existingNotice) {
        const notice = document.createElement('div');
        notice.className = 'emergency-notice';
        notice.innerHTML = `
            <div class="emergency-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <div>
                <strong>تنبيه:</strong> نتوقع فترة ازدحام حالياً. يرجى الاتصال قبل الحضور أو حجز موعد مسبقاً لتجنب فترات الانتظار الطويلة.
            </div>
        `;
        
        // Insert before contact section
        contactSection.parentNode.insertBefore(notice, contactSection);
    } else if (!isBusyTime && existingNotice) {
        existingNotice.remove();
    }
}

// Initialize all enhancements
function initClinicFeatures() {
    // Update initial status
    updateClinicStatus();
    
    // Set interval to update every minute
    setInterval(() => {
        updateClinicStatus();
        addStatusTransitionEffects();
        checkAndAddEmergencyNotice();
    }, 60000);
    
    // Format services if needed
    formatServiceCards();
    
    // Check for busy periods
    checkAndAddEmergencyNotice();
    
    // Add waiting time indicator if present
    const appointmentSection = getElement('appointment');
    if (appointmentSection && !document.querySelector('.waiting-time')) {
        // Get current day and time
        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours();
        
        // Estimate waiting time based on historical patterns
        let waitingClass = 'waiting-low';
        let waitingText = 'وقت انتظار قصير (15-20 دقيقة)';
        
        // Sundays and early mornings are typically busy
        if (day === 0 || (hour >= 8 && hour <= 10)) {
            waitingClass = 'waiting-high';
            waitingText = 'وقت انتظار طويل (45-60 دقيقة)';
        } else if (day === 6 || (hour >= 10 && hour <= 13)) {
            waitingClass = 'waiting-medium';
            waitingText = 'وقت انتظار متوسط (30-45 دقيقة)';
        }
        
        const waitingTime = document.createElement('div');
        waitingTime.className = 'waiting-time';
        waitingTime.innerHTML = `
            <p>الوقت المتوقع للانتظار حالياً:</p>
            <div class="waiting-time-indicator ${waitingClass}">${waitingText}</div>
        `;
        
        appointmentSection.insertBefore(waitingTime, appointmentSection.firstElementChild.nextElementSibling);
    }
}

// Run when document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClinicFeatures);
} else {
    initClinicFeatures();
}
