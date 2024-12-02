export async function loadNav() {
  const navElement = document.createElement('div');
  const response = await fetch('/src/nav.html');
  const navHTML = await response.text();
  navElement.innerHTML = navHTML;
  document.body.insertBefore(navElement, document.body.firstChild);


  const token = localStorage.getItem('accessToken');
  const loginLink = document.getElementById('loginLink');
  const mobileLoginLink = document.getElementById('mobileLoginLink');
  const profileLink = document.querySelector('a[href="/src/profile.html"]');
  const logoutButton = document.getElementById('logoutButton');
  const mobileLogoutButton = document.getElementById('mobileLogoutButton');
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const searchInput = document.getElementById('searchInput');
  const mobileSearchInput = document.getElementById('mobileSearchInput');
  const searchButton = document.getElementById('searchButton');
  const mobileSearchButton = document.getElementById('mobileSearchButton');

  // Hide login
  if (window.location.pathname === '/src/login.html') {
    if (loginLink) loginLink.style.display = 'none';
    if (mobileLoginLink) mobileLoginLink.style.display = 'none';
  }

  // Show/Hide links 
  if (token) {
    if (loginLink) loginLink.style.display = 'none'; 
    if (mobileLoginLink) mobileLoginLink.style.display = 'none';
    if (logoutButton) logoutButton.style.display = 'inline';
    if (mobileLogoutButton) mobileLogoutButton.style.display = 'inline';
  } else {
    if (profileLink) profileLink.style.display = 'none'; 
    if (logoutButton) logoutButton.style.display = 'none'; 
    if (mobileLogoutButton) mobileLogoutButton.style.display = 'none';
  }

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('accessToken'); 
    window.location.href = '/index.html'; 
  };
  if (logoutButton) logoutButton.addEventListener('click', handleLogout);
  if (mobileLogoutButton) mobileLogoutButton.addEventListener('click', handleLogout);

  // Mobile menu toggle
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden'); 
    });
  }

  // Search 
  const handleSearch = (inputElement) => {
    const query = inputElement.value.trim();
    if (query) {
      window.location.href = `/src/auctions.html?q=${encodeURIComponent(query)}`;
    }
  };
  if (searchButton && searchInput) {
    searchButton.addEventListener('click', () => handleSearch(searchInput));
  }
  if (mobileSearchButton && mobileSearchInput) {
    mobileSearchButton.addEventListener('click', () => handleSearch(mobileSearchInput));
  }
}
