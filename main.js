// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle Script
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainMenu = document.querySelector('#main-menu');
    
    if (mobileMenuBtn && mainMenu) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event from bubbling up
            mainMenu.classList.toggle('show');
        });
    }

    // Handle Mobile Dropdowns - This is the key improvement
    const dropdownLinks = document.querySelectorAll('.dropdown > a');
    
    // Add touchstart event for mobile devices
    dropdownLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Check if we're on mobile view
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation();
                
                // Get parent dropdown and its submenu
                const dropdown = this.parentElement;
                const submenu = dropdown.querySelector('.dropdown-menu');
                
                // Close all other open dropdowns first
                document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                    if (menu !== submenu) {
                        menu.classList.remove('show');
                        if (menu.previousElementSibling) {
                            menu.previousElementSibling.setAttribute('aria-expanded', false);
                        }
                    }
                });
                
                // Toggle the current dropdown
                if (submenu) {
                    submenu.classList.toggle('show');
                    this.setAttribute('aria-expanded', submenu.classList.contains('show'));
                }
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (mainMenu && mainMenu.classList.contains('show') && 
            !mainMenu.contains(event.target) && 
            event.target !== mobileMenuBtn) {
            mainMenu.classList.remove('show');
        }
        
        // Also close any open dropdown menus when clicking outside
        if (!event.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
                if (menu.previousElementSibling) {
                    menu.previousElementSibling.setAttribute('aria-expanded', false);
                }
            });
        }
    });

    // Dark Mode Toggle Script - unchanged
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
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
    
    // Original toggleDropdown is kept but improved to support mobile
    window.toggleDropdown = function(id) {
        event.preventDefault();
        event.stopPropagation(); // Prevent event bubbling
        
        const dropdown = document.getElementById(id);
        const backdrop = document.querySelector('.dropdown-backdrop');
        
        if (!dropdown) return; // Safety check
        
        // Close all other dropdowns
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
            if (menu.id !== id) {
                menu.classList.remove('show');
                if (menu.previousElementSibling) {
                    menu.previousElementSibling.setAttribute('aria-expanded', false);
                }
            }
        });
        
        // Toggle the clicked dropdown
        dropdown.classList.toggle('show');
        
        if (backdrop) {
            backdrop.classList.toggle('active');
        }
        
        const button = dropdown.previousElementSibling;
        if (button) {
            button.setAttribute('aria-expanded', dropdown.classList.contains('show'));
        }
    };
    
    // Initialize AOS if available
    if (typeof AOS !== 'undefined') {
        AOS.init();
    }
});
