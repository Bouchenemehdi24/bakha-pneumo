// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const MOBILE_BREAKPOINT = 768; // Define a breakpoint for clarity

    // =======================================
    // MOBILE MENU - ENHANCED
    // =======================================
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainMenu = document.getElementById('main-menu');

    if (mobileMenuBtn && mainMenu) {
        // --- 1. Toggle Main Mobile Menu ---
        mobileMenuBtn.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent click from immediately closing due to document listener
            const isOpening = !mainMenu.classList.contains('show');
            
            mainMenu.classList.toggle('show');
            this.setAttribute('aria-expanded', isOpening.toString());
            document.body.classList.toggle('body-no-scroll', isOpening);

            // If opening, close all sub-dropdowns for a fresh start (optional)
            if (isOpening) {
                mainMenu.querySelectorAll('.dropdown-menu.show').forEach(openSubMenu => {
                    openSubMenu.classList.remove('show');
                    const parentLink = openSubMenu.previousElementSibling;
                    if (parentLink) {
                        parentLink.setAttribute('aria-expanded', 'false');
                    }
                });
            }
        });

        // --- 2. Handle Mobile Sub-Dropdown Toggles ---
        mainMenu.querySelectorAll('.dropdown > a').forEach(dropdownToggleLink => {
            dropdownToggleLink.addEventListener('click', function(event) {
                if (window.innerWidth <= MOBILE_BREAKPOINT) {
                    event.preventDefault(); // Prevent navigation
                    event.stopPropagation(); // Prevent closing main menu

                    const subMenu = this.nextElementSibling;
                    if (subMenu && subMenu.classList.contains('dropdown-menu')) {
                        const isOpeningSub = !subMenu.classList.contains('show');
                        
                        // Optional: Close other open sub-menus within the same level
                        // if (isOpeningSub) {
                        //     this.closest('ul').querySelectorAll('.dropdown-menu.show').forEach(otherSubMenu => {
                        //         if (otherSubMenu !== subMenu) {
                        //             otherSubMenu.classList.remove('show');
                        //             const otherParentLink = otherSubMenu.previousElementSibling;
                        //             if (otherParentLink) otherParentLink.setAttribute('aria-expanded', 'false');
                        //         }
                        //     });
                        // }
                        
                        subMenu.classList.toggle('show');
                        this.setAttribute('aria-expanded', subMenu.classList.contains('show'));
                    }
                }
                // For desktop, allow default link behavior or CSS hover effects.
                // If your original toggleDropdown was for desktop JS-driven dropdowns,
                // you'd call it here: else { originalToggleDropdown(this.nextElementSibling.id); }
            });
        });

        // --- 3. Close Mobile Menu on Regular Link Click ---
        mainMenu.querySelectorAll('a').forEach(link => {
            // Exclude dropdown toggles as they have their own logic
            if (!link.parentElement.classList.contains('dropdown')) {
                link.addEventListener('click', function() {
                    if (window.innerWidth <= MOBILE_BREAKPOINT && mainMenu.classList.contains('show')) {
                        mainMenu.classList.remove('show');
                        mobileMenuBtn.setAttribute('aria-expanded', 'false');
                        document.body.classList.remove('body-no-scroll');
                    }
                });
            }
        });
    }

    // --- 4. Close Mobile Menu When Clicking Outside ---
    document.addEventListener('click', function(event) {
        if (mainMenu && mainMenu.classList.contains('show') && window.innerWidth <= MOBILE_BREAKPOINT) {
            // Check if the click is outside the mainMenu and not on the mobileMenuBtn itself
            if (!mainMenu.contains(event.target) && event.target !== mobileMenuBtn && !mobileMenuBtn.contains(event.target)) {
                mainMenu.classList.remove('show');
                if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('body-no-scroll');
            }
        }
    });
    
    // --- 5. Handle Window Resize Events ---
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > MOBILE_BREAKPOINT) {
                // Cleanup when switching to desktop view
                if (mainMenu && mainMenu.classList.contains('show')) {
                    mainMenu.classList.remove('show');
                }
                if (mobileMenuBtn) {
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                }
                document.body.classList.remove('body-no-scroll');

                // Ensure all mobile-style sub-dropdowns are hidden on desktop
                // Desktop versions might rely on hover or different JS
                mainMenu.querySelectorAll('.dropdown-menu.show').forEach(openSubMenu => {
                    openSubMenu.classList.remove('show');
                     const parentLink = openSubMenu.previousElementSibling;
                    if (parentLink) {
                        parentLink.setAttribute('aria-expanded', 'false');
                    }
                });
            }
        }, 200); // Debounce resize event
    });

    // =======================================
    // DARK MODE TOGGLE
    // =======================================
    const themeToggle = document.getElementById('theme-toggle');

    function updateToggleIcon(theme) {
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                if (theme === 'dark') {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                } else {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                }
            }
        }
    }
    
    if (themeToggle) {
        // Apply saved theme on load
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
            updateToggleIcon(savedTheme);
        } else {
            // Optional: Set a default theme if none is saved (e.g., based on system preference)
            // const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            // const defaultTheme = prefersDark ? 'dark' : 'light';
            // document.body.setAttribute('data-theme', defaultTheme);
            // updateToggleIcon(defaultTheme);
        }

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateToggleIcon(newTheme);
        });
    }

    // =======================================
    // AOS INITIALIZATION
    // =======================================
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800, // Animation duration
            once: true,    // Whether animation should happen only once - while scrolling down
            offset: 50,    // Offset (in px) from the original trigger point
        });
    }

    // =======================================
    // DESKTOP DROPDOWN TOGGLE (IF NEEDED & if not CSS based)
    // =======================================
    // This is your original `toggleDropdown` function.
    // It will now ONLY be called if you explicitly call it for desktop,
    // or if your HTML still has `onclick="toggleDropdown('some-id')"` for desktop links.
    // If your desktop dropdowns are CSS hover-based, you might not need this JS part for them.
    window.toggleDropdown = function(dropdownId) {
        // This function is now primarily for desktop if you have JS-driven desktop dropdowns.
        // Mobile dropdowns are handled by the specific event listeners above.
        if (window.innerWidth > MOBILE_BREAKPOINT) {
            const dropdownMenu = document.getElementById(dropdownId);
            if (!dropdownMenu) return;

            const isCurrentlyShown = dropdownMenu.classList.contains('show');
            
            // Close all other open desktop dropdowns first
            document.querySelectorAll('#main-menu .dropdown-menu.show').forEach(openMenu => {
                if (openMenu.id !== dropdownId) {
                    openMenu.classList.remove('show');
                    const parentLink = openMenu.previousElementSibling;
                    if (parentLink) parentLink.setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle the target dropdown
            if (!isCurrentlyShown) { // Only show if it wasn't the one we just closed (or was already open)
                dropdownMenu.classList.add('show');
            } else {
                dropdownMenu.classList.remove('show'); // Explicitly close if it was already open
            }

            const parentLink = dropdownMenu.previousElementSibling;
            if (parentLink) {
                parentLink.setAttribute('aria-expanded', dropdownMenu.classList.contains('show').toString());
            }
        }
    };
    // If desktop dropdowns are JS-driven and NOT using inline onclick, add listeners here:
    // document.querySelectorAll('#main-menu .dropdown > a').forEach(link => {
    //     link.addEventListener('click', function(e) {
    //         if (window.innerWidth > MOBILE_BREAKPOINT) {
    //             e.preventDefault();
    //             const subMenu = this.nextElementSibling;
    //             if (subMenu && subMenu.id) {
    //                 window.toggleDropdown(subMenu.id); // Call the refined desktop toggle
    //             }
    //         }
    //     });
    // });

});
