//Copyright 2025 Rahmat Adha
//Licensed under the Apache License, Version 2.0
//Nama author tidak boleh diubah atau dihapus.

// Account Validation JavaScript

function createToast(title, des) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  notification.innerHTML = `
    <i class="fa-solid fa-check-circle" style="font-size: 20px;"></i>
    <div>
      <div style="font-weight: 600; font-size: 14px;">${title}</div>
      <div style="font-size: 12px; opacity: 0.9;">${des}</div>
    </div>
  `;

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  // Remove after 4 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 4000);
}

async function loadAndValidateAccount(userId) {
  // Get data from localStorage
  const accounts = JSON.parse(localStorage.getItem('fb_accounts') || '[]');
  const account = accounts.find(acc => acc.user_id === userId);
  
  if (!account) {
    showAccountError(null, 'Akun tidak ditemukan di localStorage');
    return;
  }
  
  // Validate token via backend API
  try {
    const response = await fetch('/api/validate-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        access_token: account.access_token
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      // Token invalid
      account.is_active = false;
      account.error_message = result.error;
      
      // Update localStorage
      const accountIndex = accounts.findIndex(acc => acc.user_id === userId);
      accounts[accountIndex] = account;
      localStorage.setItem('fb_accounts', JSON.stringify(accounts));
      
      // Show error
      showAccountError(account, result.error);
    } else {
      // Token valid - update data
      const userData = result.data;
      
      account.name = userData.name;
      account.email = userData.email || '';
      
      if (userData.profile_picture) {
        account.profile_picture = userData.profile_picture;
      }
      
      // Update permissions if available
      if (userData.permissions) {
        account.permissions = userData.permissions;
      }
      
      // Update pages if available
      if (userData.pages) {
        account.pages = userData.pages;
      }
      
      // Update token if new token is available
      if (userData.new_token) {
        console.log('New long-lived token received, updating...');
        account.access_token = userData.new_token.access_token;
        account.token_type = userData.new_token.token_type;
        account.expires_in = userData.new_token.expires_in;
        account.expiry_date = userData.new_token.expiry_date;
        account.expiry_timestamp = userData.new_token.expiry_timestamp;
        
        // Show notification that token was updatedp\
        createToast("Token Diperbarui","Long-lived token berhasil didapatkan");
      }
      
      account.is_active = true;
      account.last_updated = new Date().toISOString();
      delete account.error_message;
      
      // Update localStorage
      const accountIndex = accounts.findIndex(acc => acc.user_id === userId);
      accounts[accountIndex] = account;
      localStorage.setItem('fb_accounts', JSON.stringify(accounts));
      
      // Show account details
      showAccountDetails(account);
    }
  } catch (error) {
    console.error('Validation error:', error);
    showAccountError(account, 'Gagal memvalidasi token: ' + error.message);
  }
}

