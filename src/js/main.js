import { loadNav } from './utils.js';
import { API_BASE_URL } from './api.js';

loadNav();

const auctionList = document.getElementById('auctionList');
const loadMoreButton = document.getElementById('loadMore');
const loadMoreContainer = document.getElementById('loadMoreContainer');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const token = localStorage.getItem('accessToken');

let currentPage = 1;
const pageSize = 24;
let allAuctionsLoaded = false;

// Fetch Auctions
async function fetchAuctions(page = 1, limit = 24) {
    const url = `https://v2.api.noroff.dev/auction/listings?_page=${page}&_limit=${limit}`;
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
    auctions.forEach((auction) => {
      const { id, title, media, endsAt, _count } = auction;
  
      const imageUrl = media && media[0]?.url ? media[0].url : 'https://via.placeholder.com/800x400';
      const bidsCount = _count?.bids || 0;
      const timeLeft = calculateTimeLeft(endsAt);
  
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
    return `${hours}h ${minutes}m`;
  }
  
async function placeBid(auctionId, bidAmount) {
    if (!token) {
      alert('You must be logged in to place a bid.');
      return;
    }
  
    try {
      const response = await fetch(`https://v2.api.noroff.dev/auction/listings/${auctionId}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: bidAmount }),
      });
  
      if (response.ok) {
        alert('Bid placed successfully!');
        location.reload(); 
      } else {
        const error = await response.json();
        alert(`Failed to place bid: ${error.message}`);
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  }
  
async function loadAuctions() {
  if (allAuctionsLoaded) return;
  const auctions = await fetchAuctions(currentPage);
  renderAuctions(auctions);
  currentPage++;
}

loadMoreButton.addEventListener('click', loadAuctions);

loadAuctions();
