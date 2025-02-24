import PocketBase from 'https://cdn.jsdelivr.net/npm/pocketbase@0.14.1/dist/pocketbase.es.mjs';

const pb = new PocketBase('https://aravindeyecare.pockethost.io');

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    loginUser();
});

async function loginUser() {
    const emrId = document.getElementById('emr-Id').value.trim();

    if (!emrId) {
        alert('Please enter your EMR ID');
        return;
    }

    try {
        // Fetch the user record from PocketBase using the EMR ID
        const records = await pb.collection('user').getFullList({
            filter: `emrId = "${emrId}"` // Adjust this filter based on your database field name
        });

        if (records.length > 0) {
            const user = records[0];

            // Manually save the session by storing the user's data in localStorage
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('loggedInEmrId', emrId);

            // Redirect to the details page
            window.location.href = 'PatientDetail.html';
        } else {
            alert('Invalid EMR ID');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        alert('An error occurred while verifying the EMR ID. Please try again.');
    }
}
