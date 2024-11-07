document.addEventListener("DOMContentLoaded", function () {
    // Visitor Counter Logic
    let visitCount = localStorage.getItem('page_view');
    if (visitCount) {
        visitCount = parseInt(visitCount) + 1;
    } else {
        visitCount = 1;
    }
    localStorage.setItem('page_view', visitCount);
    document.getElementById('visitor-count').textContent = visitCount;

    // Country Tracker Logic
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
            document.getElementById('visitor-country').textContent = data.country_name || 'غير معروف';
        })
        .catch(() => {
            document.getElementById('visitor-country').textContent = 'غير متاح';
        });
});
