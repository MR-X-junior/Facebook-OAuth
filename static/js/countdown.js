//Copyright 2025 Rahmat Adha
//Licensed under the Apache License, Version 2.0
//Nama author tidak boleh diubah atau dihapus.

// Countdown Timer JavaScript

function startCountdown() {
  const countdownEl = document.getElementById('countdown');
  if (!countdownEl) return;
  
  const expiryTimestamp = parseInt(countdownEl.getAttribute('data-expiry-timestamp'));
  
  function updateCountdown() {
    const now = Math.floor(Date.now() / 1000);
    let remainingSeconds = expiryTimestamp - now;
    
    if (remainingSeconds <= 0) {
      countdownEl.innerHTML = '<span style="color: #e53e3e;">Token telah kadaluarsa</span>';
      
      // Update status in localStorage
      const userId = countdownEl.getAttribute('data-user-id');
      if (userId) {
        let accounts = JSON.parse(localStorage.getItem('fb_accounts') || '[]');
        const index = accounts.findIndex(acc => acc.user_id === userId);
        if (index !== -1) {
          accounts[index].is_active = false;
          localStorage.setItem('fb_accounts', JSON.stringify(accounts));
        }
      }
      return;
    }
    
    const days = Math.floor(remainingSeconds / 86400);
    const hours = Math.floor((remainingSeconds % 86400) / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;
    
    countdownEl.textContent = `${days} Hari, ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  startCountdown();
});
