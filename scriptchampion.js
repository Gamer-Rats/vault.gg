let champions = []; // Global variable to store champion data
let currentPage = 1; // Current page number
const championsPerPage = 24; // Number of champions per page

// Fetch champion data from the API
async function getChampionData() {
    try {
        const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/15.7.1/data/en_US/champion.json`);
        const data = await response.json();
        champions = Object.values(data.data);
        console.log('Champions:', champions); // Debugging: Check the champions array

        renderChampionList();
        renderPagination();
    } catch (error) {
        console.error('Error fetching champion data:', error);
    }
}

// Render the champion icons for the current page
function renderChampionList() {
    const championList = document.getElementById('champion-list');
    if (!championList) {
        console.error('Error: #champion-list element not found in the DOM.');
        return;
    }

    // Calculate the start and end indices for the current page
    const startIndex = (currentPage - 1) * championsPerPage;
    const endIndex = startIndex + championsPerPage;
    const championsToDisplay = champions.slice(startIndex, endIndex);

    let html = '';
    for (const champ of championsToDisplay) {
        html += `
            <img src="https://ddragon.leagueoflegends.com/cdn/15.7.1/img/champion/${champ.image.full}" 
                 alt="${champ.name}" 
                 onclick="showChampionDetails('${champ.id}')">
        `;
    }

    championList.innerHTML = html;
}

// Render pagination controls
function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) {
        console.error('Error: #pagination element not found in the DOM.');
        return;
    }

    const totalPages = Math.ceil(champions.length / championsPerPage);
    let html = '';

    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="pagination-button ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }

    pagination.innerHTML = html;
}

// Navigate to a specific page
function goToPage(pageNumber) {
    currentPage = pageNumber;
    renderChampionList();
    renderPagination();
}

// Show champion details in a modal pop-up
function showChampionDetails(championId) {
    const champ = champions.find(c => c.id === championId);
    const detailSection = document.getElementById('detail');

    if (!detailSection) {
        console.error('Error: #detail element not found in the DOM.');
        return;
    }

    if (champ) {
        // Check if the champion is already favorited
        const favoriteChampions = JSON.parse(localStorage.getItem('favoriteChampions')) || [];
        const isFavorited = favoriteChampions.some(favChamp => favChamp.id === champ.id);
        const favoritedClass = isFavorited ? 'favorited' : '';

        const html = `
            <div class="champion-details">
                <div class="ribbon">
                    <span>${champ.name}</span>
                    <span class="save-ribbon ${favoritedClass}" onclick="toggleFavoriteChampion('${champ.id}')">
                        <i class="fa-solid fa-bookmark"></i>
                    </span>
                </div>
                <div class="champion-info">
                    <p><strong>Title:</strong> ${champ.title}</p>
                    <p><strong>Stats:</strong></p>
                    <ul>
                        <li>Attack: ${champ.info.attack}</li>
                        <li>Defense: ${champ.info.defense}</li>
                        <li>Magic: ${champ.info.magic}</li>
                        <li>Difficulty: ${champ.info.difficulty}</li>
                    </ul>
                    <p><strong>Tags:</strong> ${champ.tags.join(', ')}</p>
                    <p><strong>Partype:</strong> ${champ.partype}</p>
                    <p><strong>Base Stats:</strong></p>
                    <ul>
                        <li>HP: ${champ.stats.hp}</li>
                        <li>HP per Level: ${champ.stats.hpperlevel}</li>
                        <li>MP: ${champ.stats.mp}</li>
                        <li>MP per Level: ${champ.stats.mpperlevel}</li>
                        <li>Move Speed: ${champ.stats.movespeed}</li>
                        <li>Armor: ${champ.stats.armor}</li>
                        <li>Armor per Level: ${champ.stats.armorperlevel}</li>
                        <li>Attack Range: ${champ.stats.attackrange}</li>
                        <li>Attack Damage: ${champ.stats.attackdamage}</li>
                        <li>Attack Damage per Level: ${champ.stats.attackdamageperlevel}</li>
                        <li>Attack Speed: ${champ.stats.attackspeed}</li>
                        <li>Attack Speed per Level: ${champ.stats.attackspeedperlevel}</li>
                    </ul>
                </div>
            </div>
        `;

        detailSection.innerHTML = html;

        // Scroll to the detail section
        detailSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        console.error('Champion not found');
    }
}

function toggleFavoriteChampion(championId) {
    const favoriteChampions = JSON.parse(localStorage.getItem('favoriteChampions')) || [];
    const champ = champions.find(c => c.id === championId);

    if (!champ) {
        console.error('Champion not found');
        return;
    }

    const isFavorited = favoriteChampions.some(favChamp => favChamp.id === champ.id);

    if (isFavorited) {
        // Remove from favorites
        const updatedFavorites = favoriteChampions.filter(favChamp => favChamp.id !== champ.id);
        localStorage.setItem('favoriteChampions', JSON.stringify(updatedFavorites));
        console.log(`Removed ${champ.name} from favorites.`);
    } else {
        // Add to favorites
        favoriteChampions.push({ id: champ.id, name: champ.name, image: champ.image.full });
        localStorage.setItem('favoriteChampions', JSON.stringify(favoriteChampions));
        console.log(`Added ${champ.name} to favorites.`);
    }

    // Re-render the champion details to update the ribbon state
    showChampionDetails(championId);
}

function filterChampions() {
    const filterValue = document.getElementById('filter-dropdown').value.toLowerCase();

    // Filter champions based on the selected letter or show all
    const filteredChampions = champions.filter(champ => {
        const firstLetter = champ.name[0].toLowerCase();
        if (filterValue === 'all') {
            return true; // Show all champions
        }
        return firstLetter === filterValue; // Match the selected letter
    });

    console.log('Filtered Champions:', filteredChampions);
    renderFilteredChampionList(filteredChampions);
}

function renderFilteredChampionList(filteredChampions) {
    const championList = document.getElementById('champion-list');
    if (!championList) {
        console.error('Error: #champion-list element not found in the DOM.');
        return;
    }

    let html = '';
    for (const champ of filteredChampions) {
        html += `
            <img src="https://ddragon.leagueoflegends.com/cdn/15.7.1/img/champion/${champ.image.full}" 
                 alt="${champ.name}" 
                 onclick="showChampionDetails('${champ.id}')">
        `;
    }

    championList.innerHTML = html;
}

// Initialize the champion data when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    getChampionData();
});
