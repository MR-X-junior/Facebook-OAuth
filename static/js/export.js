//Copyright 2025 Rahmat Adha
//Licensed under the Apache License, Version 2.0
//Nama author tidak boleh diubah atau dihapus.

// Export Accounts JavaScript

// Show export modal
function showExportModal() {
  const accounts = JSON.parse(localStorage.getItem('fb_accounts') || '[]');
  
  if (accounts.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Tidak Ada Akun',
      text: 'Belum ada akun yang tersimpan untuk diekspor',
      confirmButtonColor: '#667eea'
    });
    return;
  }
  
  // Build account list with checkboxes
  const accountsList = accounts.map((acc, index) => `
    <div style="text-align: left; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 10px;">
      <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
        <input type="checkbox" class="export-checkbox" value="${acc.user_id}" checked style="width: 18px; height: 18px;">
        <div style="flex: 1;">
          <div style="font-weight: 600; color: #1a202c;">${acc.name}</div>
          <div style="font-size: 12px; color: #718096;">${acc.email || 'No email'}</div>
        </div>
        <span class="status-badge ${acc.is_active ? 'status-active' : 'status-inactive'}" style="font-size: 10px;">
          ${acc.is_active ? '<i class="fa-solid fa-check"></i> Aktif' : '<i class="fa-solid fa-xmark"></i> Tidak Aktif'}
        </span>
      </label>
    </div>
  `).join('');
  
  Swal.fire({
    title: '<i class="fa-solid fa-arrow-up-from-bracket"></i> Ekspor Akun',
    html: `
      <div style="text-align: left; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <label style="font-weight: 600; color: #1a202c;">
            <input type="checkbox" id="selectAll" onchange="toggleSelectAll()" checked style="margin-right: 8px;">
            Pilih Semua (${accounts.length} akun)
          </label>
        </div>
        <div style="max-height: 300px; overflow-y: auto; margin-bottom: 20px;">
          ${accountsList}
        </div>
        <div style="padding: 15px; background: #f7fafc; border-radius: 8px; border-left: 4px solid #667eea;">
          <label style="font-weight: 600; color: #1a202c; display: block; margin-bottom: 10px;">
            Format Ekspor:
          </label>
          <select id="exportFormat" style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;">
            <option value="json">JSON (.json)</option>
            <option value="txt">Text (.txt)</option>
            <option value="csv">CSV (.csv)</option>
          </select>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-download"></i> Ekspor',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#667eea',
    cancelButtonColor: '#718096',
    width: '600px',
    preConfirm: () => {
      const checkboxes = document.querySelectorAll('.export-checkbox:checked');
      const selectedIds = Array.from(checkboxes).map(cb => cb.value);
      const format = document.getElementById('exportFormat').value;
      
      if (selectedIds.length === 0) {
        Swal.showValidationMessage('Pilih minimal satu akun untuk diekspor');
        return false;
      }
      
      return { selectedIds, format };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const { selectedIds, format } = result.value;
      exportAccounts(selectedIds, format);
    }
  });
}

// Toggle select all checkboxes
function toggleSelectAll() {
  const selectAll = document.getElementById('selectAll');
  const checkboxes = document.querySelectorAll('.export-checkbox');
  checkboxes.forEach(cb => cb.checked = selectAll.checked);
}

// Export accounts function
function exportAccounts(selectedIds, format) {
  const accounts = JSON.parse(localStorage.getItem('fb_accounts') || '[]');
  const selectedAccounts = accounts.filter(acc => selectedIds.includes(acc.user_id));
  
  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
  const filename = `FacebookOAuth_${dateStr}`;
  
  let content, mimeType, extension;
  
  switch (format) {
    case 'json':
      content = JSON.stringify(selectedAccounts, null, 2);
      mimeType = 'application/json';
      extension = 'json';
      break;
      
    case 'txt':
      content = selectedAccounts.map(acc => {
        return `
===========================================
Nama: ${acc.name}
User ID: ${acc.user_id}
Email: ${acc.email || 'N/A'}
Access Token: ${acc.access_token}
Token Type: ${acc.token_type}
Expires In: ${acc.expires_in} detik
Expiry Date: ${acc.expiry_date}
Status: ${acc.is_active ? 'Aktif' : 'Tidak Aktif'}
Last Updated: ${acc.last_updated}

Permissions (${acc.permissions.length}):
${acc.permissions.map(p => `  - ${p.permission}: ${p.status}`).join('\n')}

${acc.pages && acc.pages.length > 0 ? `Pages (${acc.pages.length}):\n${acc.pages.map(page => `  - ${page.name} (${page.id})\n    Token: ${page.access_token}`).join('\n\n')}` : 'No Pages'}
===========================================
        `.trim();
      }).join('\n\n');
      mimeType = 'text/plain';
      extension = 'txt';
      break;
      
    case 'csv':
      const headers = ['Nama', 'User ID', 'Email', 'Access Token', 'Token Type', 'Expires In', 'Expiry Date', 'Status', 'Permissions Count', 'Pages Count'];
      const rows = selectedAccounts.map(acc => [
        acc.name,
        acc.user_id,
        acc.email || 'N/A',
        acc.access_token,
        acc.token_type,
        acc.expires_in,
        acc.expiry_date,
        acc.is_active ? 'Aktif' : 'Tidak Aktif',
        acc.permissions.length,
        (acc.pages || []).length
      ]);
      
      content = [headers, ...rows].map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      
      mimeType = 'text/csv';
      extension = 'csv';
      break;
  }
  
  // Create and download file
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  // Show success message
  Swal.fire({
    icon: 'success',
    title: 'Berhasil!',
    html: `<div style="text-align: left;">
      <p><strong>${selectedAccounts.length}</strong> akun berhasil diekspor</p>
      <p style="font-size: 14px; color: #718096; margin-top: 10px;">
        File: <strong>${filename}.${extension}</strong>
      </p>
    </div>`,
    confirmButtonColor: '#667eea',
    timer: 3000
  });
}
