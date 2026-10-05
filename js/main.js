let allProjects = [];

async function loadProjects() {
    const grid = document.getElementById('projects-grid');
    grid.innerHTML = '<div class="loading">Loading projects...</div>';

    try {
        const response = await fetch('./data/projects.json');
        const manifest = await response.json();

        let allProjectsData = [];
        for (const file of manifest.include) {
            const fileResponse = await fetch(`./data/${file}`);
            const fileData = await fileResponse.json();
            if (fileData.projects) {
                allProjectsData = allProjectsData.concat(fileData.projects);
            }
        }

        allProjects = allProjectsData;
        renderProjects(allProjects);
    } catch (error) {
        console.error(error);
        grid.innerHTML = `<div class="loading">Error: ${error.message}</div>`;
    }

    showAboutMe();  // ← добавь здесь
}

function renderProjects(projects) {
    const grid = document.getElementById('projects-grid');

    if (!projects || projects.length === 0) {
        grid.innerHTML = '<div class="loading">No projects</div>';
        return;
    }

    grid.innerHTML = projects.map(project => {
        let previewHtml = '';
        if (project.previewImage && project.previewImage !== '') {
            previewHtml = `<img class="card-preview" src="${project.previewImage}" 
                onclick="event.stopPropagation(); window.showImageModal('${project.previewImage}')"
                onerror="this.src='https://placehold.co/160x160/1a2740/6688aa?text=No+Image'"
                style="cursor: pointer;">`;
        } else {
            previewHtml = `<div class="card-preview" style="background: #1a2740; display: flex; align-items: center; justify-content: center; color: #6688aa; font-size: 12px;">Preview</div>`;
        }

        return `
        <div class="project-card" data-category="${project.category}" data-id="${project.id}">
            ${previewHtml}
            <div class="card-content">
                <div class="card-title-wrapper">
                    <h3 class="card-title">${escapeHtml(project.title)}</h3>
                    <div class="card-tags">
                        <span class="tag">${escapeHtml(project.category)}</span>
                    </div>
                </div>
                <p class="card-description">${escapeHtml(project.description)}</p>
                <button class="btn btn-primary details-btn" data-id="${project.id}">View Details</button>
            </div>
        </div>
    `}).join('');

    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.dataset.id;
            const project = allProjects.find(p => p.id === id);
            if (project) {
                showFullDetails(project);
            } else {
                console.error('Project not found for ID:', id);
            }
        });
    });
}

// ============ СЛАЙДЕР ============

let currentSlideIndex = 0;
let currentSlides = [];

async function showFullDetails(project) {
    console.log('Clicked! Project:', project);
    currentSlides = [];
    currentSlideIndex = 0;

    if (!project.content || !Array.isArray(project.content)) {
        showBasicDetails(project);
        showBasicDetails(project);
        return;
    }

    project.content.forEach(item => {
    if (item.type === 'audio') {
        currentSlides.push({
            type: 'audio',
            title: item.title || 'Audio',
            audioPath: item.audioPath || '',
            coverImage: item.coverImage || '',
            description: item.description || ''
        });
    } else if (item.type === 'text-with-downloads') {
        currentSlides.push({
            type: 'text-with-downloads',
            title: item.title || 'Description & Downloads',
            textFile: item.textFile || '',
            content: item.content || '',
            downloads: item.downloads || []
        });
    } else if (item.type === '3d') {
        // ← НОВЫЙ БЛОК ДЛЯ 3D
        currentSlides.push({
            type: '3d',
            title: item.title || '3D Model',
            path: item.path || '',
            showAnimations: item.showAnimations !== undefined ? item.showAnimations : true
        });
    } else {
       currentSlides.push({
        type: item.type || 'text',
        title: item.title || 'Untitled',
        path: item.path || '',
        content: item.content || '',
        size: item.size || '',
        images: item.images || [],
        newTab: item.newTab || false,
        description: item.description || ''  // ← добавь
    });
    }
});

    if (currentSlides.length === 0) {
        showBasicDetails(project);
        return;
    }

    await renderSlide();
}

