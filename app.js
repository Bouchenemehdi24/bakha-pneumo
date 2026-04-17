"use strict";


// ============================================================================
// Core Configuration and Constants
// ============================================================================
const CONFIG = {
    MOBILE_BREAKPOINT: 768,
    CLINIC_HOURS: {
        6: { open: 8, close: 16 }, 0: { open: 8, close: 16 }, 1: { open: 8, close: 16 },
        2: { open: 8, close: 16 }, 3: { open: 8, close: 16 }, 4: { open: 8, close: 16 },
        5: null
    },
    TOAST_TIMEOUT: 5000,
    BACK_TO_TOP_SCROLL_THRESHOLD: 300,
    LOADER_FADE_DURATION: 500,
    GEO_IP_API_URL: 'https://ipapi.co/json/',
    MAX_REMAINING_HOURS_DISPLAY: 8,
    ALGERIAN_PHONE_REGEX: /^0[567]\d{8}$/
};

// ============================================================================
// Utility Functions
// ============================================================================
const utils = {
    getElement: (id) => document.getElementById(id),
    formatTimeArabic: (hours24) => {
        const ampm = hours24 >= 12 ? 'مساءً' : 'صباحاً';
        let hours = hours24 % 12;
        hours = hours ? hours : 12;
        return `${hours}:00 ${ampm}`;
    },
    showToast: (message, type = 'info') => {
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.innerHTML = `<span>${message}</span>`;

        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '×';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.fontWeight = 'bold';
        if (document.documentElement.getAttribute('dir') === 'rtl') {
            closeBtn.style.marginRight = '15px';
        } else {
            closeBtn.style.marginLeft = '15px';
        }
        closeBtn.setAttribute('aria-label', 'إغلاق الإشعار');
        closeBtn.onclick = () => toast.remove();
        toast.appendChild(closeBtn);

        document.body.appendChild(toast);
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, CONFIG.TOAST_TIMEOUT);
    },
    getFlagEmoji: (countryCode) => {
        if (!countryCode || countryCode.length !== 2) return '🌍';
        const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    }
};

