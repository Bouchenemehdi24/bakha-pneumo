"use strict";

// ============================================================================
// Core Configuration & Algerian Clinic Timetable
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
    TOAST_TIMEOUT: 4500,
    ALGERIAN_PHONE_REGEX: /^0[567]\d{8}$/
};

// ============================================================================
// Utility Helpers
// ============================================================================
const utils = {
    getElement: (id) => document.getElementById(id),

    isFrenchLocale: () => document.documentElement.lang === 'fr',

    formatTimeArabic: (hours24) => {
        const ampm = hours24 >= 12 ? 'مساءً' : 'صباحاً';
        let hours = hours24 % 12;
        hours = hours ? hours : 12;
        return `${hours}:00 ${ampm}`;
    },

    formatTimeFrench: (hours24) => {
        return `${hours24}:00`;
    },

    cleanAlgerianPhone: (phoneStr) => {
        if (!phoneStr) return '';
        let clean = phoneStr.replace(/[\s\-\(\)\.]/g, '');
        if (clean.startsWith('+213')) clean = '0' + clean.slice(4);
        if (clean.startsWith('00213')) clean = '0' + clean.slice(5);
        return clean;
    },

    showToast: (message, type = 'info') => {
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `<span>${message}</span>`;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.className = 'toast-close-btn';
        closeBtn.setAttribute('aria-label', utils.isFrenchLocale() ? 'Fermer' : 'إغلاق');
        closeBtn.onclick = () => toast.remove();
        toast.appendChild(closeBtn);

        document.body.appendChild(toast);
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, CONFIG.TOAST_TIMEOUT);
    }
};