async function renderSlide() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const slide = currentSlides[currentSlideIndex];

    let slideHtml = `
        <div style="position: relative;">
            <div class="slide-nav">
                <div class="slide-title-info" style="text-align: center; padding: 0 80px;">
                    <span class="slide-title">${escapeHtml(slide.title)}</span>
                    ${slide.size ? `<span class="slide-desc">${escapeHtml(slide.size)}</span>` : ''}
                </div>
            </div>
            <button class="nav-prev" ${currentSlideIndex === 0 ? 'disabled' : ''}>‹</button>
            <button class="nav-next" ${currentSlideIndex === currentSlides.length - 1 ? 'disabled' : ''}>›</button>
            <div class="slide-content">
    `;

    switch(slide.type) {
        case '3d':
            slideHtml += `<div id="modal-3d-canvas" style="width: 100%; height: 450px; background: #0a1020; border-radius: 12px;"></div>`;
            break;

        case 'video':
            slideHtml += `<div style="display: flex; justify-content: center; width: 100%;">
                <video controls style="max-width: 100%; max-height: 60vh; width: auto; height: auto; border-radius: 12px;">
                    <source src="${slide.path}" type="video/mp4">
                </video>
            </div>`;
            break;

        case 'audio':
            slideHtml += `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 20px; width: 100%; max-width: 600px; margin: 0 auto;">
                    ${slide.coverImage ? `<img src="${slide.coverImage}" style="max-width: 300px; max-height: 300px; border-radius: 16px; object-fit: cover; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">` : ''}
                    ${slide.description ? `<p style="color: #aabbdd; text-align: center; margin: 0;">${escapeHtml(slide.description)}</p>` : ''}
                    <audio controls style="width: 100%;">
                        <source src="${slide.audioPath}" type="audio/mpeg">
                        Your browser does not support the audio element.
                    </audio>
                </div>
            `;
            break;

        case 'webgl':
    if (slide.newTab) {
        slideHtml += `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 20px;">
                <p style="color: #aabbdd;">${escapeHtml(slide.description || 'This game opens in a new window.')}</p>
                <a href="${slide.path}" target="_blank" class="btn btn-primary" style="text-decoration: none; padding: 12px 32px;">Launch Game</a>
            </div>
        `;
    } else {
        slideHtml += `<iframe class="game-frame" src="${slide.path}" style="width: 100%; height: 100%; border: none; border-radius: 0px;"></iframe>`;
    }
    break;

        case 'image':
    if (slide.images && slide.images.length > 0) {
        let galleryHtml = `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px; width: 100%; max-height: 65vh; overflow-y: auto; padding-right: 4px;">`;
        slide.images.forEach(img => {
            galleryHtml += `
                <div style="cursor: pointer; border-radius: 12px; overflow: hidden; aspect-ratio: 1;">
                    <img src="${img}" style="width: 100%; height: 100%; object-fit: cover;" onclick="window.openFullImage('${img}')">
                </div>
            `;
        });
        galleryHtml += `</div>`;
        slideHtml += galleryHtml;
    } else if (slide.path) {
        slideHtml += `
            <div style="cursor: pointer; border-radius: 12px; overflow: hidden; width: 100%;">
                <img src="${slide.path}" style="width: 100%; max-height: 60vh; object-fit: contain;" onclick="window.openFullImage('${slide.path}')">
            </div>
        `;
    }
    break;

        case 'text-with-downloads':
            let textContent = slide.content || '';
            if (slide.textFile) {
                try {
                    const response = await fetch(slide.textFile);
                    if (response.ok) {
                        textContent = await response.text();
                    } else {
                        textContent = 'Description file not found.';
                    }
                } catch (e) {
                    textContent = 'Error loading description.';
                }
            }

            let html = `
                <div style="display: flex; flex-direction: column; gap: 20px; width: 100%; max-height: 60vh; overflow-y: auto; padding: 4px;">
                    <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 16px 20px;">
                        <p style="white-space: pre-wrap; color: #c0d0f0; line-height: 1.8; margin: 0;">${escapeHtml(textContent)}</p>
                    </div>
            `;

            if (slide.downloads && slide.downloads.length) {
                html += `<div style="display: flex; flex-direction: column; gap: 10px;">`;
                slide.downloads.forEach(file => {
                    html += `
                        <a href="${file.path}" download class="download-item" style="
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 14px 18px;
                            background: rgba(34, 102, 170, 0.2);
                            border: 1px solid #3388cc;
                            border-radius: 12px;
                            text-decoration: none;
                            transition: all 0.2s;
                        " onmouseover="this.style.background='rgba(34,102,170,0.4)'" onmouseout="this.style.background='rgba(34,102,170,0.2)'">
                            <div>
                                <div style="color: #88bbff; font-weight: 500;">📎 ${escapeHtml(file.name)}</div>
                                <div style="color: #6688aa; font-size: 0.75rem; margin-top: 4px;">${file.size || 'Download'}</div>
                            </div>
                            <div style="color: #4488cc; font-size: 24px;">⬇</div>
                        </a>
                    `;
                });
                html += `</div>`;
            }

            html += `</div>`;
            slideHtml += html;
            break;
    }

    slideHtml += `
            </div>
            <div class="slide-counter">${currentSlideIndex + 1} / ${currentSlides.length}</div>
        </div>
    `;

    modalBody.innerHTML = slideHtml;
    modal.style.display = 'flex';

   // Инициализируем 3D
