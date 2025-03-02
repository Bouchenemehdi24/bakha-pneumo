// main.js

// Dark Mode Toggle Script
const themeToggle = document.getElementById('theme-toggle');
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
function toggleDropdown(id) {
    event.preventDefault();
    const dropdown = document.getElementById(id);
    const backdrop = document.querySelector('.dropdown-backdrop');

    // Close all other dropdowns
    document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        if (menu.id !== id) {
            menu.classList.remove('show');
            menu.previousElementSibling.setAttribute('aria-expanded', false);
        }
    });

    // Toggle the clicked dropdown
    dropdown.classList.toggle('show');
    backdrop.classList.toggle('active');
    const button = dropdown.previousElementSibling;
    button.setAttribute('aria-expanded', dropdown.classList.contains('show'));
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    const backdrop = document.querySelector('.dropdown-backdrop');

    if (!event.target.closest('.dropdown')) {
        dropdowns.forEach(menu => {
            menu.classList.remove('show');
            menu.previousElementSibling.setAttribute('aria-expanded', false);
        });
        backdrop.classList.remove('active');
    }
});

// Close dropdown when a link is clicked
document.querySelectorAll('.dropdown-menu a').forEach(link => {
    link.addEventListener('click', () => {
        const dropdown = link.closest('.dropdown-menu');
        dropdown.classList.remove('show');
        document.querySelector('.dropdown-backdrop').classList.remove('active');
        dropdown.previousElementSibling.setAttribute('aria-expanded', false);
    });
});

// Initialize AOS
AOS.init();