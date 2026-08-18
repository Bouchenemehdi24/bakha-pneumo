"use strict";

// ============================================================================
// Configuration
// ============================================================================
const CONFIG = {
    MOBILE_BREAKPOINT: 991,
    CLINIC_HOURS: {
        6: { open: 8, close: 16 }, // Saturday
        0: { open: 8, close: 16 }, // Sunday
        1: { open: 8, close: 16 }, // Monday
        2: { open: 8, close: 16 }, // Tuesday
        3: { open: 8, close: 16 }, // Wednesday
        4: { open: 8, close: 16 }, // Thursday
        5: null                     // Friday (Closed)
    },
    TOAST_TIMEOUT: 4000,
    ALGERIAN_PHONE_REGEX: /^0[567]\d{8}$/
};

// ============================================================================
// Utilities
// ============================================================================
const utils = {
    getElement: (id) => document.getElementById(id),

    formatTimeArabic: (hours24) => {
        const ampm = hours24 >= 12 ? 'مساءً' : 'صباحاً';
        let hours = hours24 % 12;
        hours = hours ? hours : 12;
        return `${hours}:00 ${ampm}`;
    },

    cleanAlgerianPhone: (phoneStr) => {
        if (!phoneStr) return '';
        let clean = phoneStr.replace(/[\s\-\(\)\.]/g, '');
        if (clean.startsWith('+213')) clean = '0' + clean.slice(4);
        if (clean.startsWith('00213')) clean = '0' + clean.slice(5);
        return clean;
    },

    showToast: (message, type = 'info') => {
        const existing = document.querySelector('.toast-notification');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `<span>${message}</span>`;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.className = 'toast-close-btn';
        closeBtn.setAttribute('aria-label', 'إغلاق');
        closeBtn.onclick = () => toast.remove();
        toast.appendChild(closeBtn);

        document.body.appendChild(toast);
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, CONFIG.TOAST_TIMEOUT);
    }
};

// ============================================================================
// Mobile Viewport & Touch UI
// ============================================================================
const UI = {
    // Robust iOS Scroll Locker
    lockBodyScroll: (lock) => {
        if (lock) {
            document.body.dataset.scrollY = window.scrollY.toString();
            document.body.style.position = 'fixed';
            document.body.style.top = `-${document.body.dataset.scrollY}px`;
            document.body.style.width = '100%';
        } else {
            const scrollY = parseInt(document.body.dataset.scrollY || '0', 10);
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, scrollY);
        }
    },

    initializeThemeToggle: () => {
        const themeToggle = utils.getElement('theme-toggle');
        if (!themeToggle) return;

        const updateIcon = (theme) => {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        };

        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        updateIcon(currentTheme);

        themeToggle.addEventListener('click', () => {
            const activeTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('bakha_theme', newTheme);
            updateIcon(newTheme);
        });
    },

    initializeMobileDrawer: () => {
        const mobileBtn = utils.getElement('mobileMenuBtn');
        const closeBtn = utils.getElement('closeDrawerBtn');
        const nav = utils.getElement('mainNav');
        const overlay = utils.getElement('menuOverlay');

        if (!nav) return;

        const toggleDrawer = (isOpen) => {
            nav.classList.toggle('active', isOpen);
            if (overlay) overlay.classList.toggle('active', isOpen);
            if (mobileBtn) mobileBtn.setAttribute('aria-expanded', isOpen.toString());
            UI.lockBodyScroll(isOpen);
        };

        if (mobileBtn) mobileBtn.addEventListener('click', () => toggleDrawer(true));
        if (closeBtn) closeBtn.addEventListener('click', () => toggleDrawer(false));
        if (overlay) overlay.addEventListener('click', () => toggleDrawer(false));

        nav.querySelectorAll('.nav-link:not(.dropdown-toggle)').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= CONFIG.MOBILE_BREAKPOINT) {
                    toggleDrawer(false);
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && nav.classList.contains('active')) {
                toggleDrawer(false);
            }
        });
    },

    initializeDropdowns: () => {
        const dropdowns = document.querySelectorAll('.dropdown');

        dropdowns.forEach(dropdown => {
            const toggleBtn = dropdown.querySelector('.dropdown-toggle');
            if (!toggleBtn) return;

            toggleBtn.addEventListener('click', (e) => {
                if (window.innerWidth <= CONFIG.MOBILE_BREAKPOINT) {
                    e.preventDefault();
                    e.stopPropagation();

                    const isOpen = dropdown.classList.toggle('open');
                    toggleBtn.setAttribute('aria-expanded', isOpen.toString());

                    dropdowns.forEach(other => {
                        if (other !== dropdown && other.classList.contains('open')) {
                            other.classList.remove('open');
                            const otherBtn = other.querySelector('.dropdown-toggle');
                            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                        }
                    });
                }
            });
        });

        document.addEventListener('click', () => {
            if (window.innerWidth > CONFIG.MOBILE_BREAKPOINT) {
                dropdowns.forEach(d => d.classList.remove('open'));
            }
        });
    },

    initializeGoogleTranslate: () => {
        window.googleTranslateElementInit = function() {
            try {
                new google.translate.TranslateElement({
                    pageLanguage: 'ar',
                    includedLanguages: 'en,fr,ar',
                    layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false
                }, 'google_translate_element');
            } catch (e) {
                const el = utils.getElement('google_translate_element');
                if (el) el.style.display = 'none';
            }
        };
    },

    showModal: (modalId) => {
        const modal = utils.getElement(modalId);
        if (!modal) return;
        modal.classList.add('active');
        UI.lockBodyScroll(true);
    },

    hideModal: (modalId) => {
        const modal = utils.getElement(modalId);
        if (!modal) return;
        modal.classList.remove('active');
        UI.lockBodyScroll(false);
    }
};