if (slide.type === '3d' && slide.path) {
    setTimeout(() => {
        const canvas = document.getElementById('modal-3d-canvas');
        if (canvas) {
            import('./model-viewer.js').then(module => {
                // ← ПЕРЕДАЁМ ТРЕТИЙ ПАРАМЕТР
                module.init3DViewer(slide.path, canvas, slide.showAnimations);
            });
        }
    }, 100);
}

    // Кнопки навигации
    const prevBtn = document.querySelector('.nav-prev');
    const nextBtn = document.querySelector('.nav-next');

    if (prevBtn && !prevBtn.disabled) {
        prevBtn.addEventListener('click', () => {
            if (currentSlideIndex > 0) {
                currentSlideIndex--;
                renderSlide();
            }
        });
    }

    if (nextBtn && !nextBtn.disabled) {
        nextBtn.addEventListener('click', () => {
            if (currentSlideIndex < currentSlides.length - 1) {
                currentSlideIndex++;
                renderSlide();
            }
        });
    }
}

function showBasicDetails(project) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h2>${escapeHtml(project.title)}</h2>
        <p>${escapeHtml(project.description)}</p>
        <p>${escapeHtml(project.content?.details || 'No additional details')}</p>
    `;
    modal.style.display = 'flex';
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function setupFilters() {
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;

            if (filter === 'about') {
                showAboutMe();
            } else if (filter === 'all') {
                const filtered = allProjects.filter(p =>
                    p.category === 'robots' ||
                    p.category === 'models' ||
                    p.category === 'games' ||
                    p.category === 'programs'
                );
                renderProjects(filtered);
            } else {
                renderProjects(allProjects.filter(p => p.category === filter));
            }
        });
    });
}

window.showImageModal = function(imageSrc) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
            <img src="${imageSrc}" style="max-width: 100%; max-height: 80vh; border-radius: 12px;">
        </div>
    `;
    modal.style.display = 'flex';
};

window.openFullImage = function(src) {
    const modalBody = document.getElementById('modal-body');

    // Сохраняем текущее содержимое
    const currentContent = modalBody.innerHTML;

    // Создаём оверлей с картинкой
    const overlay = document.createElement('div');
    overlay.id = 'full-image-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.92);
        z-index: 2000;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    `;

    overlay.innerHTML = `
        <img src="${src}" style="max-width: 95%; max-height: 95vh; object-fit: contain; border-radius: 12px;">
        <div style="position: absolute; top: 20px; right: 30px; color: white; font-size: 36px; cursor: pointer; z-index: 2001;">✕</div>
    `;

    // Закрытие по клику на фон или крестик
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.tagName === 'DIV') {
            overlay.remove();
        }
    });

    // Закрытие по крестику
    overlay.querySelector('div:last-child').addEventListener('click', () => {
        overlay.remove();
    });

    document.body.appendChild(overlay);
};

document.addEventListener('DOMContentLoaded', () => {

    loadProjects();
    setupFilters();


    const modal = document.getElementById('modal');
    document.querySelector('.close-modal').addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
});


async function showAboutMe() {
    const grid = document.getElementById('projects-grid');
    try {
        const response = await fetch('./about.html');
        const html = await response.text();
        grid.innerHTML = html;
    } catch (error) {
        grid.innerHTML = '<div class="loading">Failed to load About Me</div>';
    }
}

window.toggleNavSidebar = function() {
    const sidebar = document.getElementById('navSidebar');
    sidebar.classList.toggle('collapsed');
};

document.addEventListener('DOMContentLoaded', () => {
    showAboutMe();
    loadProjects();
    setupFilters();

    const modal = document.getElementById('modal');

    // Закрытие по крестику
    document.querySelector('.close-modal').addEventListener('click', () => {
        const videos = modal.querySelectorAll('video');
        videos.forEach(video => {
            video.pause();
            video.currentTime = 0;
        });
        modal.style.display = 'none';
    });

    // Закрытие по клику на фон
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            const videos = modal.querySelectorAll('video');
            videos.forEach(video => {
                video.pause();
                video.currentTime = 0;
            });
            modal.style.display = 'none';
        }
    });
});