// ============================================================================
// UI Components
// ============================================================================
const UI = {
    initializeDarkMode: () => {
        const body = document.body;
        const themeToggle = utils.getElement('theme-toggle');
        if (!themeToggle) return;

        const icon = themeToggle.querySelector('i');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');

        body.setAttribute('data-theme', savedTheme);
        if (icon) icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        themeToggle.setAttribute('aria-label', savedTheme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن');

        themeToggle.addEventListener('click', () => {
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            if (icon) icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            themeToggle.setAttribute('aria-label', newTheme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن');
        });
    },
    initializeMobileMenu: () => {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const mainMenu = utils.getElement('main-menu');
        if (!mobileMenuBtn || !mainMenu) return;

        mobileMenuBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            mainMenu.classList.toggle('active');
            const isExpanded = mainMenu.classList.contains('active');
            mobileMenuBtn.setAttribute('aria-expanded', isExpanded.toString());
        });

        document.addEventListener('click', (event) => {
            if (mainMenu.classList.contains('active') &&
                !mainMenu.contains(event.target) &&
                !mobileMenuBtn.contains(event.target)) {
                mainMenu.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    },
    initializeDropdowns: () => {
        let dropdownCounter = 0;
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            const trigger = dropdown.querySelector('a[role="button"], button[aria-haspopup="true"]');
            const menu = dropdown.querySelector('.dropdown-menu');

            if (!trigger || !menu) return;

            if (!menu.id) {
                menu.id = `dropdown-menu-${dropdownCounter++}`;
            }
            trigger.setAttribute('aria-controls', menu.id);
            menu.setAttribute('role', 'menu');
            menu.querySelectorAll('li > a').forEach(item => item.setAttribute('role', 'menuitem'));

            const searchInputContainer = menu.querySelector('.dropdown-search');
            if (searchInputContainer) {
                const searchInput = searchInputContainer.querySelector('input');
                const menuItems = Array.from(menu.querySelectorAll('li[role="menuitem"] a, li > a'));
                let noResultsMessage = menu.querySelector('.no-results');
                if (!noResultsMessage) {
                    noResultsMessage = document.createElement('li');
                    noResultsMessage.className = 'no-results';
                    noResultsMessage.textContent = 'لا توجد نتائج';
                    noResultsMessage.style.display = 'none';
                    if (searchInputContainer.nextSibling) {
                        menu.insertBefore(noResultsMessage, searchInputContainer.nextSibling);
                    } else {
                        menu.appendChild(noResultsMessage);
                    }
                }

                if (searchInput) {
                    searchInput.addEventListener('input', (e) => {
                        const searchTerm = e.target.value.toLowerCase().trim();
                        let visibleItems = 0;
                        menuItems.forEach(itemAnchor => {
                            const itemLi = itemAnchor.closest('li[role="menuitem"]') || itemAnchor.parentElement;
                            const text = itemAnchor.textContent.toLowerCase();
                            const isMatch = text.includes(searchTerm);
                            itemLi.style.display = isMatch ? '' : 'none';
                            if (isMatch) visibleItems++;
                        });
                        noResultsMessage.style.display = visibleItems === 0 && searchTerm !== '' ? 'block' : 'none';
                    });
                }
            }

            trigger.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                const isExpanded = menu.classList.toggle('show');
                trigger.setAttribute('aria-expanded', isExpanded.toString());

                document.querySelectorAll('.dropdown .dropdown-menu.show').forEach(otherMenu => {
                    if (otherMenu !== menu) {
                        otherMenu.classList.remove('show');
                        const otherTrigger = otherMenu.closest('.dropdown').querySelector('[aria-expanded="true"]');
                        if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
                    }
                });
            });
        });

        document.addEventListener('click', (event) => {
            document.querySelectorAll('.dropdown .dropdown-menu.show').forEach(menu => {
                if (!menu.closest('.dropdown').contains(event.target)) {
                    menu.classList.remove('show');
                    const trigger = menu.closest('.dropdown').querySelector('[aria-expanded="true"]');
                    if (trigger) trigger.setAttribute('aria-expanded', 'false');
                }
            });
        });
    },
    initializeBackToTop: () => {
        let backToTopButton = document.querySelector('.back-to-top');
        if (!backToTopButton) {
            backToTopButton = document.createElement('button');
            backToTopButton.className = 'back-to-top';
            backToTopButton.setAttribute('aria-label', 'العودة إلى الأعلى');
            backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
            document.body.appendChild(backToTopButton);
        }

        window.addEventListener('scroll', () => {
            if (window.pageYOffset > CONFIG.BACK_TO_TOP_SCROLL_THRESHOLD) {
                if (backToTopButton) backToTopButton.style.display = 'flex';
            } else {
                if (backToTopButton) backToTopButton.style.display = 'none';
            }
        });
        if (backToTopButton) {
            backToTopButton.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    },
    initializeLoader: () => {
        let pageLoader = document.querySelector('.page-loader');
        if (!pageLoader) {
            pageLoader = document.createElement('div');
            pageLoader.className = 'page-loader';
            pageLoader.innerHTML = '<div class="spinner"></div>';
            if (document.body) { // Ensure body exists
                 document.body.insertBefore(pageLoader, document.body.firstChild);
            } else { // Fallback if body not ready (should not happen with DOMContentLoaded)
                document.addEventListener('DOMContentLoaded', () => {
                    document.body.insertBefore(pageLoader, document.body.firstChild);
                });
            }
        }

        window.addEventListener('load', () => {
            if (pageLoader) {
                pageLoader.style.opacity = '0';
                setTimeout(() => {
                    if (pageLoader && pageLoader.parentNode) pageLoader.remove();
                }, CONFIG.LOADER_FADE_DURATION);
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
                console.warn("Google Translate failed to initialize:", e);
                const el = utils.getElement('google_translate_element');
                if (el) el.style.display = 'none';
            }
        };
    },
    showPopup: (popupOverlayId) => {
        const overlay = utils.getElement(popupOverlayId);
        if (overlay) {
            overlay.classList.add('active');
            const focusable = overlay.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable) focusable.focus();
        }
    },
    hidePopup: (popupOverlayId) => {
        const overlay = utils.getElement(popupOverlayId);
        if (overlay) {
            overlay.classList.remove('active');
        }
    }
};

