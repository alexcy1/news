
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
    window.location.href = '/signup.html';
  }
}

function startRedirectCountdown() {
  let seconds = 7; 
  const countdownElement = document.getElementById('countdown');
  
  // Format seconds as "0:07"
  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  // Immediately set the initial display
  countdownElement.textContent = formatTime(seconds);

  const timer = setInterval(() => {
    seconds--;
    countdownElement.textContent = formatTime(seconds);

    if (seconds <= 0) {
      clearInterval(timer);
      window.location.href = '/signin.html';
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