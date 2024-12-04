import { loadNav } from './utils.js';
import { API_BASE_URL } from './api.js';

loadNav();

const auctionList = document.getElementById('auctionList');
const errorMessage = document.getElementById('errorMessage');
const searchInput = document.getElementById('searchInput');

let allAuctions = [];

async function fetchAuctions() {
  const url = `${API_BASE_URL}auction/listings?_bids=true`;
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
    console.log(`Number of auctions fetched: ${data.data.length}`); // Log the number of auctions
    const now = new Date();
    const activeAuctions = data.data.filter(auction => new Date(auction.endsAt) > now); // Filter active auctions
    console.log(`Number of active auctions: ${activeAuctions.length}`);
    return activeAuctions;
  } catch {
    errorMessage.classList.remove('hidden');
    errorMessage.textContent = 'Failed to load auctions. Please try again later.';
    throw new Error('Failed to fetch auctions.');
  }
}


function calculateTimeLeft(endsAt) {
  const now = new Date();
  const end = new Date(endsAt);
  const diff = Math.max(0, end - now);
  const hours = Math.floor(diff / 1000 / 60 / 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  return diff > 0 ? `${hours}h ${minutes}m` : 'Expired';
}

async function updateBids(auctionId) {
  const url = `${API_BASE_URL}auction/listings/${auctionId}?_bids=true`;
  try {
    const response = await fetch(url, {
      headers: {
        'X-Noroff-API-Key': '04cc0fef-f540-4ae1-8c81-5706316265d4',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error();

    const data = await response.json();
    const bids = data.data.bids || [];
    const highestBid = bids.length > 0 ? Math.max(...bids.map((bid) => bid.amount)) : null;

    const highestBidElement = document.getElementById(`highest-bid-${auctionId}`);
    const bidInput = document.getElementById(`bid-${auctionId}`);

    if (highestBidElement) {
      highestBidElement.innerHTML = `Highest Bid: <span class="font-semibold">${highestBid ? `$${highestBid}` : 'No bids yet'}</span>`;
    }

    if (bidInput) {
      bidInput.min = highestBid ? highestBid + 1 : 1;
      bidInput.value = '';
    }
  } catch {
    alert('Failed to update bids. Please try again.');
  }
}

async function placeBid(auctionId, bidInputId) {
  const bidInput = document.getElementById(bidInputId);
  const bidAmount = parseInt(bidInput.value, 10);

  if (!bidAmount || isNaN(bidAmount)) {
    alert('Please enter a valid bid amount.');
    return;
  }

  const token = localStorage.getItem('accessToken');
  if (!token) {
    alert('You must be logged in to place a bid.');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}auction/listings/${auctionId}/bids`, {
      method: 'POST',
      headers: {
        'X-Noroff-API-Key': '04cc0fef-f540-4ae1-8c81-5706316265d4',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount: bidAmount }),
    });

    if (!response.ok) throw new Error();

    alert('Bid placed successfully!');
    updateBids(auctionId);
  } catch {
    alert('Failed to place bid. Please try again later.');
  }
}

function renderAuctions(auctions) {
  auctionList.innerHTML = '';

  if (!Array.isArray(auctions) || auctions.length === 0) {
    errorMessage.classList.remove('hidden');
    errorMessage.textContent = 'No auctions available.';
    return;
  }

  errorMessage.classList.add('hidden');

  auctions.forEach((auction) => {
    const { id, title, media, endsAt } = auction;
    const imageUrl = media && media[0]?.url ? media[0].url : 'https://fakeimg.pl/800x400?text=No+image';
    const bids = auction.bids || [];
    const highestBid = bids.length > 0 ? Math.max(...bids.map((bid) => bid.amount)) : null;
    const timeLeft = calculateTimeLeft(endsAt);

    const auctionElement = document.createElement('div');
    auctionElement.className = 'max-w-sm bg-white rounded-xl shadow-md overflow-hidden border border-gray-200';
    auctionElement.innerHTML = `
      <div class="relative">
        <img class="w-full h-60 object-contain" src="${imageUrl}" alt="${title}">
      </div>
      <div class="p-4">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">${title}</h3>
        <div class="text-sm text-gray-600 mb-4 flex justify-between">
          <p id="highest-bid-${id}">Highest Bid: <span class="font-semibold">${highestBid ? `$${highestBid}` : 'No bids yet'}</span></p>
          <p>Time Left: <span class="text-gray-500">${timeLeft}</span></p>
        </div>
        <div class="mt-4">
          <label for="bid-${id}" class="block text-sm font-medium text-gray-700">Place Your Bid</label>
          <div class="flex items-center space-x-2">
            <input type="number" id="bid-${id}" min="${highestBid ? highestBid + 1 : 1}" class="p-2 border rounded flex-grow" placeholder="Enter bid amount">
            <button class="px-4 py-2 bg-picton-blue text-white rounded hover:bg-prussian-blue" data-id="${id}" data-input="bid-${id}">
              Bid
            </button>
          </div>
        </div>
      </div>
    `;
    auctionList.appendChild(auctionElement);

    auctionElement.querySelector('button').addEventListener('click', (event) => {
      const button = event.currentTarget;
      const auctionId = button.dataset.id;
      const bidInputId = button.dataset.input;
      placeBid(auctionId, bidInputId);
    });
  });
}

async function loadAuctions() {
  try {
    allAuctions = await fetchAuctions();
    renderAuctions(allAuctions);
  } catch {
    errorMessage.classList.remove('hidden');
    errorMessage.textContent = 'Failed to load auctions. Please try again later.';
  }
}

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  const filteredAuctions = allAuctions.filter((auction) =>
    auction.title.toLowerCase().includes(query) || auction.description?.toLowerCase().includes(query)
  );
  renderAuctions(filteredAuctions);

  if (filteredAuctions.length === 0) {
    errorMessage.classList.remove('hidden');
    errorMessage.textContent = 'No auctions match your search.';
  } else {
    errorMessage.classList.add('hidden');
  }
});

loadAuctions();