function showAccountDetails(account) {
  // Update page title
  document.title = `${account.name} - Account Details`;
  
  const container = document.querySelector('.loading-container');
  if (!container) return;
  
  // Calculate if token was recently updated (within last 10 seconds)
  const lastUpdated = new Date(account.last_updated);
  const now = new Date();
  const diffSeconds = (now - lastUpdated) / 1000;
  const isRecentlyUpdated = diffSeconds < 10;
  
  container.innerHTML = `
    <div class="wrapper">
      <div class="header-card">
        <div class="status-icon success"><i class="fa-solid fa-check"></i></div>
        <h1>Akun Aktif</h1>
        <p class="subtitle">Data akun berhasil dimuat${isRecentlyUpdated ? ' dan diperbarui' : ''}</p>
      </div>
      
      <div class="content-grid">
        <div class="card">
          <div class="card-header">
            <div class="card-icon"><i class="fa-solid fa-user"></i></div>
            <div class="card-title">Informasi User</div>
          </div>
          <div class="info-item">
            <div class="info-label">Nama</div>
            <div class="info-value">${account.name}</div>
          </div>
          <div class="info-item">
            <div class="info-label">User ID</div>
            <div class="info-value">${account.user_id}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Email</div>
            <div class="info-value">${account.email || 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Status Akun</div>
            <div class="info-value">
              <span class="permission-badge permission-granted"><i class="fa-solid fa-check"></i> Aktif</span>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <div class="card-icon"><i class="fa-solid fa-stopwatch"></i></div>
            <div class="card-title">Token Info</div>
          </div>
          <div class="info-item">
            <div class="info-label">Type</div>
            <div class="info-value">${account.token_type}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Kadaluarsa Pada</div>
            <div class="info-value">${account.expiry_date}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Sisa Waktu (Countdown)</div>
            <div class="info-value" id="countdown" data-expires="${account.expires_in}" data-expiry-timestamp="${account.expiry_timestamp}" data-user-id="${account.user_id}">Menghitung...</div>
          </div>
        </div>
        
        <div class="card full-width">
          <div class="card-header">
            <div class="card-icon"><i class="fa-solid fa-key"></i></div>
            <div class="card-title">Access Token</div>
          </div>
          <div class="token-display" id="token">${account.access_token}</div>
          <button class="btn btn-primary" onclick="copyToken(this)">
            <i class="fa-solid fa-copy"></i> Salin Token
          </button>
        </div>
        
        <div class="card full-width">
          <div class="card-header">
            <div class="card-icon"><i class="fa-solid fa-circle-check"></i></div>
            <div class="card-title">Permissions (${account.permissions.length})</div>
          </div>
          <div class="permissions-container">
            ${account.permissions.map(perm => `
              <span class="permission-badge ${perm.status === 'granted' ? 'permission-granted' : 'permission-declined'}">
                ${perm.status === 'granted' ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-xmark"></i>'} ${perm.permission}
              </span>
            `).join('')}
          </div>
        </div>
        
        ${account.pages && account.pages.length > 0 ? `
        <div class="card full-width">
          <div class="card-header">
            <div class="card-icon"><i class="fa-solid fa-file-alt"></i></div>
            <div class="card-title">Facebook Pages (${account.pages.length})</div>
            <div class="pages-control">
              <button class="btn-control" onclick="showPageSettings('${account.user_id}')">
                <i class="fa-solid fa-sliders"></i>
              </button>
            </div>
          </div>
          
          <div id="pages-container-${account.user_id}">
            <!-- Pages will be rendered here -->
          </div>
          
          <div class="pages-pagination" id="pages-pagination-${account.user_id}">
            <!-- Pagination will be rendered here -->
          </div>
        </div>
        ` : ''}
        
        <div class="card full-width">
          <div class="card-header">
            <div class="card-icon"><i class="fa-solid fa-code"></i></div>
            <div class="card-title">Graph API Explorer</div>
          </div>
          <p style="color: #718096; font-size: 14px; margin-bottom: 12px;">
            Test dan eksperimen dengan Facebook Graph API menggunakan token Anda
          </p>
          <button class="btn btn-primary" onclick="openApiExplorer('${account.user_id}')">
            <i class="fa-solid fa-terminal"></i> Buka API Explorer
          </button>
        </div>
      </div>

      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <a href="/" class="back-link" style="flex: 1; text-align: center;">
          Kembali ke halaman utama
        </a>
        <button class="btn btn-primary" style="flex: 1; background: #e53e3e;" onclick="deleteAccount('${account.user_id}', '${account.name}')">
          <i class="fa-solid fa-trash"></i> Hapus Akun
        </button>
      </div>
    </div>
  `;

  // Start countdown
  startCountdown();

  // Initialize pages display if pages exist
  if (account.pages && account.pages.length > 0) {
    initializePagesDisplay(account.user_id, account.pages);
  }
}

// Pages pagination state
let pagesPagination = {
  perPage: 2,
  currentIndex: 1
};

function initializePagesDisplay(userId, pages) {
  // Load saved settings from localStorage
  const savedSettings = localStorage.getItem(`pages_settings_${userId}`);
  if (savedSettings) {
    pagesPagination = JSON.parse(savedSettings);
  } else {
    pagesPagination = { perPage: 2, currentIndex: 1 };
  }
  
  renderPages(userId, pages);
  renderPagination(userId, pages);
}

function renderPages(userId, pages) {
  const container = document.getElementById(`pages-container-${userId}`);
  if (!container) return;
  
  const { perPage, currentIndex } = pagesPagination;
  const startIdx = (currentIndex - 1) * perPage;
  const endIdx = startIdx + perPage;
  const pagesSlice = pages.slice(startIdx, endIdx);
  
  if (pagesSlice.length === 0) {
    container.innerHTML = `
      <div class="alert alert-warning">
        <span class="alert-icon"><i class="fa-solid fa-triangle-exclamation"></i></span>
        <div>Tidak ada page pada index ini</div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = pagesSlice.map(page => `
    <div class="page-card-new">
      <img src="https://graph.facebook.com/${page.id}/picture?type=large" 
           alt="${page.name}" 
           class="page-profile-picture-center"
           onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%234267B2%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2248%22 fill=%22white%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${page.name.charAt(0)}%3C/text%3E%3C/svg%3E';">
      
      <div class="info-item">
        <div class="info-label">Nama Page</div>
        <div class="info-value">${page.name}</div>
      </div>
      
      <div class="info-item">
        <div class="info-label">Kategori</div>
        <div class="info-value">${page.category}</div>
      </div>
      
      <div class="info-item">
        <div class="info-label">Page ID</div>
        <div class="info-value">${page.id}</div>
      </div>
      
      <div class="info-item">
        <div class="info-label">Page Access Token</div>
        <div class="token-display" style="margin-top: 8px; font-size: 11px;">${page.access_token}</div>
      </div>
      
      ${page.permissions && page.permissions.length > 0 ? `
      <div class="info-item" style="margin-top: 16px;">
        <div class="info-label">Page Permissions (${page.permissions.length})</div>
        <div class="permissions-container" style="margin-top: 8px;">
          ${page.permissions.map(perm => `
            <span class="permission-badge ${perm.status === 'granted' ? 'permission-granted' : 'permission-declined'}">
              ${perm.status === 'granted' ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-xmark"></i>'} ${perm.permission}
            </span>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      <button class="btn btn-success" onclick="copyPageToken('${page.access_token}', '${page.name}', this)">
        <i class="fa-solid fa-copy"></i> Salin Page Token
      </button>
    </div>
  `).join('');
}

function renderPagination(userId, pages) {
  const container = document.getElementById(`pages-pagination-${userId}`);
  if (!container) return;
  
  const { perPage, currentIndex } = pagesPagination;
  const totalPages = Math.ceil(pages.length / perPage);
  
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }
  
  let paginationHTML = '<div class="pagination-controls">';
  
  // Previous button
  paginationHTML += `
    <button class="btn-pagination ${currentIndex === 1 ? 'disabled' : ''}" 
            onclick="changePage('${userId}', ${currentIndex - 1})"
            ${currentIndex === 1 ? 'disabled' : ''}>
      <i class="fa-solid fa-chevron-left"></i>
    </button>
  `;
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `
      <button class="btn-pagination ${i === currentIndex ? 'active' : ''}" 
              onclick="changePage('${userId}', ${i})">
        ${i}
      </button>
    `;
  }
  
  // Next button
  paginationHTML += `
    <button class="btn-pagination ${currentIndex === totalPages ? 'disabled' : ''}" 
            onclick="changePage('${userId}', ${currentIndex + 1})"
            ${currentIndex === totalPages ? 'disabled' : ''}>
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  `;
  
  paginationHTML += '</div>';
  
  // Info text
  const startIdx = (currentIndex - 1) * perPage + 1;
  const endIdx = Math.min(currentIndex * perPage, pages.length);
  paginationHTML += `
    <div class="pagination-info">
      Menampilkan ${startIdx}-${endIdx} dari ${pages.length} pages
    </div>
  `;
  
  container.innerHTML = paginationHTML;
}

function changePage(userId, newIndex) {
  const accounts = JSON.parse(localStorage.getItem('fb_accounts') || '[]');
  const account = accounts.find(acc => acc.user_id === userId);
  
  if (!account || !account.pages) return;
  
  const totalPages = Math.ceil(account.pages.length / pagesPagination.perPage);
  
  if (newIndex < 1 || newIndex > totalPages) return;
  
  pagesPagination.currentIndex = newIndex;
  
  // Save to localStorage
  localStorage.setItem(`pages_settings_${userId}`, JSON.stringify(pagesPagination));
  
  renderPages(userId, account.pages);
  renderPagination(userId, account.pages);
  
  // Smooth scroll to top of pages container
  const container = document.getElementById(`pages-container-${userId}`);
  if (container) {
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function showPageSettings(userId) {
  const accounts = JSON.parse(localStorage.getItem('fb_accounts') || '[]');
  const account = accounts.find(acc => acc.user_id === userId);
  
  if (!account || !account.pages) return;
  
  const totalPages = account.pages.length;
  const currentPerPage = pagesPagination.perPage;
  
  Swal.fire({
    title: '<i class="fa-solid fa-sliders"></i> Pengaturan Tampilan Pages',
    html: `
      <div style="text-align: left; padding: 10px;">
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a202c;">
            <i class="fa-solid fa-list"></i> Jumlah Page per Halaman
          </label>
          <input type="number" id="perPageInput" value="${currentPerPage}" min="1" max="${totalPages}" 
                 style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px;"
                 onkeypress="return event.charCode >= 48 && event.charCode <= 57">
          <small style="color: #718096; display: block; margin-top: 5px;">
            Total pages: ${totalPages}
          </small>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-check"></i> Terapkan',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#667eea',
    cancelButtonColor: '#718096',
    width: '500px',
    preConfirm: () => {
      const inputValue = document.getElementById('perPageInput').value;
      
      // Validasi input kosong
      if (!inputValue || inputValue.trim() === '') {
        Swal.showValidationMessage('Harap masukkan jumlah page');
        return false;
      }
      
      // Validasi hanya angka
      if (!/^\d+$/.test(inputValue)) {
        Swal.showValidationMessage('Harap masukkan angka yang valid');
        return false;
      }
      
      const perPage = parseInt(inputValue);
      
      // Validasi bilangan bulat positif
      if (isNaN(perPage) || perPage < 1 || !Number.isInteger(perPage)) {
        Swal.showValidationMessage('Harap masukkan bilangan bulat positif (minimal 1)');
        return false;
      }
      
      if (perPage > totalPages) {
        Swal.showValidationMessage(`Maksimal ${totalPages} page per halaman`);
        return false;
      }
      
      return { perPage };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const { perPage } = result.value;
      
      pagesPagination.perPage = perPage;
      pagesPagination.currentIndex = 1; // Reset to first page
      
      // Save to localStorage
      localStorage.setItem(`pages_settings_${userId}`, JSON.stringify(pagesPagination));
      
      // Re-render
      renderPages(userId, account.pages);
      renderPagination(userId, account.pages);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: `Menampilkan ${perPage} page per halaman`,
        timer: 2000,
        showConfirmButton: false
      });
    }
  });
}

