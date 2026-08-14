// ============ ДАННЫЕ ============
const GAMES_DATA = [
    {
        id: 1,
        title: "Misha's Cars",
        author: "Silantiev",
        description: "Endless racing",
        previewImage: "assets/students_game/mishamisha/mishamisha.jpg",
        path: "assets/students_game/mishamisha/index.html",
        tags: ["Silantiev Misha"]
    },
    {
        id: 2,
        title: "Dungeon Adventure",
        author: "Lelik",
        description: "2D platformer with endless levels",
        previewImage: "assets/students_game/Lelik_dungionGame/lelikKnight.jpg",
        path: "assets/students_game/Lelik_dungionGame/lelikKnight.html",
        tags: ["Lelik Alexander"]
    },
    {
        id: 3,
        title: "Soldering iron",
        author: "Lelik",
        description: "Learn about electricity—draw a wire so that electrons travel from the positive terminal to the negative one.",
        previewImage: "assets/students_game/LelikPayalnik/payalnik.jpg",
        path: "assets/students_game/LelikPayalnik/payalnik.html",
        tags: ["Lelik Alexander"]
    },
    {
        id: 4,
        title: "Lelik's Jackal",
        author: "Lelik",
        description: "3D racing game with 5 tracks",
        previewImage: "assets/students_game/Lelik_jackal/lelik_jackal.jpg",
        path: "assets/students_game/Lelik_jackal/lelik_jackal.html",
        tags: ["Lelik Alexander"]
    },
    {
        id: 5,
        title: "airBattle",
        author: "Vika",
        description: "2D planes fight",
        previewImage: "assets/students_game/airBattle/airBattle.jpg",
        path: "assets/students_game/airBattle/airBattle.html",
        tags: ["Vika"]
    },
    {
        id: 6,
        title: "asteroids",
        author: "Egor",
        description: "Protect the planets from asteroids.",
        previewImage: "assets/students_game/asteroids/asteroids.jpg",
        path: "assets/students_game/asteroids/asteroids.html",
        tags: ["Egor"]
    },
     {
        id: 7,
        title: "Egor_tank",
        author: "Egor",
        description: "Protect the planets from asteroids.",
        previewImage: "assets/students_game/Egor_tank/egorCars.jpg",
        path: "assets/students_game/Egor_tank/egorCars.html",
        tags: ["Egor"]
    },
    {
        id: 8,
        title: "ninjaPlatformer",
        author: "Alexey",
        description: "Reach stage 16, collect stars, and watch out for the robot.",
        previewImage: "assets/students_game/ninjaPlatformer/ninjaPlatformer.jpg",
        path: "assets/students_game/ninjaPlatformer/ninjaPlatformer.html",
        tags: ["Alexey Dementiev"]
    },
    {
        id: 9,
        title: "OldmineCrafter",
        author: "Alexey",
        description: "Mine rocks, search for valuable minerals, and move right to reach the next level. Endless gameplay.",
        previewImage: "assets/students_game/OldmineCrafter/OldmineCrafter.jpg",
        path: "assets/students_game/OldmineCrafter/OldmineCrafter.html",
        tags: ["Alexey Dementiev"]
    },
    {
        id: 10,
        title: "runnerCat",
        author: "Vika",
        description: "Collect hearts, dodge rocks.",
        previewImage: "assets/students_game/runnerCat/runnerCat.jpg",
        path: "assets/students_game/runnerCat/runnerCat.html",
        tags: ["Vika"]
    },
    {
        id: 11,
        title: "runnerShip",
        author: "Vika",
        description: "Collect coins, dodge rocks.",
        previewImage: "assets/students_game/runnerShip/runnerShip.jpg",
        path: "assets/students_game/runnerShip/runnerShip.html",
        tags: ["Vika"]
    },
     {
        id: 12,
        title: "Wizard",
        author: "Vika",
        description: "Collect potions, break rocks, and move right to the next level. Endless game.",
        previewImage: "assets/students_game/Wizard/Wizard.jpg",
        path: "assets/students_game/Wizard/Wizard.html",
        tags: ["Vika"]
    },
     {
        id: 13,
        title: "Zoo",
        author: "Egor",
        description: "Animals have escaped from the zoo and could get hurt! Click on them to return them to the zoo.",
        previewImage: "assets/students_game/zoo/zoo.jpg",
        path: "assets/students_game/zoo/zoo.html",
        tags: ["Egor"]
    },
     {
        id: 14,
        title: "Seraphim's Offroad",
        author: "Seraphim",
        description: "Follow the arrow and beat the clock. If you get stuck, press Tab to switch levels.",
        previewImage: "assets/students_game/Seraphim Offroad/Seraphim Offroad.jpg",
        path: "assets/students_game/Seraphim Offroad/index.html",
        tags: ["Seraphim"]
    },
    {
        id: 15,
        title: "GeorgySpaseDefender",
        author: "Georgy",
        description: "Protect the main ship from asteroids using LMB. Repair the ship using RMB.",
        previewImage: "assets/students_game/GeorgySpaseDefender/GeorgySpaseDefender.jpg",
        path: "assets/students_game/GeorgySpaseDefender/index.html",
        tags: ["Georgy"]
    }
];

