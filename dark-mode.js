// Dark Mode Toggle Script
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Function to toggle dark mode
    function toggleDarkMode(enableDark) {
        if (enableDark) {
            body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            themeToggle.setAttribute('aria-label', 'Switch to Light Mode');
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            themeToggle.setAttribute('aria-label', 'Switch to Dark Mode');
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }
    
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('darkMode');
    
    if (savedTheme !== null) {
        // If user previously set a preference, use that
        toggleDarkMode(savedTheme === 'true');
    } else {
        // Otherwise, respect system preference
        toggleDarkMode(prefersDarkScheme.matches);
    }
    
    // Handle click events
    themeToggle.addEventListener('click', function() {
        const isDarkMode = body.classList.contains('dark-mode');
        toggleDarkMode(!isDarkMode);
        localStorage.setItem('darkMode', !isDarkMode);
    });
    
    // Listen for system preference changes
    prefersDarkScheme.addEventListener('change', function(e) {
        // Only update automatically if user hasn't set a preference
        if (localStorage.getItem('darkMode') === null) {
            toggleDarkMode(e.matches);
        }
    });
});

// CSS Variables
// Add to your CSS:
/*
:root {
    --background-color: #ffffff;
    --text-color: #333333;
    --card-background: #f5f5f5;
    --border-color: #dddddd;
    --highlight-color: #3498db;
    --shadow-color: rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] {
    --background-color: #121212;
    --text-color: #e0e0e0;
    --card-background: #1e1e1e;
    --border-color: #333333;
    --highlight-color: #64b5f6;
    --shadow-color: rgba(0, 0, 0, 0.3);
}

body {
    background-color: var(--background-color);
    color: var(--text-color);
    transition: background-color 0.3s ease, color 0.3s ease;
}

.dark-mode {
    background-color: var(--background-color);
    color: var(--text-color);
}

.dark-mode nav {
    background-color: var(--card-background);
}

.dark-mode .dropdown-menu {
    background-color: var(--card-background);
    border-color: var(--border-color);
}

.dark-mode a {
    color: var(--highlight-color);
}

.dark-mode input, .dark-mode select, .dark-mode textarea {
    background-color: var(--card-background);
    color: var(--text-color);
    border-color: var(--border-color);
}

.dark-mode button {
    background-color: var(--highlight-color);
}

.dark-mode section {
    background-color: var(--card-background);
    border-color: var(--border-color);
    box-shadow: 0 4px 6px var(--shadow-color);
}

#theme-toggle {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    background-color: var(--highlight-color);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s;
    box-shadow: 0 2px 5px var(--shadow-color);
}

#theme-toggle:hover {
    background-color: #2980b9;
}

@media (prefers-color-scheme: dark) {
    :root {
        --background-color: #121212;
        --text-color: #e0e0e0;
        --card-background: #1e1e1e;
        --border-color: #333333;
        --highlight-color: #64b5f6;
        --shadow-color: rgba(0, 0, 0, 0.3);
    }
}
*/
