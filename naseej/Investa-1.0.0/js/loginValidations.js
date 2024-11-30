const ageInput = document.getElementById('age');

// Add event listener for when the input field loses focus
ageInput.addEventListener('blur', function () {
    const value = parseInt(ageInput.value, 10);

    // If the value is outside the range (less than 18 or greater than 40), reset the input
    if (value < 18 || value > 40 || isNaN(value)) {
        ageInput.value = ''; // Reset the input value
        ageInput.setCustomValidity("Age must be between 18 and 40");
        ageInput.reportValidity(); // Show the validation message
    } else {
        // If the value is valid, clear any custom validation message
        ageInput.setCustomValidity('');
    }
});