// ============================================================================
// Date and Time Features
// ============================================================================
const DateTime = {
    initializeDatePicker: () => {
        const datePicker = utils.getElement('appointmentDate-ar');
        if (!datePicker) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        datePicker.min = today.toISOString().split('T')[0];

        const maxDate = new Date(today);
        maxDate.setMonth(maxDate.getMonth() + 3);
        datePicker.max = maxDate.toISOString().split('T')[0];

        datePicker.addEventListener('change', (e) => {
            const selectedValue = e.target.value;
            if (!selectedValue) return;

            const parts = selectedValue.split('-');
            const selectedDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            selectedDate.setHours(0,0,0,0);

            if (selectedDate < today) {
                utils.showToast('لا يمكن اختيار تاريخ في الماضي.', 'error');
                e.target.value = '';
                return;
            }
            if (selectedDate.getDay() === 5) {
                utils.showToast('عذراً، العيادة مغلقة يوم الجمعة.', 'error');
                e.target.value = '';
                return;
            }
            if (selectedDate > maxDate) {
                 utils.showToast(`يمكنك حجز موعد خلال الثلاثة أشهر القادمة فقط (حتى تاريخ ${maxDate.toLocaleDateString('ar-EG')}).`, 'error');
                e.target.value = '';
                return;
            }
        });
    },
    updateDateTime: () => {
        const arabicTimeElement = utils.getElement('arabic-time');
        if (!arabicTimeElement) return;
        try {
            const now = new Date();
            const options = {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: true,
                timeZone: 'Africa/Algiers'
            };
            arabicTimeElement.textContent = now.toLocaleString('ar-DZ', options);
        } catch(e) {
            console.error("Error updating date/time:", e);
            if (arabicTimeElement) arabicTimeElement.textContent = new Date().toString();
        }
    },
    initializeDateTime: () => {
        DateTime.updateDateTime();
        DateTime.initializeDatePicker();
        setInterval(DateTime.updateDateTime, 1000);
    }
};

