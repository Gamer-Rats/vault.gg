let state = [];
let champions = []; // Global variable to store champion data

async function getData() {
    const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/15.7.1/data/en_US/item.json`);
    const data = await response.json();
    state = Object.values(data.data);
    console.log('State:', state); // Debugging: Check the state variable

    renderList(state);

    // Call renderSavedItems only if the #saved-items container exists
    if (document.querySelector('#saved-items')) {
        renderSavedItems();
    }
}

async function getChampionData() {
    const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/15.7.1/data/en_US/champion.json`);
    const data = await response.json();
    champions = Object.values(data.data);
    console.log('Champions:', champions); // Debugging: Check the champions array

    renderChampionList();
}

function renderList(records) {
    const result = document.querySelector('#list');
    if (!result) {
        console.error('Error: #list element not found in the DOM.');
        return;
    }

    let html = '';
    for (let rec of records) {
        // Escape single quotes in the item name
        const safeName = rec.name.replace(/'/g, "\\'");
        html += `<li><a href="#" onclick="selectWithDetails('${safeName}')">${rec.name}</a></li>`;
    }

    result.innerHTML = html;

    // Select all list item links
    const listItems = document.querySelectorAll('#master #list li a');

    // Add click event listener to each item
    listItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove 'active' class from all items
            listItems.forEach(link => link.classList.remove('active'));
            
            // Add 'active' class to the clicked item
            item.classList.add('active');
        });
    });
}

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

function findRecord(name){
    for (let rec of state) {
        if (rec.name.trim().toLowerCase() === name.trim().toLowerCase()) {
            return rec;
        }
    }
    return null;
}

function selectWithDetails(name) {
    const result = document.querySelector('#detail');
    const data = findRecord(name);

    if (data) {
        // Check if the item is already favorited
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const isFavorited = favorites.includes(name);
        const favoritedClass = isFavorited ? 'favorited' : '';

        const html = `
            <div class="item-detail-container">
                <img src="https://ddragon.leagueoflegends.com/cdn/15.7.1/img/item/${data.image.full}" alt="${data.name}">
                <div class="item-header">
                    <h2>${data.name}</h2>
                    <span class="save-ribbon ${favoritedClass}" data-name="${name}" onclick="saveItem('${name}')">
                        <i class="fa-solid fa-bookmark"></i>
                    </span>
                </div>
                <p class="item-tags">${data.tags.join(', ') || 'No tags available'}</p>
                <p>${data.plaintext || 'N/A'}</p>
                <p><strong>Gold</strong></p>
                <p>Purchase Value | ${data.gold.base}</p>
                <p>Sell Value | ${data.gold.sell}</p>
                <p><strong>Availability</strong></p>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    ${Object.keys(data.maps)
                        .filter(mapId => data.maps[mapId])
                        .map(mapId => `<img src="https://ddragon.leagueoflegends.com/cdn/15.7.1/img/map/map${mapId}.png" alt="Map ${mapId}" style="width: 50px; height: 50px;">`)
                        .join('')}
                </div>
                <p><strong>Upgrades</strong></p>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    ${data.into
                        ? data.into
                            .map(into => {
                                const upgradeItem = state.find(item => item.image.full === `${into}.png`);
                                if (upgradeItem) {
                                    return `<a href="#" onclick="selectWithDetails('${upgradeItem.name}')">
                                        <img src="https://ddragon.leagueoflegends.com/cdn/15.7.1/img/item/${into}.png" alt="${upgradeItem.name}" style="width: 50px; height: 50px;">
                                    </a>`;
                                } else {
                                    return `<img src="https://ddragon.leagueoflegends.com/cdn/15.7.1/img/item/${into}.png" alt="Unknown Item" style="width: 50px; height: 50px;">`;
                                }
                            })
                            .join('')
                        : '<p>No upgrades available</p>'}
                </div>
            </div>
        `;

        result.innerHTML = html;
    } else {
        result.innerHTML = '<p>Item not found</p>';
    }
}

function showChampionDetails(championId) {
    const champ = champions.find(c => c.id === championId);
    const detailSection = document.getElementById('detail');

    if (champ) {
        const html = `
            <div class="champion-details">
                <div class="ribbon">
                    <span>${champ.name}</span>
                </div>
                <div class="champion-info">
                    <p><strong>Title:</strong> ${champ.title}</p>
                    <p>${champ.blurb}</p>
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

function search() {
    const searchKey = document.querySelector('#searchKey').value.trim().toUpperCase();
    const results = state.filter(rec => rec.name.toUpperCase().includes(searchKey));

    if (results.length === 0) {
        document.querySelector('#list').innerHTML = '<li>No items found</li>';
    } else {
        renderList(results);
    }
}

const searchKeyInput = document.querySelector('#searchKey');
if (searchKeyInput) {
    searchKeyInput.addEventListener('input', function () {
        search(); // Call the search function on every input change
    });

    searchKeyInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default form submission behavior
            search(); // Call the search function
        }
    });
}

function saveItem(name) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const ribbon = document.querySelector(`.save-ribbon[data-name="${name}"]`);

    if (!favorites.includes(name)) {
        // Add to favorites
        favorites.push(name);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        if (ribbon) ribbon.classList.add('favorited'); // Add the 'favorited' class
    } else {
        // Remove from favorites
        favorites = favorites.filter(item => item !== name);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        if (ribbon) ribbon.classList.remove('favorited'); // Remove the 'favorited' class
    }

    console.log('Favorites after saving:', favorites);

    // Re-render the item details to reflect the updated state
    selectWithDetails(name);
}

function renderSavedItems() {
    const savedItemsContainer = document.querySelector('#saved-items');
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    console.log('Favorites:', favorites); // Debugging: Check the favorites array

    if (!state || state.length === 0) {
        console.error('Error: State is empty. Items cannot be rendered.');
        savedItemsContainer.innerHTML = '<p>Unable to load saved items. Please try again later.</p>';
        return;
    }

    if (favorites.length === 0) {
        savedItemsContainer.innerHTML = '<p>No saved items found.</p>';
        return;
    }

    let html = '';
    for (const name of favorites) {
        const item = state.find(item => item.name.trim().toLowerCase() === name.trim().toLowerCase());
        if (item) {
            html += `
                <div class="saved-item">
                    <img src="https://ddragon.leagueoflegends.com/cdn/15.7.1/img/item/${item.image.full}" alt="${item.name}" class="item-image">
                    <p class="item-name">${item.name}</p>
                    <img src="images/x_button.png" alt="Remove" class="remove-button" onclick="removeFavorite('${name}')">
                </div>
            `;
        }
    }

    savedItemsContainer.innerHTML = html;
}

function removeFavorite(name) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(item => item !== name); // Remove the item
    localStorage.setItem('favorites', JSON.stringify(favorites)); // Update localStorage

    // Re-render the saved items list
    renderSavedItems();
}

getData();

// Call the function to fetch champion data when the page loads
if (document.querySelector('#champion-list')) {
    getChampionData();
}