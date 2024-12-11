import { loadNav } from './utils.js';
import { API_BASE_URL } from './api.js';

loadNav();

const queryString = new URLSearchParams(window.location.search);
const auctionId = queryString.get('id');
const auctionContainer = document.getElementById('auctionContainer');
const errorMessage = document.getElementById('errorMessage');
const token = localStorage.getItem('accessToken');

async function fetchAuctionDetails() {
  const url = `${API_BASE_URL}auction/listings/${auctionId}?_bids=true`;
  try {
    const response = await fetch(url, {
      headers: {
        'X-Noroff-API-Key': '04cc0fef-f540-4ae1-8c81-5706316265d4',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch auction details.');

    const data = await response.json();
    return data.data;
  } catch {
    errorMessage.textContent = 'Failed to load auction details. Please try again later.';
    return null;
  }
}

async function placeBid() {
  const bidInput = document.getElementById('bidAmount');
  const bidAmount = parseInt(bidInput.value, 10);

  if (!bidAmount || isNaN(bidAmount)) {
    alert('Please enter a valid bid amount.');
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

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.message.includes('credits')) {
        alert('Insufficient credits to place this bid.');
      } else {
        alert('Failed to place bid. Please try again.');
      }
      return;
    }

    alert('Bid placed successfully!');
    loadAuctionDetails();
  } catch {
    alert('Failed to place bid. Please try again later.');
  }
}

function renderCarousel(media) {
  if (!media || media.length === 0) {
    return '<p class="text-gray-500">No images available.</p>';
  }

  if (media.length === 1) {
    return `
      <div class="flex justify-center">
        <img src="${media[0].url}" alt="${media[0].alt}" class="w-full h-64 object-contain rounded-lg mx-auto">
      </div>
    `;
  }

  const slides = media
    .map(
      (img, index) => `
      <div class="carousel-slide ${index === 0 ? 'block' : 'hidden'}">
        <img src="${img.url}" alt="${img.alt}" class="w-full h-64 object-contain rounded-lg mx-auto">
      </div>`
    )
    .join('');

  const dots = media
    .map(
      (_, index) => `
      <button class="carousel-dot w-3 h-3 rounded-full bg-gray-300 ${
        index === 0 ? 'bg-primary' : ''
      } mx-1" data-index="${index}"></button>`
    )
    .join('');

  return `
    <div class="relative">
      <div class="carousel">${slides}</div>
      <div class="flex justify-center mt-2">${dots}</div>
    </div>
  `;
}

function renderBids(bids) {
  if (!bids || bids.length === 0) {
    return '<p class="text-gray-500">No bids placed yet.</p>';
  }

  const bidsList = bids
    .sort((a, b) => b.amount - a.amount)
    .map(
      (bid) => `
      <div class="flex justify-between p-2 border-b">
        <span>${bid.bidder.name}</span>
        <span class="font-semibold text-primary">$${bid.amount}</span>
      </div>`
    )
    .join('');

  return `
    <div class="overflow-y-auto h-32 bg-gray-100 rounded-lg p-3 mt-4">
      ${bidsList}
    </div>
  `;
}

async function loadAuctionDetails() {
  const auction = await fetchAuctionDetails();

  if (!auction) return;

  const { title, description, media, bids, endsAt } = auction;
  const highestBid = bids.length > 0 ? Math.max(...bids.map((bid) => bid.amount)) : 'No bids yet';
  const carousel = renderCarousel(media);
  const bidsOverview = renderBids(bids);
  const timeLeft = calculateTimeLeft(endsAt);

  auctionContainer.innerHTML = `
  <h1 class="text-3xl font-bold text-gray-800 text-center mb-6">${title}</h1>
  <div class="flex flex-col items-center">
    ${carousel}
    <p class="mt-6 text-lg text-gray-700 leading-relaxed text-center max-w-lg">${description}</p>
    <div class="flex flex-col mt-4 w-full max-w-3xl space-y-4">
      <p class="text-lg font-medium text-gray-800 text-center">Highest Bid: <strong class="text-primary">${
        highestBid || 'No bids yet'
      }</strong></p>
      <p id="timeLeft" class="text-lg font-medium text-gray-800 text-center">Time Left: <span class="text-prussian-blue">${timeLeft}</span></p>
    </div>
  </div>
  ${token ? `
    <div class="mt-6 w-full">
      <label for="bidAmount" class="block text-sm font-medium text-gray-700">Place a Bid</label>
      <div class="flex flex-col space-y-4 mt-2">
        <input type="number" id="bidAmount" placeholder="Enter bid amount" class="p-2 border rounded-lg flex-grow">
        <button onclick="placeBid()" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-prussian-blue">
          Place Bid
        </button>
      </div>
    </div>` : '<p class="text-red-500 mt-4 text-center">Login to place a bid.</p>'}
  ${bidsOverview}
`;



  setupCarousel(media.length);
  setupCountdown(endsAt);
}

function setupCountdown(endsAt) {
  const timeLeftElement = document.getElementById('timeLeft');
  const interval = setInterval(() => {
    const timeLeft = calculateTimeLeft(endsAt);
    if (timeLeft === 'Expired') {
      clearInterval(interval);
    }
    if (timeLeftElement) {
      timeLeftElement.innerHTML = `Time Left: <span class="text-prussian-blue">${timeLeft}</span>`;
    }
  }, 1000); 
}

function calculateTimeLeft(endsAt) {
  const now = new Date();
  const end = new Date(endsAt);
  const diff = Math.max(0, end - now);
  if (diff === 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return `${hours}h ${minutes}m ${seconds}s`;
}


function setupCarousel(slidesCount) {
  if (slidesCount <= 1) return;

  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      slides.forEach((slide, i) => {
        slide.classList.toggle('hidden', i !== index);
      });
      dots.forEach((d, i) => d.classList.toggle('bg-primary', i === index));
    });
  });
}

window.placeBid = placeBid;
loadAuctionDetails();
