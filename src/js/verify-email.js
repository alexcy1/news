
export function initVerifyEmail() {
  const params = new URLSearchParams(window.location.search);
  const verified = params.get('verified');
  const error = params.get('error');

  if (verified === 'true') {
    showSuccessState();
    startRedirectCountdown();
    return;
  }

  if (error) {
    showErrorState(error);
    return;
  }

  showDefaultState();
}

function showSuccessState() {
  document.getElementById('verification-container').style.display = 'none';
  document.getElementById('success-container').style.display = 'block';
}

function showErrorState(errorMessage) {
  document.getElementById('verification-container').style.display = 'none';
  const errorElement = document.getElementById('error-state');
  errorElement.style.display = 'block';
  errorElement.querySelector('p').textContent = errorMessage;
}

function showDefaultState() {
  const email = localStorage.getItem('temp-email');
  if (email) {
    document.getElementById('user-email').textContent = email;
  } else {
    window.location.href = '/signup';
  }
}

function startRedirectCountdown() {
  let seconds = 3 * 60; // 3 minutes in seconds
  const countdownElement = document.getElementById('countdown');
  
  // Immediately set the initial display
  updateCountdownDisplay(seconds, countdownElement);

  const timer = setInterval(() => {
    seconds--;
    updateCountdownDisplay(seconds, countdownElement);

    if (seconds <= 0) {
      clearInterval(timer);
      window.location.href = '/signin';
    }
  }, 1000);
}

function updateCountdownDisplay(seconds, element) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  // Display with leading zeros
  element.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

document.addEventListener("DOMContentLoaded", initVerifyEmail);