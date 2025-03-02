function submitForm(event, formId) {
    event.preventDefault();
    if (!validateForm(formId)) return;
    
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    const successMessageId = formId === "appointmentForm-ar" ? "success-message-ar" : "success-message-fr";
    const successMessage = document.getElementById(successMessageId);
    
    // Convert FormData to URL-encoded format
    const params = new URLSearchParams();
    formData.forEach((value, key) => {
        params.append(key, value);
    });
    
    // Add timestamp
    params.append('timestamp', new Date().toISOString());
    
    // Replace with your Google Apps Script Web App URL
    fetch('https://script.google.com/macros/s/AKfycbyaRRL2bIRPnDywipSKaxCoygkSejrnfOkp2qg5zKb6bVQDOPDtI0RLLaN1bky0vn-hWg/exec', {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        mode: 'no-cors' // Add this to handle CORS issues
    })
    .then(response => {
        form.reset();
        form.style.display = "none"; // Hide the form after successful submission
        successMessage.style.display = "block";
        // Hide success message after 5 seconds (optional)
        setTimeout(() => {
            successMessage.style.display = "none";
        }, 5000);
    })
    .catch(error => {
        alert(formId.includes('-ar') ? 
            'خطأ في الشبكة. تأكد من الاتصال بالإنترنت وحاول مجددًا.' : 
            'Erreur réseau. Vérifiez votre connexion et réessayez.');
        console.error("Error:", error);
    });
}
