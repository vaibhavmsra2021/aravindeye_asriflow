import PocketBase from 'pocketbase';

const pb = new PocketBase('https://aravindeyecare.pockethost.io');

// Function to register user
async function registerUser() {
    console.log('registerUser function called'); // Debugging

    const emrId = document.getElementById('emr-Id').value.trim();
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const dob = document.getElementById('dob').value;
    const gender = document.getElementById('gender').value;

    console.log({ emrId, firstName, lastName, dob, gender }); // Debugging

    if (!emrId || !firstName || !lastName || !dob || !gender) {
        alert('Please fill in all fields');
        return;
    }

    const userDetails = {
        emrId: emrId,
        firstName: firstName,
        lastName: lastName,
        dob: dob,
        gender: gender
    };

    try {
        // Save user data to PocketBase
        const record = await pb.collection('users').create(userDetails);
        console.log('User registered:', record);

        alert('Registration successful!');
        // Optionally, redirect to login page
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error registering user:', error);
        alert('Registration failed. Please try again.');
    }
}

// Explicitly attach the function to the window object
window.registerUser = registerUser;
