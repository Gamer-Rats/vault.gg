let state = [];

async function getData() {
    const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/15.7.1/data/en_US/item.json`);
    const data = await response.json();
    state = Object.values(data.data);
    renderList(state);

    // Call renderSavedItems after data is loaded
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
                            .map(into => `<img src="https://ddragon.leagueoflegends.com/cdn/15.7.1/img/item/${into}.png" alt="${into}" style="width: 50px; height: 50px;">`)
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

function search(){
    let searchKey = document.querySelector('#searchKey').value;
    let results = [];

    for(let rec of state){
        let searchText = rec.name.toUpperCase();
        searchKey = searchKey.toUpperCase();

        if(searchText.search(searchKey) !== -1){
            results.push(rec);
        }
    }

    if(results.length === 0){
        document.querySelector('#list').innerHTML = '<li>No items found</li>';
    } else{
        renderList(results);
    }
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
    const allItems = state;

    if (favorites.length === 0) {
        savedItemsContainer.innerHTML = '<p>No saved items found.</p>';
        return;
    }

    let html = '';
    for (const name of favorites) {
        const item = allItems.find(item => item.name.trim().toLowerCase() === name.trim().toLowerCase());
        if (item) {
            html += `
                <div class="saved-item">
                    <img src="https://ddragon.leagueoflegends.com/cdn/15.7.1/img/item/${item.image.full}" alt="${item.name}">
                    <p>${item.gold.base}</p>
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