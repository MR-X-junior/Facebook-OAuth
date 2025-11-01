//Copyright 2025 Rahmat Adha
//Licensed under the Apache License, Version 2.0
//Nama author tidak boleh diubah atau dihapus.

// Main JavaScript Functions

// Check first visit and show terms modal
function checkFirstVisit() {
  const hasAccepted = localStorage.getItem('terms_accepted');
  const modal = document.getElementById('termsModal');
  if (!hasAccepted && modal) {
    modal.style.display = 'flex';
  }
}

// Toggle accept button
function toggleAcceptButton() {
  const checkbox = document.getElementById('agreeCheckbox');
  const acceptBtn = document.getElementById('acceptBtn');
  if (checkbox && acceptBtn) {
    acceptBtn.disabled = !checkbox.checked;
  }
}

// Accept terms
function acceptTerms() {
  localStorage.setItem('terms_accepted', 'true');
  const modal = document.getElementById('termsModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Decline terms
function declineTerms() {
  Swal.fire({
      icon: 'warning',
      title: 'Tidak dapat melanjutkan',
      text: 'Anda harus menyetujui syarat dan ketentuan untuk menggunakan layanan ini.',
      confirmButtonColor: '#667eea',
      backdrop:true,
    });
}

// Copy token to clipboard
function copyToken(btn) {
  const token = document.getElementById('token');
  if (token) {
    const tokenText = token.innerText;
    navigator.clipboard.writeText(tokenText).then(() => {
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.classList.remove('copied');
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Gagal menyalin token');
    });
  }
}

// Copy page token to clipboard
function copyPageToken(token, pageName, btn) {
  navigator.clipboard.writeText(token).then(() => {
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.classList.remove('copied');
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Gagal menyalin token');
  });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
  console.log('Facebook OAuth - Ready');
  console.log('Dibuat oleh Rahmat Adha');
});
