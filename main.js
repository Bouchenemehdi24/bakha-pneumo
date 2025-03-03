// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle Script
    document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
        document.querySelector('#main-menu').classList.toggle('show');
    });

    // Dark Mode Toggle Script
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
    
    // Dropdown Menu Functionality
    window.toggleDropdown = function(id) {
        event.preventDefault();
        const dropdown = document.getElementById(id);
        const backdrop = document.querySelector('.dropdown-backdrop');
        
        if (!dropdown || !backdrop) return; // Safety check
        
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
        backdrop.classList.toggle('active');
        
        const button = dropdown.previousElementSibling;
        if (button) {
            button.setAttribute('aria-expanded', dropdown.classList.contains('show'));
        }
    };
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const dropdowns = document.querySelectorAll('.dropdown-menu');
        const backdrop = document.querySelector('.dropdown-backdrop');
        
        if (!event.target.closest('.dropdown') && backdrop) {
            dropdowns.forEach(menu => {
                menu.classList.remove('show');
                if (menu.previousElementSibling) {
                    menu.previousElementSibling.setAttribute('aria-expanded', false);
                }
            });
            backdrop.classList.remove('active');
        }
    });
    
    // Close dropdown when a link is clicked
    document.querySelectorAll('.dropdown-menu a').forEach(link => {
        link.addEventListener('click', () => {
            const dropdown = link.closest('.dropdown-menu');
            if (dropdown) {
                dropdown.classList.remove('show');
                const backdrop = document.querySelector('.dropdown-backdrop');
                if (backdrop) {
                    backdrop.classList.remove('active');
                }
                if (dropdown.previousElementSibling) {
                    dropdown.previousElementSibling.setAttribute('aria-expanded', false);
                }
            }
        });
    });
    
    // Initialize AOS if available
    if (typeof AOS !== 'undefined') {
        AOS.init();
    }
});
