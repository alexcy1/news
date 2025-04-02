
import { ProfileService } from './services/ProfileService.mjs';
import { Validator } from './validation.mjs';
import { Header } from './components/Header.mjs';
import { AuthGuard } from './services/AuthGuard.mjs';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check authentication
        if (!AuthGuard.checkAuth()) {
            window.location.href = '/signin.html?redirect=' + encodeURIComponent('/update-profile.html');
            return;
        }

        // Load profile data
        const profileData = await ProfileService.fetchUserProfile();
        populateForm(profileData);

        // Setup form submission
        document.getElementById('update-profile-form').addEventListener('submit', handleFormSubmit);
    } catch (error) {
        console.error('Profile update initialization error:', error);
        showError(error.message || 'Failed to load profile data');
    }
});

function populateForm(data) {
    const { user, profile } = data;
    
    document.getElementById('name').value = profile.name || '';
    document.getElementById('username').value = user.username || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('biography').value = profile.biography || '';
    document.getElementById('professionalInfo').value = profile.professionalInfo || '';
    document.getElementById('profileImage').value = profile.profileImage || '';
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    try {
        const form = e.target;
        const formData = {
            name: form.name.value,
            biography: form.biography.value,
            professionalInfo: form.professionalInfo.value,
            profileImage: form.profileImage.value
        };

        // Basic validation
        if (!Validator.validateRequiredFields(formData, ['name'])) {
            throw new Error('Name is required');
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="btn-text">Updating...</span>';

        // Update profile
        const updatedProfile = await ProfileService.updateProfile(formData);
        
        // Show success message
        showMessage('Profile updated successfully!', 'success');
        
        // Update header with new data
        new Header().updateAuthState();
        
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="btn-text">Update Profile</span>';

    } catch (error) {
        console.error('Profile update error:', error);
        showError(error.message || 'Failed to update profile');
        
        // Reset button state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="btn-text">Update Profile</span>';
    }
}

function showError(message) {
    const errorDiv = document.getElementById('form-error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => errorDiv.style.display = 'none', 5000);
}

function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `global-message ${type}`;
    messageDiv.textContent = message;
    
    const container = document.querySelector('.auth-form');
    container.prepend(messageDiv);
    
    setTimeout(() => messageDiv.remove(), 5000);
}