function showAccountError(account, errorMessage) {
  // Update page title
  document.title = 'Error - Account Details';
  
  const container = document.querySelector('.loading-container');
  if (!container) return;
  
  // Truncate long error messages for display
  const displayMessage = errorMessage.length > 50 
    ? errorMessage.substring(0, 50) + '...' 
    : errorMessage;
  container.innerHTML = `
    <div class="wrapper">
      <div class="header-card">
        <div class="status-icon error"><i class="fa-solid fa-xmark"></i></div>
        <h1>Akun Tidak Aktif</h1>
        <p class="subtitle">${displayMessage}</p>
      </div>
      
      ${account ? `
      <div class="content-grid">
        <div class="card full-width">
          <div class="card-header">
            <div class="card-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
            <div class="card-title">Detail Error</div>
          </div>
          <div class="info-item">
            <div class="info-label">Nama Akun</div>
            <div class="info-value">${account.name}</div>
          </div>
          <div class="info-item">
            <div class="info-label">User ID</div>
            <div class="info-value">${account.user_id}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Pesan Error</div>
            <div class="info-value" style="word-break: break-all; max-height: 100px; overflow-y: auto;">${errorMessage}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Solusi</div>
            <div class="info-value">Token sudah tidak valid. Silakan login ulang untuk mendapatkan token baru.</div>
          </div>
        </div>
      </div>
      ` : `
      <div class="content-grid">
        <div class="card full-width">
          <div class="card-header">
            <div class="card-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
            <div class="card-title">Detail Error</div>
          </div>
          <div class="info-item">
            <div class="info-label">Pesan Error</div>
            <div class="info-value" style="word-break: break-all;">${errorMessage}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Solusi</div>
            <div class="info-value">Data akun tidak ditemukan atau token tidak valid. Silakan login ulang.</div>
          </div>
        </div>
      </div>
      `}
      
      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <a href="/" class="back-link" style="flex: 1; text-align: center;">
          Kembali ke halaman utama
        </a>
        ${account ? `
        <button class="btn btn-primary" style="flex: 1; background: #e53e3e;" onclick="deleteAccount('${account.user_id}', '${account.name}')">
          <i class="fa-solid fa-trash"></i> Hapus Akun
        </button>
        ` : ''}
      </div>
    </div>
  `;
}

