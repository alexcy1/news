
import { ErrorService } from './ErrorService.mjs';
import { Validator } from '../validation.mjs';
import { AuthService } from './AuthService.mjs';

export class ProfileService {
  static get apiBaseUrl() {
    return AuthService.apiBaseUrl;
  }

  static async fetchUserProfile() {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${this.apiBaseUrl}/api/users/profile`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch profile');
      }

      const data = await response.json();
      localStorage.setItem('userProfile', JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw new Error(this.getUserFriendlyError(error));
    }
  }

  static async updateProfile(profileData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const currentData = JSON.parse(localStorage.getItem('userProfile')) || {};

      const response = await fetch(`${this.apiBaseUrl}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...currentData.profile, 
          ...profileData          
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedData = await response.json();
      
      const completeData = {
        user: updatedData.user || currentData.user,
        profile: {
          ...currentData.profile,
          ...updatedData.profile
        }
      };

      localStorage.setItem('userProfile', JSON.stringify(completeData));
      return completeData;
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error(this.getUserFriendlyError(error));
    }
  }

  static async deleteProfile() {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${this.apiBaseUrl}/api/users/profile`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete profile');
      }

      localStorage.removeItem('userProfile');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return true;
    } catch (error) {
      console.error('Profile deletion error:', error);
      throw new Error(this.getUserFriendlyError(error));
    }
  }

  static getUserFriendlyError(error) {
    if (error.message.includes('Failed to fetch')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.message.includes('401')) {
      return 'Session expired. Please sign in again.';
    }
    return error.message || 'An unexpected error occurred.';
  }
}