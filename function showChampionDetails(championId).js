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