// Delete account function with SweetAlert2
function deleteAccount(userId, userName) {
  Swal.fire({
    title: 'Hapus Akun?',
    html: `Apakah Anda yakin ingin menghapus akun <strong>${userName}</strong>?<br><br>
           <span style="color: #e53e3e;">Aksi ini tidak dapat dibatalkan!</span>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e53e3e',
    cancelButtonColor: '#718096',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      // Delete from localStorage
      let accounts = JSON.parse(localStorage.getItem('fb_accounts') || '[]');
      accounts = accounts.filter(acc => acc.user_id !== userId);
      localStorage.setItem('fb_accounts', JSON.stringify(accounts));
      
      Swal.fire({
        title: 'Berhasil!',
        text: 'Akun berhasil dihapus',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        window.location.href = '/';
      });
    }
  });
}

function openApiExplorer(userId) {
  const accounts = JSON.parse(localStorage.getItem('fb_accounts') || '[]');
  const account = accounts.find(acc => acc.user_id === userId);
  
  if (!account) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Akun tidak ditemukan'
    });
    return;
  }
  
  // Build tokens list (user + pages)
  const tokens = [
    {
      id: account.user_id,
      name: account.name,
      type: 'user',
      token: account.access_token,
      picture: account.profile_picture || `https://graph.facebook.com/${account.user_id}/picture?type=large`
    }
  ];
  
  // Add page tokens
  if (account.pages && account.pages.length > 0) {
    account.pages.forEach(page => {
      tokens.push({
        id: page.id,
        name: page.name,
        type: 'page',
        token: page.access_token,
        picture: `https://graph.facebook.com/${page.id}/picture?type=large`,
        category: page.category
      });
    });
  }
  
  showApiExplorerModal(tokens);
}

