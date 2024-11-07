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

function updateClinicStatus() {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    const todayHours = clinicHours[day];

    const statusMessage = document.getElementById('status-message');
    const nextOpening = document.getElementById('next-opening');

    if (todayHours.open !== null) {
        if (hours > todayHours.open && hours < todayHours.close || (hours === todayHours.open && minutes >= 0) || (hours === todayHours.close && minutes === 0)) {
            statusMessage.textContent = "العيادة مفتوحة حالياً";
            nextOpening.textContent = `تغلق اليوم في الساعة ${todayHours.close}:00`;
        } else if (hours < todayHours.open) {
            statusMessage.textContent = "العيادة مغلقة حالياً";
            nextOpening.textContent = `تفتح اليوم في الساعة ${todayHours.open}:00`;
        } else {
            const nextDay = (day + 1) % 7;
            const nextDayHours = clinicHours[nextDay];
            statusMessage.textContent = "العيادة مغلقة حالياً";
            if (nextDayHours.open !== null) {
                nextOpening.textContent = `تفتح غداً في الساعة ${nextDayHours.open}:00`;
            } else {
                nextOpening.textContent = "تفتح يوم السبت الساعة 8:00 صباحاً";
            }
        }
    } else {
        statusMessage.textContent = "العيادة مغلقة حالياً";
        nextOpening.textContent = "تفتح يوم السبت الساعة 8:00 صباحاً";
    }
}

// Update the status every minute to keep it accurate
setInterval(updateClinicStatus, 60000);
updateClinicStatus(); // Initial call to display immediately on load
