
import { qs, setClick } from '../utils.mjs';
import { ProfileService } from '../services/ProfileService.mjs';
import { Header } from './Header.mjs';
import { AuthGuard } from '../services/AuthGuard.mjs';

export class Profile {
  constructor() {
    this.elements = {
      profileImageContainer: qs('.profile-image-container'),
      profileName: qs('.profile-name'),
      profileUsername: qs('.profile-username'),
      profileEmail: qs('.email-value'),
      profileRole: qs('.role-badge'),
      profileBio: qs('.biography-content'),
      profileProfessionalInfo: qs('.professional-info-content'),
      editProfileBtn: qs('#edit-profile-btn'),
      deleteProfileBtn: qs('#delete-profile-btn'),
      editModal: qs('#edit-profile-modal'),
      deleteModal: qs('#delete-confirm-modal'),
      editForm: qs('#edit-profile-form'),
      confirmDeleteBtn: qs('#confirm-delete-btn'),
      cancelDeleteBtn: qs('#cancel-delete-btn'),
      closeModalButtons: document.querySelectorAll('.close-modal')
    };

    // Bind methods
    this.showEditModal = this.showEditModal.bind(this);
    this.hideEditModal = this.hideEditModal.bind(this);
    this.showDeleteModal = this.showDeleteModal.bind(this);
    this.hideDeleteModal = this.hideDeleteModal.bind(this);
    this.handleProfileUpdate = this.handleProfileUpdate.bind(this);
    this.handleProfileDeletion = this.handleProfileDeletion.bind(this);
  }

  async init() {
    try {
      if (!AuthGuard.checkAuth()) {
        window.location.href = '/signin.html?redirect=' + encodeURIComponent(window.location.pathname);
        return;
      }

      const profileData = await this.loadProfileData();
      
      if (!profileData || !profileData.user) {
        throw new Error('Could not load profile information');
      }
      
      this.updateProfileUI(profileData);
      this.setupEventListeners();
    } catch (error) {
      console.error('Profile initialization error:', error);
      this.showErrorState(new Error('Failed to load profile. Please try again.'));
    }
  }

  async loadProfileData() {
    try {
      // Always fetch fresh data from server
      const freshData = await ProfileService.fetchUserProfile();
      
      // Merge with existing localStorage data if available
      const existingData = JSON.parse(localStorage.getItem('userProfile')) || {};
      const mergedData = {
        user: { ...existingData.user, ...freshData.user },
        profile: { ...existingData.profile, ...freshData.profile }
      };
      
      localStorage.setItem('userProfile', JSON.stringify(mergedData));
      return mergedData;
    } catch (error) {
      console.error('Error loading profile data:', error);
      
      // Fallback to localStorage if available
      const existingData = JSON.parse(localStorage.getItem('userProfile'));
      if (existingData) return existingData;
      
      // Ultimate fallback
      return {
        user: { username: 'user', email: '', role: 'user' },
        profile: { 
          name: 'User', 
          biography: '', 
          professionalInfo: '',
          profileImage: 'https://ui-avatars.com/api/?name=U&background=random'
        }
      };
    }
  }

