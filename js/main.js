let allProjects = [];

async function loadProjects() {
    const grid = document.getElementById('projects-grid');
    grid.innerHTML = '<div class="loading">Loading projects...</div>';

    try {
        // Загружаем основной файл со списком
        const response = await fetch('./data/projects.json');
        const manifest = await response.json();

        // Загружаем все файлы из include
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
        const id = btn.dataset.id;  // ← убрали parseInt
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
        } else {
            currentSlides.push({
                type: item.type || 'text',
                title: item.title || 'Untitled',
                path: item.path || '',
                content: item.content || '',
                size: item.size || ''
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
            slideHtml += `<iframe class="game-frame" src="${slide.path}" style="width: 100%; height: 100%; border: none; border-radius: 0px;"></iframe>`;
            break;

        case 'image':
            slideHtml += `<img src="${slide.path}" style="max-width: 100%; max-height: 60vh; border-radius: 12px; display: block; margin: 0 auto;" onerror="this.style.display='none'">`;
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
                    module.init3DViewer(slide.path, canvas);
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
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;

            if (filter === 'all') {
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

document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    setupFilters();

    const modal = document.getElementById('modal');
    document.querySelector('.close-modal').addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
});