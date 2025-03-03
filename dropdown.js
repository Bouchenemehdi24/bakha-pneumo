// dropdown.js - Revised Version
document.addEventListener('DOMContentLoaded', () => {
  // Dropdown toggle function
  function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) {
      console.error('Dropdown not found:', dropdownId);
      return;
    }

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
    const isFormClick = event.target.closest('#appointmentForm-ar');
    const isDropdownClick = event.target.closest('.dropdown');

    if (!isDropdownClick && !isFormClick) {
      document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
      });
    }
  });

  // Form interaction handlers
  const formElements = document.querySelectorAll('#appointmentForm-ar input, #appointmentForm-ar select, #appointmentForm-ar textarea');

  formElements.forEach(element => {
    element.addEventListener('focus', () => {
      document.querySelectorAll('nav, .dropdown-menu').forEach(navElement => {
        navElement.classList.remove('show');
        navElement.style.display = 'none';
      });
    });

    element.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });

  // Prevent form from closing dropdowns on mobile
  document.querySelector('#appointmentForm-ar').addEventListener('touchstart', (e) => {
    e.stopPropagation();
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