// ============================================================================
// Clinic Status Management
// ============================================================================
const ClinicStatus = {
    updateClinicStatus: () => {
        const statusMessageEl = utils.getElement('status-message');
        const nextOpeningEl = utils.getElement('next-opening');
        const clinicStatusDiv = utils.getElement('clinic-status');

        if (!statusMessageEl || !nextOpeningEl || !clinicStatusDiv) return;

        const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Algiers' }));
        const currentDay = now.getDay();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();

        const todayTimetable = CONFIG.CLINIC_HOURS[currentDay];
        let isOpen = false;

        clinicStatusDiv.classList.remove('open', 'closed', 'soon');

        if (todayTimetable) {
            const openTime = todayTimetable.open;
            const closeTime = todayTimetable.close;
            if (currentHour >= openTime && currentHour < closeTime) {
                isOpen = true;
            }
        }

        if (isOpen) {
            clinicStatusDiv.classList.add('open');
            statusMessageEl.textContent = 'العيادة مفتوحة حالياً';
            const closeHour = CONFIG.CLINIC_HOURS[currentDay].close;
            const remainingHours = closeHour - currentHour - (currentMinutes > 0 ? 1 : 0);
            const remainingMinutes = currentMinutes > 0 ? 60 - currentMinutes : 0;

            if (remainingHours < CONFIG.MAX_REMAINING_HOURS_DISPLAY && remainingHours >= 0) {
                let remainingTimeStr = `متبقي: `;
                if (remainingHours > 0) {
                    remainingTimeStr += `${remainingHours} ساعة `;
                }
                if (remainingMinutes > 0 && (remainingHours > 0 || remainingMinutes < 60)) { // Add minutes if hours > 0 OR if it's less than a full hour remaining
                    remainingTimeStr += `${remainingMinutes} دقيقة`;
                } else if (remainingHours === 0 && remainingMinutes === 0 && currentHour === closeHour) {
                     remainingTimeStr = `حتى الساعة ${utils.formatTimeArabic(closeHour)}`;
                } else if (remainingHours === 0 && remainingMinutes === 0){ // Should be caught by currentHour < closeTime
                    remainingTimeStr = `حتى الساعة ${utils.formatTimeArabic(closeHour)}`;
                }
                nextOpeningEl.textContent = remainingTimeStr.trim() || `حتى الساعة ${utils.formatTimeArabic(closeHour)}`; // Fallback
            } else {
                nextOpeningEl.textContent = `حتى الساعة ${utils.formatTimeArabic(closeHour)}`;
            }

        } else {
            clinicStatusDiv.classList.add('closed');
            statusMessageEl.textContent = 'العيادة مغلقة حالياً';
            let nextOpenDayIndex = currentDay;
            let daysUntilNextOpen = 0;
            let opensTodayLater = false;

            if (todayTimetable && currentHour < todayTimetable.open) {
                opensTodayLater = true;
            } else {
                do {
                    nextOpenDayIndex = (nextOpenDayIndex + 1) % 7;
                    daysUntilNextOpen++;
                    if (CONFIG.CLINIC_HOURS[nextOpenDayIndex]) break;
                } while (daysUntilNextOpen <= 7);
            }

            if (opensTodayLater) {
                nextOpeningEl.textContent = `تفتح اليوم الساعة ${utils.formatTimeArabic(todayTimetable.open)}`;
                clinicStatusDiv.classList.add('soon');
            } else if (CONFIG.CLINIC_HOURS[nextOpenDayIndex] && daysUntilNextOpen <= 7) {
                const nextOpenHour = utils.formatTimeArabic(CONFIG.CLINIC_HOURS[nextOpenDayIndex].open);
                const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
                if (daysUntilNextOpen === 1) {
                    nextOpeningEl.textContent = `تفتح غداً (${dayNames[nextOpenDayIndex]}) الساعة ${nextOpenHour}`;
                } else {
                    nextOpeningEl.textContent = `تفتح يوم ${dayNames[nextOpenDayIndex]} الساعة ${nextOpenHour}`;
                }
            } else {
                nextOpeningEl.textContent = 'مغلقة حتى إشعار آخر';
            }
        }
    },
    initializeClinicStatus: () => {
        ClinicStatus.updateClinicStatus();
        setInterval(ClinicStatus.updateClinicStatus, 60000);
    }
};

