// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // =======================================
    // MOBILE MENU - COMPLETELY REWRITTEN
    // =======================================
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainMenu = document.querySelector('#main-menu');
    
    // 1. First, let's fix the toggle button
    if (mobileMenuBtn && mainMenu) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            mainMenu.classList.toggle('show');
            
            // Toggle aria-expanded attribute for accessibility
            const isExpanded = mainMenu.classList.contains('show');
            this.setAttribute('aria-expanded', isExpanded);
            
            // Optional: Add a class to the body to prevent scrolling when menu is open
            document.body.classList.toggle('menu-open', isExpanded);
        });
    }
    
    // 2. Let's disable the original dropdown function for mobile
    const originalToggleDropdown = window.toggleDropdown;
    window.toggleDropdown = function(id) {
        // On mobile, we'll handle this differently
        if (window.innerWidth <= 768) {
            event.preventDefault();
            event.stopPropagation();
            
            const dropdown = document.getElementById(id);
            if (!dropdown) return;
            
            // Toggle only this dropdown
            dropdown.classList.toggle('show');
            
            // Toggle aria-expanded attribute on the parent link
            const button = dropdown.previousElementSibling;
            if (button) {
                button.setAttribute('aria-expanded', dropdown.classList.contains('show'));
            }
        } else {
            // On desktop, use the original function
            originalToggleDropdown(id);
        }
    };
    
    // 3. Add direct click handlers to dropdown links for mobile
    document.querySelectorAll('.dropdown > a').forEach(link => {
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation();
                
                // Find the sibling dropdown menu
                const dropdownMenu = this.nextElementSibling;
                if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
                    dropdownMenu.classList.toggle('show');
                    this.setAttribute('aria-expanded', dropdownMenu.classList.contains('show'));
                }
            }
        });
    });
    
    // 4. Close dropdown menus when clicking on regular links in mobile menu
    document.querySelectorAll('#main-menu a:not(.dropdown > a)').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                // Close the mobile menu after clicking a link
                mainMenu.classList.remove('show');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                
                // Remove menu-open class from body
                document.body.classList.remove('menu-open');
            }
        });
    });
    
    // 5. Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768 && 
            mainMenu && 
            mainMenu.classList.contains('show') && 
            !mainMenu.contains(event.target) && 
            event.target !== mobileMenuBtn) {
            
            mainMenu.classList.remove('show');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('menu-open');
        }
    });
    
    // 6. Handle window resize events
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // If transitioning from mobile to desktop view, clean up mobile-specific states
            if (window.innerWidth > 768) {
                document.body.classList.remove('menu-open');
                
                // Reset aria-expanded attributes
                if (mobileMenuBtn) {
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                }
                
                // Optional: Close all open dropdowns when resizing to desktop
                document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                    if (window.innerWidth > 768) {
                        menu.classList.remove('show');
                    }
                });
            }
        }, 250); // Debounce the resize event
    });
    
    // The rest of your existing JavaScript remains unchanged
    // =======================================
    // DARK MODE TOGGLE
    // =======================================
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const body = document.body;
        
        // Check for saved theme in localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            body.setAttribute('data-theme', savedTheme);
            updateToggleIcon(savedTheme);
        }
        
        // Toggle theme on button click
        themeToggle.addEventListener('click', () => {
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateToggleIcon(newTheme);
        });
    }
    
    // Update the toggle button icon
    function updateToggleIcon(theme) {
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
    
    // Initialize AOS if available
    if (typeof AOS !== 'undefined') {
        AOS.init();
    }
});
