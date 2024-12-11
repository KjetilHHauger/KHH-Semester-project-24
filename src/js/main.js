import { loadNav } from "./utils.js";
import { API_BASE_URL } from "./api.js";

loadNav();

const auctionList = document.getElementById("auctionList");
const errorMessage = document.getElementById("errorMessage");
const searchInput = document.getElementById("searchInput");
const token = localStorage.getItem("accessToken");
const loggedInUsername = localStorage.getItem("username");

let allAuctions = [];

async function fetchAuctions() {
  const url = `${API_BASE_URL}auction/listings?_active=true`;
  try {
    const response = await fetch(url, {
      headers: {
        "X-Noroff-API-Key": "04cc0fef-f540-4ae1-8c81-5706316265d4",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch auctions.");

    const data = await response.json();
    allAuctions = data.data;
    return data.data;
  } catch {
    errorMessage.classList.remove("hidden");
    errorMessage.textContent =
      "Failed to load auctions. Please try again later.";
    return [];
  }
}

function renderAuctions(auctions) {
  auctionList.innerHTML = "";

  if (auctions.length === 0) {
    errorMessage.classList.remove("hidden");
    errorMessage.textContent = "No auctions available.";
    return;
  }

  errorMessage.classList.add("hidden");

  auctions.forEach((auction) => {
    if (loggedInUsername && auction.seller?.name === loggedInUsername) return;

    const { id, title, media, endsAt } = auction;
    const imageUrl =
      media && media[0]?.url
        ? media[0].url
        : "https://fakeimg.pl/800x400?text=No+image";
    const timeLeft = calculateTimeLeft(endsAt);

    const auctionElement = document.createElement("div");
    auctionElement.className =
      "max-w-sm bg-white rounded-xl shadow-md overflow-hidden border border-gray-200";
    auctionElement.innerHTML = `
      <div class="relative cursor-pointer" data-id="${id}">
        <img class="w-full h-60 object-contain" src="${imageUrl}" alt="${title}">
      </div>
      <div class="p-4">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">${title}</h3>
        <div class="text-sm text-gray-600 mb-4 flex justify-between">
          <p>Time Left: <span class="text-tertiary">${timeLeft}</span></p>
        </div>
      </div>
    `;

    auctionElement.querySelector(".relative").addEventListener("click", (e) => {
      const auctionId = e.currentTarget.dataset.id;
      window.location.href = `src/single.html?id=${auctionId}`;
    });

    auctionList.appendChild(auctionElement);
  });
}

function calculateTimeLeft(endsAt) {
  const now = new Date();
  const end = new Date(endsAt);
  const diff = Math.max(0, end - now);
  const hours = Math.floor(diff / 1000 / 60 / 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  return diff > 0 ? `${hours}h ${minutes}m` : "Expired";
}

function filterAuctions(query) {
  const filteredAuctions = allAuctions.filter(
    (auction) =>
      auction.title.toLowerCase().includes(query) ||
      auction.description?.toLowerCase().includes(query)
  );
  renderAuctions(filteredAuctions);

  if (filteredAuctions.length === 0) {
    errorMessage.classList.remove("hidden");
    errorMessage.textContent = "No auctions match your search.";
  } else {
    errorMessage.classList.add("hidden");
  }
}

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  filterAuctions(query);
});

async function loadAuctions() {
  const auctions = await fetchAuctions();
  renderAuctions(auctions);
}

loadAuctions();