// ============================================================================
// Form Handling
// ============================================================================
const Forms = {
    clearValidationErrors: (form) => {
        form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    },

    validateField: (field, validationFn, errorMessage) => {
        if (!field) { // Add a check for field existence
            console.warn(`Validation skipped: Field not found.`);
            return true; // Or false, depending on how you want to handle missing fields
        }
        if (!validationFn(field.value.trim())) {
            field.classList.add('invalid');
            utils.showToast(errorMessage, 'error');
            return false;
        }
        field.classList.remove('invalid');
        return true;
    },

    validateAppointmentForm: (form) => {
        Forms.clearValidationErrors(form);
        let isValid = true;

        const nameField = form.querySelector('#name-ar');
        const sexField = form.querySelector('#sex-ar');
        const phoneField = form.querySelector('#phone-ar');
        const dateField = form.querySelector('#appointmentDate-ar');

        // Check if fields exist before validating
        if (nameField && !Forms.validateField(nameField, val => val.length > 0, 'الرجاء إدخال الاسم الكامل.')) isValid = false;
        if (sexField && !Forms.validateField(sexField, val => val !== "", 'الرجاء اختيار الجنس.')) isValid = false;
        if (phoneField && !Forms.validateField(phoneField, val => CONFIG.ALGERIAN_PHONE_REGEX.test(val), 'الرجاء إدخال رقم هاتف جزائري صحيح (مثل 0XXXXXXXXX).')) isValid = false;
        if (dateField && !Forms.validateField(dateField, val => val !== "", 'الرجاء اختيار تاريخ للموعد.')) isValid = false;


        if (dateField && dateField.value) { // Ensure dateField exists before accessing .value
            const today = new Date(); today.setHours(0,0,0,0);
            const maxDate = new Date(today); maxDate.setMonth(maxDate.getMonth() + 3);
            const parts = dateField.value.split('-');
            const selectedDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            selectedDate.setHours(0,0,0,0);

            if (selectedDate < today) {
                utils.showToast('لا يمكن اختيار تاريخ في الماضي.', 'error');
                dateField.classList.add('invalid'); isValid = false;
            } else if (selectedDate.getDay() === 5) {
                utils.showToast('عذراً، العيادة مغلقة يوم الجمعة.', 'error');
                dateField.classList.add('invalid'); isValid = false;
            } else if (selectedDate > maxDate) {
                utils.showToast('يمكنك حجز موعد خلال الثلاثة أشهر القادمة فقط.', 'error');
                dateField.classList.add('invalid'); isValid = false;
            }
        }
        return isValid;
    },

    initializeAppointmentForm: () => {
        const form = utils.getElement('appointmentForm-ar');
        const successPopupOverlay = utils.getElement('appointmentSuccessPopupOverlay');
        const popupNameEl = utils.getElement('popup-appt-name');
        const popupConfirmNameEl = utils.getElement('popup-appt-confirm-name');
        const popupPhoneEl = utils.getElement('popup-appt-phone');
        const popupDateEl = utils.getElement('popup-appt-date');
        const closePopupBtn = successPopupOverlay ? successPopupOverlay.querySelector('.close-popup') : null;

        if (!form) return;

        if (closePopupBtn) {
            closePopupBtn.addEventListener('click', () => UI.hidePopup('appointmentSuccessPopupOverlay'));
        }
        if (successPopupOverlay) {
            successPopupOverlay.addEventListener('click', (event) => {
                if (event.target === successPopupOverlay) {
                    UI.hidePopup('appointmentSuccessPopupOverlay');
                }
            });
        }

        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (!Forms.validateAppointmentForm(form)) {
                utils.showToast('يرجى تصحيح الأخطاء في النموذج.', 'error');
                return;
            }

            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'جاري الإرسال...';
            submitButton.classList.add('loading');

            const formData = new FormData(form);

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    const name = formData.get('name');
                    const phone = formData.get('phone');
                    const dateValue = formData.get('appointment_date');
                    let formattedDate = dateValue;
                    try {
                        const dateParts = dateValue.split('-');
                        const displayDate = new Date(Number(dateParts[0]), Number(dateParts[1])-1, Number(dateParts[2]));
                        formattedDate = displayDate.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    } catch(e) { /* use raw dateValue */ }

                    if (popupNameEl) popupNameEl.textContent = name;
                    if (popupConfirmNameEl) popupConfirmNameEl.textContent = name;
                    if (popupPhoneEl) popupPhoneEl.textContent = phone;
                    if (popupDateEl) popupDateEl.textContent = formattedDate;

                    if (successPopupOverlay) {
                        UI.showPopup('appointmentSuccessPopupOverlay');
                    } else {
                        utils.showToast('تم إرسال طلب موعدك بنجاح! التفاصيل: ' + name + ', ' + phone + ', ' + dateValue, 'success');
                    }
                    form.reset();
                    Forms.clearValidationErrors(form);
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.error || 'عذراً، لم نتمكن من إرسال طلبك. يرجى المحاولة مرة أخرى.';
                    utils.showToast(errorMessage, 'error');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                utils.showToast('حدث خطأ في الاتصال. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.', 'error');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                submitButton.classList.remove('loading');
            }
        });

        ['name-ar', 'sex-ar', 'phone-ar', 'appointmentDate-ar'].forEach(id => {
            const field = utils.getElement(id);
            if (field) {
                field.addEventListener('input', () => field.classList.remove('invalid'));
                field.addEventListener('change', () => field.classList.remove('invalid'));
            }
        });
    }
};


