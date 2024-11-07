// Function to format date and time in Arabic
function getArabicDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false  // Use 24-hour format
    };
    
    return now.toLocaleString('ar-DZ', options);
}

// Function to format date and time in French
function getFrenchDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false  // Use 24-hour format
    };
    
    return now.toLocaleString('fr-FR', options);
}

// Function to update the time displays
function updateDateTime() {
    const arabicTimeElement = document.getElementById('arabic-time');
    const frenchTimeElement = document.getElementById('french-time');
    
    if (arabicTimeElement) {
        arabicTimeElement.textContent = getArabicDateTime();
    }
    if (frenchTimeElement) {
        frenchTimeElement.textContent = getFrenchDateTime();
    }
}

// Update time every second
setInterval(updateDateTime, 1000);

// Initial update
document.addEventListener('DOMContentLoaded', function() {
    updateDateTime();
});
