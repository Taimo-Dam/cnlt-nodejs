document.addEventListener('DOMContentLoaded', function () {
  // Initialize theme
  initTheme();

  // Initialize event listeners
  setupEventListeners();

  // Show success message if exists
  showNotification();
});


function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('theme') || 'light';

  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeToggle) themeToggle.textContent = '☀️';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
}

function toggleTheme() {
  const isDarkMode = document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
  }
}

// ========== SEARCH HANDLER ==========

function setupEventListeners() {
  // Search form
  const searchForm = document.getElementById('search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', handleSearch);
  }

  // Like buttons
  document.querySelectorAll('.action-like').forEach(btn => {
    btn.addEventListener('click', handleLike);
  });

  // Delete confirmations
  document.querySelectorAll('.action-delete').forEach(btn => {
    btn.addEventListener('click', function (e) {
      if (!confirm('Bạn có chắc muốn xóa không?')) {
        e.preventDefault();
      }
    });
  });

  // Category filter
  const categoryFilter = document.getElementById('category-filter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', function () {
      const form = this.closest('form');
      if (form) form.submit();
    });
  }

  // Sort filter
  const sortFilter = document.getElementById('sort-filter');
  if (sortFilter) {
    sortFilter.addEventListener('change', function () {
      const form = this.closest('form');
      if (form) form.submit();
    });
  }
}

function handleSearch(e) {
  const searchInput = document.querySelector('input[name="q"]');
  if (!searchInput || !searchInput.value.trim()) {
    e.preventDefault();
    alert('Vui lòng nhập từ khóa tìm kiếm');
  }
}

// ========== LIKE HANDLER ==========

async function handleLike(e) {
  e.preventDefault();

  const postId = this.dataset.postId;
  if (!postId) {
    alert('Không thể like bài viết');
    return;
  }

  try {
    const response = await fetch(`/blogposts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();

      // Update button UI
      this.classList.toggle('liked', data.liked);
      this.textContent = data.liked ? '❤️' : '🤍';

      // Update count
      const likeCount = this.nextElementSibling;
      if (likeCount && likeCount.classList.contains('like-count')) {
        likeCount.textContent = data.likes;
      }

      showNotification('Cảm ơn bạn đã thích bài viết!', 'success');
    } else {
      throw new Error('Failed to like post');
    }
  } catch (error) {
    console.error('Like error:', error);
    alert('Lỗi khi like bài viết. Vui lòng thử lại.');
  }
}

// ========== NOTIFICATIONS ==========

function showNotification(message = '', type = 'success') {
  // Check if message comes from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const commentParam = urlParams.get('comment');

  if (commentParam === 'success') {
    message = 'Bình luận của bạn đã được gửi! Đang chờ phê duyệt.';
    type = 'success';
  }

  if (!message) return;

  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span>${escapeHtml(message)}</span>
      <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
    </div>
  `;

  const container = document.querySelector('.container') || document.body;
  container.insertBefore(alertDiv, container.firstChild);

  // Auto remove after 5 seconds
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}


function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Loading overlay
function showLoading() {
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.id = 'loading-overlay';
  overlay.innerHTML = '<div class="loading"></div>';
  document.body.appendChild(overlay);
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.remove();
}


function validateCommentForm(form) {
  const content = form.querySelector('textarea[name="content"]');
  const author = form.querySelector('input[name="author"]');
  const email = form.querySelector('input[name="email"]');

  if (!content.value.trim()) {
    alert('Vui lòng nhập bình luận');
    content.focus();
    return false;
  }

  if (!author.value.trim()) {
    alert('Vui lòng nhập tên');
    author.focus();
    return false;
  }

  if (!isValidEmail(email.value)) {
    alert('Email không hợp lệ');
    email.focus();
    return false;
  }

  return true;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


document.addEventListener('keydown', function (e) {
  // Ctrl/Cmd + K to focus search
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const searchInput = document.querySelector('input[name="q"]');
    if (searchInput) searchInput.focus();
  }

  // Ctrl/Cmd + D to toggle dark mode
  if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
    e.preventDefault();
    toggleTheme();
  }
});


document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});


if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img.lazy').forEach(img => {
    imageObserver.observe(img);
  });
}


console.log('%cThe Blog', 'font-size: 24px; font-weight: bold; color: #c0392b;');
console.log('%cA modern, responsive blog platform built with Node.js, MongoDB, and EJS', 'font-size: 14px; color: #888;');