// ============================================================================
// Analytics and Tracking
// ============================================================================
const Analytics = {
    updateTotalVisitors: () => {
        const totalVisitorsEl = utils.getElement('total-visitors');
        if (!totalVisitorsEl) return;

        let totalCount = localStorage.getItem('clinic_total_visitors');
        totalCount = totalCount ? parseInt(totalCount) : 0;

        if (!sessionStorage.getItem('clinic_session_counted')) {
            totalCount++;
            localStorage.setItem('clinic_total_visitors', totalCount.toString());
            sessionStorage.setItem('clinic_session_counted', 'true');
        }
        totalVisitorsEl.textContent = totalCount.toLocaleString('ar-EG');
    },

    updateTodayVisitors: () => {
        const todayVisitorsEl = utils.getElement('today-visitors');
        if (!todayVisitorsEl) return;

        const today = new Date().toISOString().split('T')[0];
        const storageKey = `clinic_visitors_${today}`;

        let todayCount = localStorage.getItem(storageKey);
        todayCount = todayCount ? parseInt(todayCount) : 0;

        if (!sessionStorage.getItem(`clinic_today_counted_${today}`)) {
            todayCount++;
            localStorage.setItem(storageKey, todayCount.toString());
            sessionStorage.setItem(`clinic_today_counted_${today}`, 'true');
        }
        todayVisitorsEl.textContent = todayCount.toLocaleString('ar-EG');

        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('clinic_visitors_') && key !== storageKey) {
                const datePart = key.substring('clinic_visitors_'.length);
                const itemDate = new Date(datePart);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                if (itemDate < thirtyDaysAgo) {
                    localStorage.removeItem(key);
                }
            }
        });
    },

    fetchVisitorCountry: async () => {
        const countryFlagEl = utils.getElement('visitor-country-flag');
        const countryNameEl = utils.getElement('visitor-country-name');

        if (!countryFlagEl || !countryNameEl) return;

        const cachedCountry = sessionStorage.getItem('visitor_country_info');
        if (cachedCountry) {
            try {
                const data = JSON.parse(cachedCountry);
                countryFlagEl.textContent = utils.getFlagEmoji(data.country_code);
                countryNameEl.textContent = data.country_name_ar || data.country_name || 'غير محدد';
                return;
            } catch (e) { /* Malformed cache */ }
        }

        try {
            const response = await fetch(CONFIG.GEO_IP_API_URL);
            if (!response.ok) {
                throw new Error(`GeoIP API request failed: ${response.status}`);
            }
            const data = await response.json();

            if (data && data.country_code) {
                const countryNameArabic = data.country_name_ar || data.country_name;

                countryFlagEl.textContent = utils.getFlagEmoji(data.country_code);
                countryNameEl.textContent = countryNameArabic || 'غير محدد';

                sessionStorage.setItem('visitor_country_info', JSON.stringify({
                    country_code: data.country_code,
                    country_name: data.country_name,
                    country_name_ar: countryNameArabic
                }));

            } else {
                countryNameEl.textContent = 'تعذر التحديد';
                countryFlagEl.textContent = '🏳️';
            }
        } catch (error) {
            console.error("Error fetching visitor country:", error);
            countryNameEl.textContent = 'خطأ في التحديد';
            countryFlagEl.textContent = '⚠️';
        }
    },

    initialize: () => {
        Analytics.updateTotalVisitors();
        Analytics.updateTodayVisitors();
        Analytics.fetchVisitorCountry();
    }
};


// ============================================================================
// Main Initialization on DOMContentLoaded
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    UI.initializeLoader();
    UI.initializeBackToTop();

    UI.initializeDarkMode();
    UI.initializeMobileMenu();
    UI.initializeDropdowns();
    UI.initializeGoogleTranslate();

    DateTime.initializeDateTime();
    ClinicStatus.initializeClinicStatus();
    Forms.initializeAppointmentForm();

    Analytics.initialize();

    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            offset: 120,
            once: true,
        });
    } else {
        console.warn('AOS library is not loaded.');
    }
});