// mobile-form-optimizer.js
document.addEventListener('DOMContentLoaded', () => {
  // Mobile-optimize form elements
  const formElements = document.querySelectorAll('input, select, textarea, button');
  
  formElements.forEach(el => {
    el.style.minHeight = '44px';
    el.style.fontSize = '16px';
    el.style.padding = '12px';
    el.style.margin = '8px 0';
    el.parentElement.style.width = '100%';
    el.dir = el.closest('[dir]')?.dir || 'rtl';
  });

  // Adjust viewport meta tag
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  if(viewportMeta) {
    viewportMeta.setAttribute('content', 
      'width=device-width,initial-scale=1.0,maximum-scale=5.0,user-scalable=yes');
  }

  // Additional RTL-specific fixes
  document.querySelectorAll('input[type="date"]').forEach(dateInput => {
    dateInput.style.textAlign = 'right';
    dateInput.lang = 'ar';
  });
});