// ============================================================================
// UI & Theme Management
// ============================================================================
const UI = {
    initializeThemeToggle: () => {
        const themeToggle = utils.getElement('theme-toggle');
        if (!themeToggle) return;

        const updateIcon = (theme) => {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
            const ariaLabel = theme === 'dark'
                ? (utils.isFrenchLocale() ? 'Activer le mode clair' : 'تفعيل الوضع الفاتح')
                : (utils.isFrenchLocale() ? 'Activer le mode sombre' : 'تفعيل الوضع الداكن');
            themeToggle.setAttribute('aria-label', ariaLabel);
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
            document.body.style.overflow = isOpen ? 'hidden' : '';
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

    initializeSymptomNavigator: () => {
        const tabs = document.querySelectorAll('.symptom-tab');
        const panels = document.querySelectorAll('.symptom-panel');
        if (!tabs.length || !panels.length) return;

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetPanelId = tab.getAttribute('aria-controls');
                if (!targetPanelId) return;

                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');

                panels.forEach(p => {
                    if (p.id === targetPanelId) {
                        p.classList.add('active');
                        p.removeAttribute('hidden');
                    } else {
                        p.classList.remove('active');
                        p.setAttribute('hidden', 'true');
                    }
                });
            });
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
        document.body.style.overflow = 'hidden';
        const focusable = modal.querySelector('button, [tabindex="0"]');
        if (focusable) focusable.focus();
    },

    hideModal: (modalId) => {
        const modal = utils.getElement(modalId);
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// ============================================================================
// Clinic Real-time Status Tracker (Algerian Timezone)
// ============================================================================
const ClinicSchedule = {
    update: () => {
        const timeEl = utils.getElement('arabic-time');
        const statusMessageEl = utils.getElement('status-message');
        const nextOpeningEl = utils.getElement('next-opening');
        const clinicStatusDiv = utils.getElement('clinic-status');

        const now = new Date();
        const algeriaTimeString = now.toLocaleString('en-US', { timeZone: 'Africa/Algiers' });
        const localNow = new Date(algeriaTimeString);
        const isFR = utils.isFrenchLocale();

        if (timeEl) {
            const locale = isFR ? 'fr-DZ' : 'ar-DZ';
            const options = {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: !isFR,
                timeZone: 'Africa/Algiers'
            };
            timeEl.textContent = now.toLocaleString(locale, options);
        }

        if (!statusMessageEl || !nextOpeningEl || !clinicStatusDiv) return;

        const currentDay = localNow.getDay();
        const currentHour = localNow.getHours();
        const currentMinutes = localNow.getMinutes();
        const todayHours = CONFIG.CLINIC_HOURS[currentDay];

        clinicStatusDiv.classList.remove('open', 'closed', 'soon');

        if (todayHours && currentHour >= todayHours.open && currentHour < todayHours.close) {
            clinicStatusDiv.classList.add('open');
            statusMessageEl.textContent = isFR ? 'Cabinet actuellement ouvert' : 'العيادة مفتوحة حالياً';

            const remainingHours = todayHours.close - currentHour - (currentMinutes > 0 ? 1 : 0);
            const remainingMinutes = currentMinutes > 0 ? 60 - currentMinutes : 0;

            if (remainingHours <= 2) {
                nextOpeningEl.textContent = isFR
                    ? `(Ferme dans ${remainingHours}h ${remainingMinutes}m)`
                    : `(تغلق بعد ${remainingHours} س و ${remainingMinutes} د)`;
            } else {
                const timeStr = isFR ? utils.formatTimeFrench(todayHours.close) : utils.formatTimeArabic(todayHours.close);
                nextOpeningEl.textContent = isFR ? `(Jusqu'à ${timeStr})` : `(حتى الساعة ${timeStr})`;
            }
        } else {
            clinicStatusDiv.classList.add('closed');
            statusMessageEl.textContent = isFR ? 'Cabinet actuellement fermé' : 'العيادة مغلقة حالياً';

            if (todayHours && currentHour < todayHours.open) {
                clinicStatusDiv.classList.add('soon');
                const openStr = isFR ? utils.formatTimeFrench(todayHours.open) : utils.formatTimeArabic(todayHours.open);
                nextOpeningEl.textContent = isFR ? `Ouvre aujourd'hui à ${openStr}` : `تفتح اليوم على ${openStr}`;
            } else {
                let nextDay = (currentDay + 1) % 7;
                let daysCount = 1;
                while (!CONFIG.CLINIC_HOURS[nextDay] && daysCount <= 7) {
                    nextDay = (nextDay + 1) % 7;
                    daysCount++;
                }

                const dayNamesAr = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
                const dayNamesFr = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

                if (isFR) {
                    const dayLabel = daysCount === 1 ? 'demain' : `le ${dayNamesFr[nextDay]}`;
                    const openHour = CONFIG.CLINIC_HOURS[nextDay] ? utils.formatTimeFrench(CONFIG.CLINIC_HOURS[nextDay].open) : '';
                    nextOpeningEl.textContent = `Ouvre ${dayLabel} à ${openHour}`;
                } else {
                    const dayLabel = daysCount === 1 ? 'غداً' : `يوم ${dayNamesAr[nextDay]}`;
                    const openHour = CONFIG.CLINIC_HOURS[nextDay] ? utils.formatTimeArabic(CONFIG.CLINIC_HOURS[nextDay].open) : '';
                    nextOpeningEl.textContent = `تفتح ${dayLabel} الساعة ${openHour}`;
                }
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
    setupDatePicker: (datePickerId) => {
        const datePicker = utils.getElement(datePickerId);
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
                const msg = utils.isFrenchLocale()
                    ? 'Le cabinet est fermé le vendredi. Veuillez choisir un autre jour.'
                    : 'العيادة مغلقة يوم الجمعة. يرجى اختيار يوم آخر.';
                utils.showToast(msg, 'error');
                e.target.value = '';
            }
        });
    },

    initializeForm: (formId, isFR) => {
        const form = utils.getElement(formId);
        if (!form) return;

        BookingForm.setupDatePicker(isFR ? 'appointmentDate-fr' : 'appointmentDate-ar');

        const modal = utils.getElement('appointmentSuccessPopupOverlay');
        const closeBtn = utils.getElement('modalCloseBtn');
        const okBtn = utils.getElement('modalOkBtn');

        if (closeBtn) closeBtn.addEventListener('click', () => UI.hideModal('appointmentSuccessPopupOverlay'));
        if (okBtn) okBtn.addEventListener('click', () => UI.hideModal('appointmentSuccessPopupOverlay'));
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) UI.hideModal('appointmentSuccessPopupOverlay');
            });
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Clear previous errors
            form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
            form.querySelectorAll('.field-error').forEach(el => el.textContent = '');

            let hasError = false;

            const nameInput = form.querySelector(isFR ? '#name-fr' : '#name-ar');
            const sexInput = form.querySelector(isFR ? '#sex-fr' : '#sex-ar');
            const phoneInput = form.querySelector(isFR ? '#phone-fr' : '#phone-ar');
            const dateInput = form.querySelector(isFR ? '#appointmentDate-fr' : '#appointmentDate-ar');

            const nameErrEl = utils.getElement(isFR ? 'name-error-fr' : 'name-error');
            const sexErrEl = utils.getElement(isFR ? 'sex-error-fr' : 'sex-error');
            const phoneErrEl = utils.getElement(isFR ? 'phone-error-fr' : 'phone-error');
            const dateErrEl = utils.getElement(isFR ? 'date-error-fr' : 'date-error');

            if (!nameInput.value.trim() || nameInput.value.trim().length < 3) {
                nameInput.classList.add('invalid');
                if (nameErrEl) nameErrEl.textContent = isFR ? 'Veuillez saisir un nom et prénom valides' : 'يرجى كتابة الاسم واللقب بشكل صحيح';
                hasError = true;
            }

            if (!sexInput.value) {
                sexInput.classList.add('invalid');
                if (sexErrEl) sexErrEl.textContent = isFR ? 'Veuillez sélectionner le sexe' : 'يرجى تحديد الجنس';
                hasError = true;
            }

            const cleanPhone = utils.cleanAlgerianPhone(phoneInput.value);
            if (!CONFIG.ALGERIAN_PHONE_REGEX.test(cleanPhone)) {
                phoneInput.classList.add('invalid');
                if (phoneErrEl) phoneErrEl.textContent = isFR ? 'Veuillez saisir un numéro algérien valide (ex: 0663755584)' : 'يرجى إدخال رقم هاتف جزائري صحيح (مثل 0663755584)';
                hasError = true;
            }

            if (!dateInput.value) {
                dateInput.classList.add('invalid');
                if (dateErrEl) dateErrEl.textContent = isFR ? 'Veuillez sélectionner une date' : 'يرجى تحديد تاريخ الموعد';
                hasError = true;
            }

            if (hasError) return;

            // Submit to Formspree
            const submitBtn = utils.getElement(isFR ? 'submitApptBtn-fr' : 'submitApptBtn');
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = isFR ? '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...' : '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';

            const formData = new FormData(form);
            formData.set('phone', cleanPhone);

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    const name = formData.get('name') || '';
                    const dateVal = formData.get('appointment_date') || '';

                    utils.getElement('popup-appt-name').textContent = name;
                    utils.getElement('popup-appt-phone').textContent = cleanPhone;
                    utils.getElement('popup-appt-date').textContent = dateVal;

                    UI.showModal('appointmentSuccessPopupOverlay');
                    form.reset();
                } else {
                    const errData = await response.json().catch(() => ({}));
                    const msg = isFR
                        ? (errData.error || 'Impossible d\'envoyer la demande. Veuillez contacter le cabinet par téléphone.')
                        : (errData.error || 'تعذر إرسال الطلب. يرجى الاتصال هاتفياً بالعيادة.');
                    utils.showToast(msg, 'error');
                }
            } catch (err) {
                const msg = isFR
                    ? 'Problème de connexion. Veuillez vérifier votre connexion internet.'
                    : 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.';
                utils.showToast(msg, 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }
        });
    },

    initialize: () => {
        BookingForm.initializeForm('appointmentForm-ar', false);
        BookingForm.initializeForm('appointmentForm-fr', true);
    }
};

// ============================================================================
// Application Bootstrap
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    UI.initializeThemeToggle();
    UI.initializeMobileDrawer();
    UI.initializeDropdowns();
    UI.initializeSymptomNavigator();
    UI.initializeGoogleTranslate();

    ClinicSchedule.initialize();
    BookingForm.initialize();

    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 600,
            offset: 50,
            once: true,
            disable: 'mobile'
        });
    }
});