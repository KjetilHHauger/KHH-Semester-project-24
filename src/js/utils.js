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
    if (loginLink) loginLink.style.display = 'none'; // Hide login if logged in
    if (mobileLoginLink) mobileLoginLink.style.display = 'none'; // Hide mobile login
    if (logoutButton) logoutButton.style.display = 'inline'; // Show desktop logout
    if (mobileLogoutButton) mobileLogoutButton.style.display = 'inline'; // Show mobile logout
  } else {
    if (profileLink) profileLink.style.display = 'none'; // Hide profile if not logged in
    if (logoutButton) logoutButton.style.display = 'none'; // Hide desktop logout
    if (mobileLogoutButton) mobileLogoutButton.style.display = 'none'; // Hide mobile logout
  }

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('accessToken'); // Clear the token
    window.location.href = '/index.html'; // Redirect to home page
  };
  if (logoutButton) logoutButton.addEventListener('click', handleLogout);
  if (mobileLogoutButton) mobileLogoutButton.addEventListener('click', handleLogout);

  // Mobile Menu Toggle
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden'); // Show or hide the mobile menu
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
