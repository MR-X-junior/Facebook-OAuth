//Copyright 2025 Rahmat Adha
//Licensed under the Apache License, Version 2.0
//Nama author tidak boleh diubah atau dihapus.

// Accounts Management JavaScript

// Load accounts from localStorage
function loadAccounts() {
  const accounts = JSON.parse(localStorage.getItem('fb_accounts') || '[]');
  const accountsList = document.getElementById('accountsList');
  
  if (!accountsList) return;
  
  if (accounts.length === 0) {
    accountsList.innerHTML = `
      <div class="empty-state">
        <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <div>Belum ada akun tersimpan</div>
        <div style="font-size: 12px; margin-top: 5px;">Klik tombol di bawah untuk menambah akun</div>
      </div>
    `;
    return;
  }
  
  accountsList.innerHTML = accounts.map(account => {
    const initial = account.name ? account.name.charAt(0).toUpperCase() : '?';
    const profilePic = account.profile_picture || '';
    
    return `
      <div class="account-item" onclick="viewAccount('${account.user_id}')">
        <div class="account-avatar">
          ${profilePic ? `<img src="${profilePic}" alt="${account.name}" onerror="this.style.display='none'; this.parentElement.textContent='${initial}';">` : initial}
        </div>
        <div class="account-info">
          <div class="account-name">${account.name || 'Unknown'}</div>
          <div class="account-status">
            <span class="status-badge ${account.is_active ? 'status-active' : 'status-inactive'}">
              ${account.is_active ? '<i class="fa-solid fa-check"></i> Aktif' : '<i class="fa-solid fa-xmark"></i> Tidak Aktif'}
            </span>
          </div>
        </div>
        <div class="account-arrow">›</div>
      </div>
    `;
  }).join('');
}

// View account details
function viewAccount(userId) {
  window.location.href = `/view/${userId}`;
}

// Save account to localStorage
function saveAccountToLocalStorage(accountData) {
  if (!accountData.user_id) return;
  
  let accounts = JSON.parse(localStorage.getItem('fb_accounts') || '[]');
  
  // Find existing account index
  const existingIndex = accounts.findIndex(acc => acc.user_id === accountData.user_id);
  
  if (existingIndex !== -1) {
    // Update existing account - keep profile picture if no new one
    if (!accountData.profile_picture && accounts[existingIndex].profile_picture) {
      accountData.profile_picture = accounts[existingIndex].profile_picture;
    }
    accounts[existingIndex] = accountData;
  } else {
    // Add new account
    accounts.push(accountData);
  }
  
  // Save to localStorage
  localStorage.setItem('fb_accounts', JSON.stringify(accounts));
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  loadAccounts();
});
