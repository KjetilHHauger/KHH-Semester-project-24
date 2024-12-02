import { loadNav } from './utils.js';
import { API_BASE_URL } from './api.js';

loadNav();

const auctionList = document.getElementById('auctionList');
const loadMoreButton = document.getElementById('loadMore');
const loadMoreContainer = document.getElementById('loadMoreContainer');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const searchInput = document.getElementById('searchInput');
const token = localStorage.getItem('accessToken');

let currentPage = 1;
const pageSize = 24;
let allAuctionsLoaded = false;
let currentQuery = '';

async function fetchAuctions(page = 1, limit = 24, query = '') {
  let url = `${API_BASE_URL}auction/listings?_page=${page}&_limit=${limit}`;
  if (query) {
    url = `${API_BASE_URL}auction/listings/search?q=${query}&_page=${page}&_limit=${limit}`;
  }

  try {
    const response = await fetch(url, {
      headers: {
        'X-Noroff-API-Key': '04cc0fef-f540-4ae1-8c81-5706316265d4',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching auctions:', error);
    throw error;
  }
}

function renderAuctions(auctions) {
  auctionList.innerHTML = '';

  if (!Array.isArray(auctions) || auctions.length === 0) {
    errorMessage.classList.remove('hidden');
    errorMessage.textContent = currentPage === 1 ? 'No auctions available.' : '';
    return;
  }

  errorMessage.classList.add('hidden');

  const now = new Date();
  const activeAuctions = auctions.filter(auction => new Date(auction.endsAt) > now);
  const expiredAuctions = auctions.filter(auction => new Date(auction.endsAt) <= now);

  activeAuctions.sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt));

  const sortedAuctions = [...activeAuctions, ...expiredAuctions];

  sortedAuctions.forEach((auction) => {
    const { id, title, media, endsAt, _count } = auction;

    const imageUrl = media && media[0]?.url ? media[0].url : 'https://via.placeholder.com/800x400';
    const bidsCount = _count?.bids || 0;
    const timeLeft = calculateTimeLeft(endsAt);
    const isAuctionActive = new Date(endsAt) > now;

    auctionList.innerHTML += `
      <div class="max-w-sm bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div class="relative">
          <img class="w-full h-60 object-cover" src="${imageUrl}" alt="${title}">
        </div>
        <div class="p-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">${title}</h3>
          <div class="text-sm text-gray-600 mb-4 flex justify-between">
            <p>Bids: <span class="font-semibold">${bidsCount}</span></p>
            <p>Time Left: <span class="text-gray-500">${timeLeft}</span></p>
          </div>
          ${
            token && isAuctionActive
              ? `<div class="flex items-center gap-2">
                  <input type="number" id="bid-${id}" 
                         value="${bidsCount + 1}" 
                         min="${bidsCount + 1}" 
                         class="w-full px-4 py-2 border border-gray-300 rounded">
                  <button onclick="window.placeBid('${id}', document.getElementById('bid-${id}').value)"
                          class="px-4 py-2 bg-picton-blue text-white font-medium rounded hover:bg-prussian-blue transition">
                    Bid
                  </button>
                </div>`
              : ''
          }
        </div>
      </div>
    `;
  });
}

function calculateTimeLeft(endsAt) {
  const now = new Date();
  const end = new Date(endsAt);
  const diff = Math.max(0, end - now);
  const hours = Math.floor(diff / 1000 / 60 / 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  return diff > 0 ? `${hours}h ${minutes}m` : 'Expired';
}

async function placeBid(auctionId, bidAmount) {
  if (!token) {
    alert('You must be logged in to place a bid.');
    return;
  }

  const myHeaders = new Headers();
  myHeaders.append("X-Noroff-API-Key", "04cc0fef-f540-4ae1-8c81-5706316265d4");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${token}`);

  const raw = JSON.stringify({
    "amount": bidAmount
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  try {
    const response = await fetch(`${API_BASE_URL}auction/listings/${auctionId}/bids`, requestOptions);

    if (response.ok) {
      const result = await response.json();
      alert('Bid placed successfully!');
      location.reload(); 
    } else {
      const error = await response.json();
      console.error("Failed to place bid:", error);
      alert(`Failed to place bid: ${error.message || 'Please try again later.'}`);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    alert('An unexpected error occurred. Please try again.');
  }
}

async function loadAuctions() {
  if (allAuctionsLoaded) return;
  try {
    const auctions = await fetchAuctions(currentPage, pageSize, currentQuery);
    if (!auctions || auctions.length === 0) {
      allAuctionsLoaded = true;
      loadMoreContainer.classList.add('hidden');
    } else {
      renderAuctions(auctions);
      currentPage++;
    }
  } catch (error) {
    errorMessage.classList.remove('hidden');
    errorMessage.textContent = 'Failed to load auctions. Please try again later.';
  }
}

function handleSearchInput() {
  currentQuery = searchInput.value.trim();
  currentPage = 1;
  allAuctionsLoaded = false;
  loadMoreContainer.classList.remove('hidden');
  loadAuctions();
}

searchInput.addEventListener('input', handleSearchInput);
loadMoreButton.addEventListener('click', loadAuctions);

window.placeBid = placeBid;

loadAuctions();