// ============ СОСТОЯНИЕ ============
let allTags = [];
let activeTags = []; // массив для поддержки нескольких тегов

// ============ ФУНКЦИИ ============
function extractAllTags(games) {
    const tagSet = new Set();
    games.forEach(game => {
        game.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
}

function renderFilters(tags) {
    const container = document.getElementById('filter-container');

    let html = `<div class="filter-group">`;
    html += `<span class="filter-group-title">Tags</span>`;

    // Кнопка "All"
    html += `<button class="filter-tag active-all" data-tag="__all__">All</button>`;

    // Остальные теги
    tags.forEach(tag => {
        const isActive = activeTags.includes(tag);
        html += `<button class="filter-tag ${isActive ? 'active' : ''}" data-tag="${tag}">${tag}</button>`;
    });

    html += `</div>`;
    container.innerHTML = html;

    // Обработчики кликов
    container.querySelectorAll('.filter-tag').forEach(btn => {
        btn.addEventListener('click', () => {
            const tag = btn.dataset.tag;

            if (tag === '__all__') {
                // Сброс всех фильтров
                activeTags = [];
                renderFilters(allTags);
                renderGames(GAMES_DATA);
                return;
            }

            // Переключаем тег
            const index = activeTags.indexOf(tag);
            if (index === -1) {
                activeTags.push(tag);
            } else {
                activeTags.splice(index, 1);
            }

            // Убираем активный класс у All
            document.querySelector('.filter-tag[data-tag="__all__"]')?.classList.remove('active-all');

            // Обновляем кнопки
            renderFilters(allTags);

            // Фильтруем игры
            const filtered = filterGames(GAMES_DATA, activeTags);
            renderGames(filtered);
        });
    });
}

function filterGames(games, tags) {
    if (tags.length === 0) return games;
    return games.filter(game => {
        return tags.some(tag => game.tags.includes(tag));
    });
}

function renderGames(games) {
    const grid = document.getElementById('games-grid');

    if (games.length === 0) {
        grid.innerHTML = '<div class="loading">No games found with selected tags</div>';
        return;
    }

    grid.innerHTML = games.map(game => `
        <div class="game-card" onclick="window.openGame('${game.path}')">
            <img class="game-card-preview" src="${game.previewImage}" 
                 onerror="this.style.display='none'">
            <div class="game-card-content">
                <div class="game-card-title">${escapeHtml(game.title)}</div>
               
                <div class="game-card-description">${escapeHtml(game.description)}</div>
                <div class="game-card-tags">
                    ${game.tags.map(tag => `<span class="game-card-tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Открытие игры на весь экран
window.openGame = function(path) {
    window.open(path, '_blank');
};

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ============ САЙДБАР ============
window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
};

// ============ ЗАПУСК ============
document.addEventListener('DOMContentLoaded', () => {
    allTags = extractAllTags(GAMES_DATA);
    renderFilters(allTags);
    renderGames(GAMES_DATA);
});