  setupEventListeners() {
    // Edit Profile
    if (this.elements.editProfileBtn) {
      this.elements.editProfileBtn.addEventListener('click', this.showEditModal);
    }
    
    // Delete Profile
    if (this.elements.deleteProfileBtn) {
      this.elements.deleteProfileBtn.addEventListener('click', this.showDeleteModal);
    }
    
    // Modal close buttons
    if (this.elements.closeModalButtons) {
      this.elements.closeModalButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          this.hideEditModal();
          this.hideDeleteModal();
        });
      });
    }
    
    if (this.elements.cancelDeleteBtn) {
      this.elements.cancelDeleteBtn.addEventListener('click', this.hideDeleteModal);
    }
    
    // Form submission
    if (this.elements.editForm) {
      this.elements.editForm.addEventListener('submit', this.handleProfileUpdate);
    }
    
    if (this.elements.confirmDeleteBtn) {
      this.elements.confirmDeleteBtn.addEventListener('click', this.handleProfileDeletion);
    }
  }

  showEditModal() {
    const profileData = JSON.parse(localStorage.getItem('userProfile'));
    if (profileData) {
      const nameInput = qs('#edit-name');
      const bioInput = qs('#edit-bio');
      const professionalInput = qs('#edit-professional');
      
      if (nameInput) nameInput.value = profileData.profile.name || '';
      if (bioInput) bioInput.value = profileData.profile.biography || '';
      if (professionalInput) professionalInput.value = profileData.profile.professionalInfo || '';
    }
    if (this.elements.editModal) {
      this.elements.editModal.style.display = 'block';
    }
  }

  hideEditModal() {
    if (this.elements.editModal) {
      this.elements.editModal.style.display = 'none';
    }
  }

  showDeleteModal() {
    if (this.elements.deleteModal) {
      this.elements.deleteModal.style.display = 'block';
    }
  }

  hideDeleteModal() {
    if (this.elements.deleteModal) {
      this.elements.deleteModal.style.display = 'none';
    }
  }

  async handleProfileUpdate(e) {
    e.preventDefault();
    
    try {
      const formData = {
        name: qs('#edit-name')?.value || '',
        biography: qs('#edit-bio')?.value || '',
        professionalInfo: qs('#edit-professional')?.value || ''
      };

      // Get current data before update
      const currentData = JSON.parse(localStorage.getItem('userProfile')) || {};
      
      // Show loading state
      const submitBtn = qs('#edit-profile-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
      }

      // Make the update request
      const response = await ProfileService.updateProfile(formData);
      
      // Create complete updated profile
      const updatedProfile = {
        user: { ...currentData.user, ...response.user },
        profile: { 
          ...currentData.profile, 
          ...response.profile,
          name: formData.name, // Ensure these are from the form
          biography: formData.biography,
          professionalInfo: formData.professionalInfo
        }
      };

      // Update UI immediately with the form values
      this.updateProfileUI(updatedProfile);
      
      // Store the updated data
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      
      // Hide modal and show success
      this.hideEditModal();
      this.showMessage('Profile updated successfully!', 'success');
      
      // Refresh header
      if (typeof Header === 'function') {
        new Header().updateAuthState();
      }
    } catch (error) {
      console.error('Profile update error:', error);
      this.showMessage(error.message || 'Failed to update profile', 'error');
    } finally {
      // Reset submit button
      const submitBtn = qs('#edit-profile-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Changes';
      }
    }
  }

  async handleProfileDeletion() {
    try {
      await ProfileService.deleteProfile();
      this.hideDeleteModal();
      window.location.href = '/signin.html?accountDeleted=true';
    } catch (error) {
      console.error('Profile deletion error:', error);
      this.showMessage(error.message || 'Failed to delete profile', 'error');
    }
  }

  updateProfileUI(profileData) {
    // Ensure we have valid data
    const safeData = profileData || JSON.parse(localStorage.getItem('userProfile')) || {
      user: { username: 'user', email: '', role: 'user' },
      profile: { 
        name: 'User', 
        biography: '', 
        professionalInfo: '',
        profileImage: 'https://ui-avatars.com/api/?name=U&background=random'
      }
    };

    const { user, profile } = safeData;

    // Update all UI elements
    if (this.elements.profileName) {
      this.elements.profileName.textContent = profile.name || user.username || 'User';
    }
    
    if (this.elements.profileUsername) {
      this.elements.profileUsername.textContent = `@${user.username || 'user'}`;
    }
    
    if (this.elements.profileEmail) {
      this.elements.profileEmail.textContent = user.email || 'No email provided';
    }
    
    if (this.elements.profileRole) {
      this.elements.profileRole.textContent = user.role || 'user';
    }

    if (this.elements.profileBio) {
      this.elements.profileBio.textContent = profile.biography || 'No biography provided';
      this.elements.profileBio.classList.toggle('empty-section', !profile.biography);
    }
    
    if (this.elements.profileProfessionalInfo) {
      this.elements.profileProfessionalInfo.textContent = 
        profile.professionalInfo || 'No professional information provided';
      this.elements.profileProfessionalInfo.classList.toggle('empty-section', !profile.professionalInfo);
    }

    if (this.elements.profileImageContainer) {
      const imageUrl = profile.profileImage || 
                     `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || user.username || 'U')}&background=random`;
      
      this.elements.profileImageContainer.innerHTML = `
        <img src="${imageUrl}" 
             alt="${profile.name || 'User'}'s profile picture"
             class="profile-image"
             loading="lazy">
      `;
    }
  }

  showMessage(message, type = 'info') {
    const container = qs('.profile-container') || document.body;
    if (!container) return;
    
    // Remove existing messages
    const existingMessages = container.querySelectorAll('.profile-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create and show new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `profile-message ${type}`;
    messageDiv.textContent = message;
    container.prepend(messageDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => messageDiv.remove(), 5000);
  }

  showErrorState(error) {
    const container = qs('.profile-container') || document.body;
    container.innerHTML = `
      <div class="profile-error">
        <h3>Error Loading Profile</h3>
        <p>${error.message || 'Unknown error occurred'}</p>
        <button class="btn-retry" onclick="window.location.reload()">Retry</button>
        ${error.message?.includes('401') ? 
          '<p><a href="/signin.html">Sign in again</a></p>' : ''}
      </div>
    `;
  }
}