function showApiExplorerModal(tokens) {
  // Default selected token (first one - user token)
  let selectedToken = tokens[0];
  
  const tokensListHTML = tokens.map((token, index) => `
    <div class="token-select-item ${index === 0 ? 'selected' : ''}" onclick="selectToken(${index})">
      <img src="${token.picture}" 
           alt="${token.name}" 
           class="token-select-avatar"
           onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%234267B2%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2220%22 fill=%22white%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${token.name.charAt(0)}%3C/text%3E%3C/svg%3E';">
      <div class="token-select-info">
        <div class="token-select-name">${token.name}</div>
        <div class="token-select-id">${token.id}</div>
        ${token.category ? `<div class="token-select-type"><i class="fa-solid fa-tag"></i> ${token.category}</div>` : ''}
      </div>
      <div class="token-select-badge">
        <i class="fa-solid ${token.type === 'user' ? 'fa-user' : 'fa-file-alt'}"></i>
        ${token.type === 'user' ? 'User' : 'Page'}
      </div>
      <div class="token-select-check">
        <i class="fa-solid fa-check-circle"></i>
      </div>
    </div>
  `).join('');
  
  // Get initial selected token info
  const initialToken = tokens[0];
  
  Swal.fire({
    title: '<i class="fa-solid fa-code"></i> Graph API Explorer',
    html: `
      <div class="api-explorer-container">
        <!-- Token Selection -->
        <div class="api-section">
          <label class="api-label">
            <i class="fa-solid fa-key"></i> Pilih Access Token
          </label>
          
          <!-- Selected Token Display -->
          <div class="selected-token-display" id="selectedTokenDisplay" onclick="toggleTokensList()">
            <img src="${initialToken.picture}" 
                 alt="${initialToken.name}" 
                 class="token-select-avatar"
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%234267B2%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2220%22 fill=%22white%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${initialToken.name.charAt(0)}%3C/text%3E%3C/svg%3E';">
            <div class="token-select-info">
              <div class="token-select-name">${initialToken.name}</div>
              <div class="token-select-id">${initialToken.id}</div>
            </div>
            <div class="token-select-badge">
              <i class="fa-solid ${initialToken.type === 'user' ? 'fa-user' : 'fa-file-alt'}"></i>
              ${initialToken.type === 'user' ? 'User' : 'Page'}
            </div>
            <div class="token-dropdown-arrow">
              <i class="fa-solid fa-chevron-down"></i>
            </div>
          </div>
          
          <!-- Tokens List (Hidden by default) -->
          <div class="tokens-list" id="tokensList" style="display: none;">
            ${tokensListHTML}
          </div>
        </div>
        
        <!-- Request Configuration -->
        <div class="api-section">
          <label class="api-label">
            <i class="fa-solid fa-network-wired"></i> Konfigurasi Request
          </label>
          
          <div class="api-method-path">
            <select id="apiMethod" class="api-method-select">
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="DELETE">DELETE</option>
            </select>
            <input type="text" 
                   id="apiPath" 
                   class="api-path-input" 
                   placeholder="Contoh: /me, /{user-id}, /me/accounts"
                   value="/me">
          </div>
        </div>
        
        <!-- Query Parameters -->
        <div class="api-section">
          <label class="api-label">
            <i class="fa-solid fa-filter"></i> Query Parameters
            <button class="btn-add-param" onclick="addParam()">
              <i class="fa-solid fa-plus"></i> Tambah
            </button>
          </label>
          <div id="paramsContainer" class="params-container">
            <div class="param-item">
              <input type="text" class="param-key" placeholder="Key" value="fields">
              <input type="text" class="param-value" placeholder="Value" value="id,name,picture">
              <button class="btn-remove-param" onclick="removeParam(this)">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Request Body (for POST) -->
        <div class="api-section" id="bodySection" style="display: none;">
          <label class="api-label">
            <i class="fa-solid fa-file-code"></i> Request Body (JSON)
          </label>
          <textarea id="apiBody" 
                    class="api-body-textarea" 
                    placeholder='{"key": "value"}'></textarea>
        </div>
        
        <!-- Response -->
        <div class="api-section">
          <label class="api-label">
            <i class="fa-solid fa-code"></i> Response
          </label>
          <div id="apiResponse" class="api-response">
            <div class="api-response-placeholder">
              <i class="fa-solid fa-circle-info"></i>
              Response akan muncul di sini setelah request dikirim
            </div>
          </div>
        </div>
      </div>
    `,
    showCancelButton: true,
    showConfirmButton: true,
    confirmButtonText: '<i class="fa-solid fa-paper-plane"></i> Kirim Request',
    cancelButtonText: '<i class="fa-solid fa-times"></i> Tutup',
    confirmButtonColor: '#667eea',
    cancelButtonColor: '#718096',
    width: '900px',
    customClass: {
      container: 'api-explorer-modal',
      popup: 'api-explorer-popup'
    },
    didOpen: () => {
      // Store tokens in window for access
      window.apiExplorerTokens = tokens;
      window.apiExplorerSelectedIndex = 0;
      window.tokensListVisible = false;
      
      // Method change handler
      document.getElementById('apiMethod').addEventListener('change', (e) => {
        const bodySection = document.getElementById('bodySection');
        bodySection.style.display = e.target.value === 'POST' ? 'block' : 'none';
      });
    },
    preConfirm: () => {
      return sendApiRequest();
    }
  }).then((result) => {
    if (result.isDismissed) {
      // Cleanup
      delete window.apiExplorerTokens;
      delete window.apiExplorerSelectedIndex;
      delete window.tokensListVisible;
    }
  });
}

