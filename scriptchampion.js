let champions = []; // Global variable to store champion data

// Fetch champion data from the API
async function getChampionData() {
    try {
        const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/15.7.1/data/en_US/champion.json`);
        const data = await response.json();
        champions = Object.values(data.data);
        console.log('Champions:', champions); // Debugging: Check the champions array

        renderChampionList();
    } catch (error) {
        console.error('Error fetching champion data:', error);
    }
}

// Render the champion icons in the champion list
function renderChampionList() {
    const championList = document.querySelector('#champion-list');
    if (!championList) {
        console.error('Error: #champion-list element not found in the DOM.');
        return;
    }

    let html = '';
    for (const champ of champions) {
        html += `
            <img src="https://ddragon.leagueoflegends.com/cdn/15.7.1/img/champion/${champ.image.full}" 
                 alt="${champ.name}" 
                 onclick="showChampionDetails('${champ.id}')">
        `;
    }

    championList.innerHTML = html;
}

// Show champion details in a modal pop-up
function showChampionDetails(championId) {
    const modal = document.getElementById('champion-modal');
    const champ = champions.find(c => c.id === championId);

    if (champ) {
        const html = `
            <div class="modal-content">
                <button class="close-modal">&times;</button>
                <h2>${champ.name}</h2>
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

// Initialize the champion data when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    getChampionData();
});