let state = [];

if (document.querySelector('#list')) {
    getData(); // Only call getData if #list exists
}

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

        // Escape single quotes in the item name
        const safeName = name.replace(/'/g, "\\'");

        const html = `
            <div class="item-detail-container">
                <img src="https://ddragon.leagueoflegends.com/cdn/15.7.1/img/item/${data.image.full}" alt="${data.name}">
                <div class="item-header">
                    <h2>${data.name}</h2>
                    <span class="save-ribbon ${favoritedClass}" data-name="${safeName}" onclick="saveItem('${safeName}')">
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
                                    const safeUpgradeName = upgradeItem.name.replace(/'/g, "\\'");
                                    return `<a href="#" onclick="selectWithDetails('${safeUpgradeName}')">
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
            // Escape single quotes in the item name
            const safeName = name.replace(/'/g, "\\'");
            html += `
                <div class="saved-item">
                    <img src="https://ddragon.leagueoflegends.com/cdn/15.7.1/img/item/${item.image.full}" alt="${item.name}" class="item-image">
                    <p class="item-name">${item.name}</p>
                    <img src="images/x_button.png" alt="Remove" class="remove-button" onclick="removeFavorite('${safeName}')">
                </div>
            `;
        }
    }

    savedItemsContainer.innerHTML = html;
}

function removeFavorite(name) {
    console.log('Name passed to removeFavorite:', name); // Debugging: Check the name passed

    // Unescape single quotes in the name
    const unescapedName = name.replace(/\\'/g, "'");
    console.log('Unescaped name:', unescapedName); // Debugging: Check the unescaped name

    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    console.log('Favorites before removing:', favorites); // Debugging: Check the favorites array before removing

    favorites = favorites.filter(item => item !== unescapedName); // Remove the item
    console.log('Favorites after removing:', favorites); // Debugging: Check the favorites array after removing

    localStorage.setItem('favorites', JSON.stringify(favorites)); // Update localStorage

    // Re-render the saved items list
    renderSavedItems();
}