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
    const modal = document.getElementById('champion-modal');
    const champ = champions.find(c => c.id === championId);

    if (champ) {
        const html = `
            <div class="modal-content">
                <button class="close-modal">&times;</button>
                <p><strong>Title:</strong> ${champ.title}</p>
                <p>${champ.blurb}</p>
                <p><strong>Stats:</strong></p>
                <ul>
                    <li>Attack: ${champ.info.attack}</li>
                    <li>Defense: ${champ.info.defense}</li>
                    <li>Magic: ${champ.info.magic}</li>
                    <li>Difficulty: ${champ.info.difficulty}</li>
                </ul>
            </div>
        `;

        modal.innerHTML = html;
        modal.classList.add('show');

        // Add event listener to close the modal
        const closeModal = modal.querySelector('.close-modal');
        closeModal.addEventListener('click', () => {
            modal.classList.remove('show');
        });

        // Close modal when clicking outside the content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    } else {
        console.error('Champion not found');
    }
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