// ============================================================================
// Real-time Clinic Schedule (Africa/Algiers Timezone)
// ============================================================================
const ClinicSchedule = {
    update: () => {
        const arabicTimeEl = utils.getElement('arabic-time');
        const statusMessageEl = utils.getElement('status-message');
        const nextOpeningEl = utils.getElement('next-opening');
        const clinicStatusDiv = utils.getElement('clinic-status');

        const now = new Date();
        const algeriaTimeString = now.toLocaleString('en-US', { timeZone: 'Africa/Algiers' });
        const localNow = new Date(algeriaTimeString);

        if (arabicTimeEl) {
            const options = {
                weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: true,
                timeZone: 'Africa/Algiers'
            };
            arabicTimeEl.textContent = now.toLocaleString('ar-DZ', options);
        }

        if (!statusMessageEl || !nextOpeningEl || !clinicStatusDiv) return;

        const currentDay = localNow.getDay();
        const currentHour = localNow.getHours();
        const currentMinutes = localNow.getMinutes();
        const todayHours = CONFIG.CLINIC_HOURS[currentDay];

        clinicStatusDiv.classList.remove('open', 'closed', 'soon');

        if (todayHours && currentHour >= todayHours.open && currentHour < todayHours.close) {
            clinicStatusDiv.classList.add('open');
            statusMessageEl.textContent = 'العيادة مفتوحة';

            const remainingHours = todayHours.close - currentHour - (currentMinutes > 0 ? 1 : 0);
            if (remainingHours <= 1) {
                nextOpeningEl.textContent = `(تغلق قريباً)`;
            } else {
                nextOpeningEl.textContent = `(حتى ${utils.formatTimeArabic(todayHours.close)})`;
            }
        } else {
            clinicStatusDiv.classList.add('closed');
            statusMessageEl.textContent = 'العيادة مغلقة';

            if (todayHours && currentHour < todayHours.open) {
                clinicStatusDiv.classList.add('soon');
                nextOpeningEl.textContent = `تفتح 08:00 ص`;
            } else {
                let nextDay = (currentDay + 1) % 7;
                let daysCount = 1;
                while (!CONFIG.CLINIC_HOURS[nextDay] && daysCount <= 7) {
                    nextDay = (nextDay + 1) % 7;
                    daysCount++;
                }
                const dayLabel = daysCount === 1 ? 'غداً' : 'السبت';
                nextOpeningEl.textContent = `تفتح ${dayLabel} 08:00 ص`;
            }
        }
    },

    initialize: () => {
        ClinicSchedule.update();
        setInterval(ClinicSchedule.update, 30000);
    }
};

