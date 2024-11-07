// enhanced-features.js

// Back to Top Button Functionality
function initBackToTop() {
    const button = document.createElement('div');
    button.className = 'back-to-top';
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(button);

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            button.classList.add('visible');
        } else {
            button.classList.remove('visible');
        }
    });

    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Waiting Time Estimation
function updateWaitingTime() {
    const now = new Date();
    const hour = now.getHours();
    
    // Simulate different waiting times based on hour
    let waitingClass = 'waiting-low';
    let waitingTime = '15-20';
    
    if (hour >= 9 && hour < 11) {
        waitingClass = 'waiting-high';
        waitingTime = '45-60';
    } else if (hour >= 11 && hour < 14) {
        waitingClass = 'waiting-medium';
        waitingTime = '30-45';
    }
    
    const waitingElements = document.querySelectorAll('.waiting-time-indicator');
    waitingElements.forEach(element => {
        element.className = `waiting-time-indicator ${waitingClass}`;
        element.textContent = `${waitingTime} ${element.getAttribute('data-lang') === 'ar' ? 'دقيقة' : 'minutes'}`;
    });
}

// Form Progress Indicator
function updateFormProgress(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input, select');
    let filledInputs = 0;
    
    inputs.forEach(input => {
        if (input.value) filledInputs++;
    });
    
    const progress = (filledInputs / inputs.length) * 100;
    const progressBar = form.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
}

// Initialize all enhanced features
document.addEventListener('DOMContentLoaded', () => {
    initBackToTop();
    updateWaitingTime();
    
    // Update waiting time every 5 minutes
    setInterval(updateWaitingTime, 300000);
    
    // Add form progress tracking
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const progressBar = document.createElement('div');
        progressBar.className = 'form-progress';
        progressBar.innerHTML = '<div class="progress-bar"></div>';
        form.insertBefore(progressBar, form.firstChild);
        
        form.addEventListener('input', () => updateFormProgress(form.id));
    });
});

// Add smooth scrolling to all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});