function toggleTokensList() {
  const tokensList = document.getElementById('tokensList');
  const arrow = document.querySelector('.token-dropdown-arrow i');
  
  window.tokensListVisible = !window.tokensListVisible;
  
  if (window.tokensListVisible) {
    tokensList.style.display = 'block';
    arrow.style.transform = 'rotate(180deg)';
  } else {
    tokensList.style.display = 'none';
    arrow.style.transform = 'rotate(0deg)';
  }
}

function selectToken(index) {
  window.apiExplorerSelectedIndex = index;
  const selectedToken = window.apiExplorerTokens[index];
  
  // Update selected token display
  const display = document.getElementById('selectedTokenDisplay');
  display.innerHTML = `
    <img src="${selectedToken.picture}" 
         alt="${selectedToken.name}" 
         class="token-select-avatar"
         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%234267B2%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2220%22 fill=%22white%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${selectedToken.name.charAt(0)}%3C/text%3E%3C/svg%3E';">
    <div class="token-select-info">
      <div class="token-select-name">${selectedToken.name}</div>
      <div class="token-select-id">${selectedToken.id}</div>
    </div>
    <div class="token-select-badge">
      <i class="fa-solid ${selectedToken.type === 'user' ? 'fa-user' : 'fa-file-alt'}"></i>
      ${selectedToken.type === 'user' ? 'User' : 'Page'}
    </div>
    <div class="token-dropdown-arrow">
      <i class="fa-solid fa-chevron-down" style="transform: rotate(180deg);"></i>
    </div>
  `;
  
  // Update selection in list
  const items = document.querySelectorAll('.token-select-item');
  items.forEach((item, i) => {
    if (i === index) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
  
  // Hide list after selection
  setTimeout(() => {
    toggleTokensList();
  }, 300);
}

function addParam() {
  const container = document.getElementById('paramsContainer');
  const paramItem = document.createElement('div');
  paramItem.className = 'param-item';
  paramItem.innerHTML = `
    <input type="text" class="param-key" placeholder="Key">
    <input type="text" class="param-value" placeholder="Value">
    <button class="btn-remove-param" onclick="removeParam(this)">
      <i class="fa-solid fa-trash"></i>
    </button>
  `;
  container.appendChild(paramItem);
}

function removeParam(button) {
  const container = document.getElementById('paramsContainer');
  const paramItem = button.parentElement;
  
  if (container.children.length > 1) {
    // If more than 1 param, just remove it
    paramItem.remove();
  } else {
    // If only 1 param left, clear the inputs instead of removing
    const keyInput = paramItem.querySelector('.param-key');
    const valueInput = paramItem.querySelector('.param-value');
    
    // Clear values
    keyInput.value = '';
    valueInput.value = '';
    
    // Show toast notification
    const toast = document.createElement('div');
    toast.className = 'param-cleared-toast';
    toast.innerHTML = '<i class="fa-solid fa-info-circle"></i> Parameter dikosongkan';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 2000);
  }
}

async function sendApiRequest() {
  const method = document.getElementById('apiMethod').value;
  const path = document.getElementById('apiPath').value.trim();
  const bodyText = document.getElementById('apiBody').value.trim();

  // Validate path
  if (!path) {
    Swal.showValidationMessage('Path tidak boleh kosong');
    return false;
  }

  // Get selected token
  const selectedToken = window.apiExplorerTokens[window.apiExplorerSelectedIndex];

  // Build query params
  const params = {};
  const paramItems = document.querySelectorAll('.param-item');
  let hasEmptyParam = false;
  let emptyParamCount = 0;

  paramItems.forEach(item => {
    const key = item.querySelector('.param-key').value.trim();
    const value = item.querySelector('.param-value').value.trim();

    // Check for empty params
    if ((key && !value) || (!key && value)) {
      hasEmptyParam = true;
    }

    if (!key && !value) {
      emptyParamCount++;
    }

    if (key && value) {
      params[key] = value;
    }
  });

  // Validate: tidak boleh ada param yang hanya terisi sebagian
  if (hasEmptyParam) {
    Swal.showValidationMessage('Semua parameter harus diisi lengkap (key dan value) atau dikosongkan');
    return false;
  }

  // If all params are empty and there's only one param item, that's okay
  // If there are multiple param items and some are empty, that's an error
  if (paramItems.length > 1 && emptyParamCount > 0) {
    Swal.showValidationMessage('Hapus parameter yang kosong atau isi dengan lengkap');
    return false;
  }

  // Build request data
  const requestData = {
    method: method,
    path: path,
    access_token: selectedToken.token,
    params: params
  };

  // Add body for POST
  if (method === 'POST' && bodyText) {
    try {
      requestData.body = JSON.parse(bodyText);
    } catch (e) {
      Swal.showValidationMessage('Request body harus berupa JSON yang valid');
      return false;
    }
  }

  // Show loading
  const responseDiv = document.getElementById('apiResponse');
  responseDiv.innerHTML = `
    <div class="api-response-loading">
      <div class="spinner-small"></div>
      <div>Mengirim request...</div>
    </div>
  `;

  try {
    // Send request via backend
    const response = await fetch('/api/graph-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();

    // Display response
    displayApiResponse(result, response.status);

    return false; // Prevent modal from closing
  } catch (error) {
    displayApiResponse({
      error: 'Request Failed',
      message: error.message
    }, 500);
    return false;
  }
}

function displayApiResponse(data, statusCode) {
  const responseDiv = document.getElementById('apiResponse');
  
  const isError = statusCode >= 400 || data.error;
  const statusClass = isError ? 'error' : 'success';
  const statusIcon = isError ? 'fa-circle-xmark' : 'fa-circle-check';
  
  responseDiv.innerHTML = `
    <div class="api-response-header ${statusClass}">
      <div>
        <i class="fa-solid ${statusIcon}"></i>
        Status: ${statusCode}
      </div>
      <button class="btn-copy-response" onclick="copyResponse()">
        <i class="fa-solid fa-copy"></i> Copy
      </button>
    </div>
    <pre class="api-response-body" id="responseBody">${JSON.stringify(data, null, 2)}</pre>
  `;
  
  // Store response for copy function
  window.lastApiResponse = data;
}

function copyResponse() {
  const responseText = JSON.stringify(window.lastApiResponse, null, 2);
  navigator.clipboard.writeText(responseText).then(() => {
    const btn = document.querySelector('.btn-copy-response');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
    setTimeout(() => {
      btn.innerHTML = originalHTML;
    }, 2000);
  });
}