// ============================================================================
// Form Validation & Booking Handler
// ============================================================================
const BookingForm = {
    setupDatePicker: () => {
        const datePicker = utils.getElement('appointmentDate-ar');
        if (!datePicker) return;

        const today = new Date();
        const formatDate = (d) => d.toISOString().split('T')[0];

        datePicker.min = formatDate(today);

        const maxDate = new Date(today);
        maxDate.setMonth(maxDate.getMonth() + 3);
        datePicker.max = formatDate(maxDate);

        datePicker.addEventListener('change', (e) => {
            const val = e.target.value;
            if (!val) return;
            const parts = val.split('-');
            const selDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));

            if (selDate.getDay() === 5) { // Friday
                utils.showToast('العيادة مغلقة يوم الجمعة. الرجاء اختيار يوم آخر.', 'error');
                e.target.value = '';
            }
        });
    },

    initialize: () => {
        BookingForm.setupDatePicker();

        const form = utils.getElement('appointmentForm-ar');
        const modal = utils.getElement('appointmentSuccessPopupOverlay');
        const closeBtn = utils.getElement('modalCloseBtn');
        const okBtn = utils.getElement('modalOkBtn');

        if (!form) return;

        if (closeBtn) closeBtn.addEventListener('click', () => UI.hideModal('appointmentSuccessPopupOverlay'));
        if (okBtn) okBtn.addEventListener('click', () => UI.hideModal('appointmentSuccessPopupOverlay'));
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) UI.hideModal('appointmentSuccessPopupOverlay');
            });
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
            form.querySelectorAll('.field-error').forEach(el => el.textContent = '');

            let hasError = false;

            const nameInput = form.querySelector('#name-ar');
            const sexInput = form.querySelector('#sex-ar');
            const phoneInput = form.querySelector('#phone-ar');
            const dateInput = form.querySelector('#appointmentDate-ar');

            if (!nameInput.value.trim() || nameInput.value.trim().length < 3) {
                nameInput.classList.add('invalid');
                utils.getElement('name-error').textContent = 'يرجى كتابة الاسم واللقب بشكل صحيح';
                hasError = true;
            }

            if (!sexInput.value) {
                sexInput.classList.add('invalid');
                utils.getElement('sex-error').textContent = 'يرجى تحديد الجنس';
                hasError = true;
            }

            const cleanPhone = utils.cleanAlgerianPhone(phoneInput.value);
            if (!CONFIG.ALGERIAN_PHONE_REGEX.test(cleanPhone)) {
                phoneInput.classList.add('invalid');
                utils.getElement('phone-error').textContent = 'رقم هاتف غير صحيح (مثال: 0796222597)';
                hasError = true;
            }

            if (!dateInput.value) {
                dateInput.classList.add('invalid');
                utils.getElement('date-error').textContent = 'يرجى تحديد التاريخ';
                hasError = true;
            }

            if (hasError) return;

            const submitBtn = utils.getElement('submitApptBtn');
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';

            const formData = new FormData(form);
            formData.set('phone', cleanPhone);

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    utils.getElement('popup-appt-name').textContent = formData.get('name');
                    utils.getElement('popup-appt-phone').textContent = cleanPhone;
                    utils.getElement('popup-appt-date').textContent = formData.get('appointment_date');

                    UI.showModal('appointmentSuccessPopupOverlay');
                    form.reset();
                } else {
                    utils.showToast('تعذر إرسال الطلب، يرجى الاتصال هاتفياً.', 'error');
                }
            } catch (err) {
                utils.showToast('تعذر الاتصال بالخادم. تحقق من الإنترنت.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }
        });
    }
};

// ============================================================================
// Application Bootstrap
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    UI.initializeThemeToggle();
    UI.initializeMobileDrawer();
    UI.initializeDropdowns();
    UI.initializeGoogleTranslate();

    ClinicSchedule.initialize();
    BookingForm.initialize();

    // Disable heavy AOS library on mobile viewports for smooth scrolling
    if (typeof AOS !== 'undefined' && window.innerWidth > 768) {
        AOS.init({ duration: 500, once: true });
    }
});
