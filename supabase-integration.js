// Supabase Initialization
const SUPABASE_URL = 'https://nwdxzkmpugzkcxkocder.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53ZHh6a21wdWd6a2N4a29jZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MTM0MDYsImV4cCI6MjA1NjQ4OTQwNn0.J9Ot3uUY3zLxbFpEppcgCVLyEUjwd3Pw2r5yQsqLhTo';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function submitToSupabase(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const successMessage = document.getElementById('success-message-ar');
    const successPopup = document.getElementById('success-popup');

    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        sex: formData.get('sex'),
        phone: formData.get('phone'),
        appointment_date: formData.get('appointment_date')
    };

    submitButton.disabled = true;
    submitButton.innerHTML = 'جاري الإرسال...';

    try {
        const { error } = await supabaseClient
            .from('appointments')
            .insert([data]);

        if (error) throw error;

        // Fill the popup with user details
        document.getElementById('popup-name').textContent = data.name;
        document.getElementById('popup-phone').textContent = data.phone;
        
        // Format date for display
        const appointmentDate = new Date(data.appointment_date);
        const formattedDate = appointmentDate.toLocaleDateString('ar-DZ', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('popup-date').textContent = formattedDate;
        
        // Show the popup
        successPopup.style.display = 'flex';
        
        // Reset the form
        form.reset();
        
    } catch (error) {
        alert('حدث خطأ: ' + error.message);
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = 'إرسال';
    }
}

// Close popup when clicking the X
document.querySelector('.close-popup').addEventListener('click', function() {
    document.getElementById('success-popup').style.display = 'none';
});

// Close popup when clicking outside of it
document.getElementById('success-popup').addEventListener('click', function(event) {
    if (event.target === this) {
        this.style.display = 'none';
    }
});