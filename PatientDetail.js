import PocketBase from 'https://cdn.jsdelivr.net/npm/pocketbase@0.14.1/dist/pocketbase.es.mjs';

// Initialize PocketBase instance
const pb = new PocketBase('https://aravindeyecare.pockethost.io');

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Retrieve the user session from localStorage
        const storedUser = localStorage.getItem('user');

        if (!storedUser) {
            alert('User not authenticated. Please log in.');
            window.location.href = 'login.html'; // Redirect to login if not authenticated
            return;
        }

        // Parse the stored user data
        const user = JSON.parse(storedUser);

        // Fetch the user's EMR ID and other details from PocketBase using the user ID
        const userDetails = await pb.collection('user').getOne(user.id);

        // Set the data into HTML elements
        document.getElementById('emr-id').textContent = userDetails.emrId || 'N/A';
        document.getElementById('first-name').textContent = userDetails.firstName || 'N/A';
        document.getElementById('last-name').textContent = userDetails.lastName || 'N/A';
        document.getElementById('dob').textContent = userDetails.dob || 'N/A';
        document.getElementById('gender').textContent = userDetails.gender || 'N/A';
    } catch (error) {
        console.error('Error fetching user details:', error);
        alert('An error occurred while fetching patient details. Please try again.');
    }
});
