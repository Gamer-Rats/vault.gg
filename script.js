let state = [];

function renderList(records) {
    let html = '';
    let result = document.querySelector('#list');

    for (let rec of records) {
        // Escape single quotes in the item name
        const safeName = rec.name.replace(/'/g, "\\'");
        html += `<li><a href="#" onclick="selectWithDetails('${safeName}')">${rec.name}</a></li>`;
    }

    result.innerHTML = html;
}

async function getData(){
    const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/15.7.1/data/en_US/item.json`);
    const data = await response.json();
    state = Object.values(data.data);
    renderList(state);
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
    let result = document.querySelector('#detail');
    let html = '';
    let data = findRecord(name);

    if (data) {
        html = `
            <div class="item-detail-container">
                <img src="https://ddragon.leagueoflegends.com/cdn/15.7.1/img/item/${data.image.full}" alt="${data.name}">
                <div class="item-header">
                    <h2>${data.name}</h2>
                    <span class="save-ribbon" onclick="saveItem('${name}')">
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
    } else {
        html = '<p>Item not found</p>';
    }

    result.innerHTML = html;
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
    if (!favorites.includes(name)) {
        favorites.push(name);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert(`${name} has been added to your favorites!`);
    } else {
        alert(`${name} is already in your favorites.`);
    }
}

function saveItem(name) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const ribbon = document.querySelector(`.save-ribbon[data-name="${name}"]`);

    if (!favorites.includes(name)) {
        favorites.push(name);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert(`${name} has been added to your favorites!`);
        if (ribbon) ribbon.classList.add('favorited');
    } else {
        favorites = favorites.filter(item => item !== name);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert(`${name} has been removed from your favorites.`);
        if (ribbon) ribbon.classList.remove('favorited');
    }
}

function selectWithDetails(name) {
    let result = document.querySelector('#detail');
    let html = '';
    let data = findRecord(name);
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    if (data) {
        const isFavorited = favorites.includes(name);
        html = `
            <div class="item-detail-container">
                <img src="https://ddragon.leagueoflegends.com/cdn/15.7.1/img/item/${data.image.full}" alt="${data.name}">
                <div class="item-header">
                    <h2>${data.name}</h2>
                    <span class="save-ribbon ${isFavorited ? 'favorited' : ''}" data-name="${name}" onclick="saveItem('${name}')">
                        <i class="fa-solid fa-bookmark"></i>
                    </span>
                </div>
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
    } else {
        html = '<p>Item not found</p>';
    }

    result.innerHTML = html;
}

getData();