// Dropdown functionality
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    dropdown.classList.toggle('show');
}

// Close dropdowns when clicking outside
window.onclick = function(event) {
    if (!event.target.matches('.dropdown a')) {
        const dropdowns = document.getElementsByClassName('dropdown-menu');
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

// Close menu on form interaction
document.querySelectorAll('#appointmentForm-ar input, #appointmentForm-ar select, #appointmentForm-ar textarea').forEach(element => {
  element.addEventListener('focus', () => {
    document.querySelectorAll('nav, .dropdown-menu').forEach(navElement => {
      navElement.style.display = 'none';
    });
  });
});

// Prevent menu opening while form is focused
document.querySelector('#appointmentForm-ar').addEventListener('click', (e) => {
  e.stopPropagation();
});
