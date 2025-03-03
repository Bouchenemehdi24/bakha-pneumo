// dropdown.js - Revised Version
document.addEventListener('DOMContentLoaded', () => {
    // Dropdown toggle function
    function toggleDropdown(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        const isVisible = dropdown.classList.contains('show');

        // Close all dropdowns first
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });

        // Toggle current dropdown if not in form
        if (!isVisible) {
            dropdown.classList.add('show');
        }
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', (event) => {
        const isDropdownClick = event.target.closest('.dropdown');
        const isFormClick = event.target.closest('#appointmentForm-ar');

        if (!isDropdownClick && !isFormClick) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });

    // Initialize dropdown buttons
    document.querySelectorAll('.dropdown a').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const dropdownId = e.target.closest('.dropdown').querySelector('.dropdown-menu').id;
            toggleDropdown(dropdownId);
        });
    });
});