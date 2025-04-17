let state = [];
let userFavorites = null;
let stateLoaded = false;
let userLoaded = false;

async function getData() {
    const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/15.7.1/data/en_US/item.json`);
    const data = await response.json();
    state = Object.values(data.data);
    stateLoaded = true;
    tryRenderFavorites();
    renderList(state);
}

function loadUserFavorites() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            firebase.firestore().collection('users').doc(user.uid).get().then(doc => {
                const data = doc.data();
                userFavorites = data && data.favorites ? data.favorites : {};
                userLoaded = true;
                tryRenderFavorites();
            });
        }
    });
}

function tryRenderFavorites() {
    if (stateLoaded && userLoaded) {
        renderSavedItems(userFavorites.items || []);
        renderSavedChampions(userFavorites.champions || []);
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

function selectWithDetails(name) {
    const result = document.querySelector('#detail');
    const data = findRecord(name);

    if (data) {
        // Use Firestore favorites if logged in, else localStorage
        let favorites;
        const user = firebase.auth().currentUser;
        if (user && window.userFavorites) {
            favorites = window.userFavorites.items || [];
        } else {
            favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        }
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

    if (!detailSection) {
        console.error('Error: #detail element not found in the DOM.');
        return;
    }

    if (champ) {
        const user = firebase.auth().currentUser;
        if (!user) {
            alert("You need to be logged in to view favorites.");
            return;
        }

        // Fetch the user's current favorites from Firestore
        firebase.firestore().collection('users').doc(user.uid).get().then(doc => {
            let favoriteChampions = [];
            if (doc.exists && doc.data().favorites) {
                favoriteChampions = doc.data().favorites.champions || [];
            }

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
        }).catch(error => {
            console.error('Error fetching favorites:', error);
        });
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
    const user = firebase.auth().currentUser;
    if (user) {
        firebase.firestore().collection('users').doc(user.uid).get().then(doc => {
            let favorites = [];
            let champions = [];
            if (doc.exists && doc.data().favorites) {
                favorites = doc.data().favorites.items || [];
                champions = doc.data().favorites.champions || [];
            }
            const ribbon = document.querySelector(`.save-ribbon[data-name="${name}"]`);

            let isFavorited;
            if (!favorites.includes(name)) {
                favorites.push(name);
                isFavorited = true;
            } else {
                favorites = favorites.filter(item => item !== name);
                isFavorited = false;
            }

            // Update UI immediately
            if (ribbon) {
                ribbon.classList.toggle('favorited', isFavorited);
            }

            // Save to Firestore
            saveUserFavorites(favorites, champions);

            // Update in-memory
            if (!window.userFavorites) window.userFavorites = {};
            window.userFavorites.items = favorites;
            window.userFavorites.champions = champions;

            // Optionally re-render details if you want to update other info
            // selectWithDetails(name);
        });
    } else {
        // Fallback to localStorage for guests (optional)
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const ribbon = document.querySelector(`.save-ribbon[data-name="${name}"]`);
        let isFavorited;
        if (!favorites.includes(name)) {
            favorites.push(name);
            isFavorited = true;
        } else {
            favorites = favorites.filter(item => item !== name);
            isFavorited = false;
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        if (ribbon) ribbon.classList.toggle('favorited', isFavorited);
        // selectWithDetails(name);
    }
}

function removeFavorite(name) {
    const user = firebase.auth().currentUser;
    if (user) {
        let favorites = (window.userFavorites && window.userFavorites.items) ? [...window.userFavorites.items] : [];
        favorites = favorites.filter(item => item !== name);

        const champions = (window.userFavorites && window.userFavorites.champions) ? window.userFavorites.champions : [];
        saveUserFavorites(favorites, champions);

        if (!window.userFavorites) window.userFavorites = {};
        window.userFavorites.items = favorites;

        renderSavedItems(favorites);
    } else {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        favorites = favorites.filter(item => item !== name);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        renderSavedItems(favorites);
    }
}

function removeFavoriteItem(itemName) {
    const user = firebase.auth().currentUser;
    if (user) {
        // Fetch the user's current favorites from Firestore
        firebase.firestore().collection('users').doc(user.uid).get().then(doc => {
            let favoriteItems = [];
            if (doc.exists && doc.data().favorites) {
                favoriteItems = doc.data().favorites.items || [];
            }

            // Remove the item from the favorites
            favoriteItems = favoriteItems.filter(favItem => favItem !== itemName);

            // Save the updated favorites back to Firestore
            firebase.firestore().collection('users').doc(user.uid).set({
                favorites: {
                    items: favoriteItems
                }
            }, { merge: true });

            console.log(`Removed item "${itemName}" from favorites.`);

            // Re-render the saved items list
            renderSavedItems(favoriteItems);
        }).catch(error => {
            console.error('Error removing favorite item:', error);
        });
    } else {
        // Fallback for guests using localStorage
        const favoriteItems = JSON.parse(localStorage.getItem('favorites')) || [];
        const updatedFavorites = favoriteItems.filter(favItem => favItem !== itemName);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));

        console.log(`Removed item "${itemName}" from favorites.`);

        // Re-render the saved items list
        renderSavedItems(updatedFavorites);
    }
}

function renderSavedChampions(favoriteChampions = []) {
    const savedChampionsContainer = document.querySelector('#saved-champions');
    console.log('Favorite Champions:', favoriteChampions); // Debugging: Check the favorites array

    if (!savedChampionsContainer) {
        console.error('Error: #saved-champions container not found in the DOM.');
        return;
    }

    if (favoriteChampions.length === 0) {
        savedChampionsContainer.innerHTML = '<p>No saved champions found.</p>';
        return;
    }

    let html = '';
    for (const champ of favoriteChampions) {
        html += `
            <div class="saved-champion">
                <img src="https://ddragon.leagueoflegends.com/cdn/15.7.1/img/champion/${champ.image}" alt="${champ.name}" class="champion-image">
                <p class="champion-name">${champ.name}</p>
                <img src="images/x_button.png" alt="Remove" class="remove-button" onclick="removeFavoriteChampion('${champ.id}')">
            </div>
        `;
    }

    savedChampionsContainer.innerHTML = html;
}

function removeFavoriteChampion(championId) {
    const user = firebase.auth().currentUser;
    if (user) {
        // Fetch the user's current favorites from Firestore
        firebase.firestore().collection('users').doc(user.uid).get().then(doc => {
            let favoriteChampions = [];
            if (doc.exists && doc.data().favorites) {
                favoriteChampions = doc.data().favorites.champions || [];
            }

            // Remove the champion from the favorites
            favoriteChampions = favoriteChampions.filter(favChamp => favChamp.id !== championId);

            // Save the updated favorites back to Firestore
            firebase.firestore().collection('users').doc(user.uid).set({
                favorites: {
                    champions: favoriteChampions
                }
            }, { merge: true });

            console.log(`Removed champion with ID ${championId} from favorites.`);

            // Re-render the saved champions list
            renderSavedChampions(favoriteChampions);
        }).catch(error => {
            console.error('Error removing favorite champion:', error);
        });
    } else {
        // Fallback for guests using localStorage
        const favoriteChampions = JSON.parse(localStorage.getItem('favoriteChampions')) || [];
        const updatedFavorites = favoriteChampions.filter(favChamp => favChamp.id !== championId);
        localStorage.setItem('favoriteChampions', JSON.stringify(updatedFavorites));

        console.log(`Removed champion with ID ${championId} from favorites.`);

        // Re-render the saved champions list
        renderSavedChampions(updatedFavorites);
    }
}

// Save favorites for the logged-in user
function saveUserFavorites(itemsArray, championsArray) {
    const user = firebase.auth().currentUser;
    if (!user) return;
    firebase.firestore().collection('users').doc(user.uid)
        .set({ favorites: { items: itemsArray, champions: championsArray } }, { merge: true });
}

// Call both functions
document.addEventListener('DOMContentLoaded', function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            loadUserFavorites();
        }
    });
});


document.addEventListener('DOMContentLoaded', function() {
    firebase.auth().onAuthStateChanged(function(user) {
        const logoutNav = document.getElementById('logout-nav');
        if (logoutNav) {
            if (user) {
                logoutNav.innerHTML = '<a href="#" id="logout-btn">Logout</a>';
                document.getElementById('logout-btn').addEventListener('click', function(e) {
                    e.preventDefault();
                    firebase.auth().signOut().then(function() {
                        window.location.href = "login.html";
                    });
                });
            } else {
                logoutNav.innerHTML = '<a href="login.html">Login</a>';
            }
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
            alert("You need to be logged in to use this page.");
            window.location.href = "login.html";
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const removeAllChampionsBtn = document.getElementById('remove-all-champions');
    if (removeAllChampionsBtn) {
        removeAllChampionsBtn.addEventListener('click', function () {
            if (confirm('Are you sure you want to remove all favorited champions?')) {
                const user = firebase.auth().currentUser;
                if (user) {
                    // Clear all favorited champions in Firestore
                    firebase.firestore().collection('users').doc(user.uid).get().then(doc => {
                        if (doc.exists && doc.data().favorites) {
                            const favoriteItems = doc.data().favorites.items || [];
                            // Save only the items, clearing the champions
                            firebase.firestore().collection('users').doc(user.uid).set({
                                favorites: {
                                    items: favoriteItems,
                                    champions: [] // Clear all champions
                                }
                            }, { merge: true }).then(() => {
                                console.log('All favorited champions removed.');
                                renderSavedChampions([]); // Re-render with an empty list
                            }).catch(error => {
                                console.error('Error removing all favorited champions:', error);
                            });
                        }
                    }).catch(error => {
                        console.error('Error fetching user favorites:', error);
                    });
                } else {
                    // Fallback for guests using localStorage
                    localStorage.setItem('favoriteChampions', JSON.stringify([]));
                    console.log('All favorited champions removed for guest user.');
                    renderSavedChampions([]); // Re-render with an empty list
                }
            }
        });
    }
});

function renderSavedItems(favorites = []) {
    const savedItemsContainer = document.querySelector('#saved-items');
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
                    <img src="images/x_button.png" alt="Remove" class="remove-button" onclick="removeFavoriteItem('${safeName}')">
                </div>
            `;
        }
    }

    savedItemsContainer.innerHTML = html;
}

getData();
loadUserFavorites();