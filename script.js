// ================================
// 1. КОНФИГУРАЦИЯ И ДАННЫЕ
// ================================
const ADMIN_SECRET_CODE = 'ADMIN2026'; // Код для получения прав админа

const TOPICS = {
    programming:   { name: 'Программирование',           icon: '💻' },
    networks:      { name: 'Компьютерные сети',          icon: '🌍' },
    blockchain:    { name: 'Блокчейн',                   icon: '⛓️' },
    security:      { name: 'Кибер безопасность',         icon: '🛡️' },
    video_editing: { name: 'Монтаж',                     icon: '🎬' },
    modeling_3d:   { name: '3D-моделирование',           icon: '🎨' }, 
    sysadmin:      { name: 'Системное администрирование', icon: '🖥️' }
};

const PROGRAMMING_LANGS = {
    python:      { name: 'Python',     icon: '🐍',  prism: 'python' },
    sql:         { name: 'SQL',        icon: '🗄️',  prism: 'sql' },
    csharp:      { name: 'C#',         icon: '⚡',  prism: 'csharp' },
    cpp:         { name: 'C++',        icon: '⚙️',  prism: 'cpp' },
    java:        { name: 'Java',       icon: '☕',  prism: 'java' },
    javascript:  { name: 'JavaScript', icon: '🟨',  prism: 'javascript' },
    kotlin:      { name: 'Kotlin',     icon: '🟪',  prism: 'kotlin' },
    go:          { name: 'GO',         icon: '🐹',  prism: 'go' },
    html:        { name: 'HTML',       icon: '🌐',  prism: 'markup' },
    css:         { name: 'CSS',        icon: '🎨',  prism: 'css' }
};

const LANG_NAMES = {
    none: '', markup: 'HTML', css: 'CSS', bash: 'Bash', powershell: 'PowerShell',
    ...Object.fromEntries(Object.entries(PROGRAMMING_LANGS).map(([k, v]) => [k, v.name]))
};

// Демо-данные с ID авторов
const DEMO_POSTS = [
    {
        id: 1,
        title: 'Основы Python для начинающих',
        excerpt: 'Синтаксис, переменные и базовые конструкции Python',
        topic: 'programming',
        lang: 'python',
        content: 'Python — высокоуровневый язык с простым синтаксисом.',
        code: `def greet(name):\n    return f"Привет, {name}!"`,
        author: 'Алексей',
        authorId: 'demo_user_1', // ID автора
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
        date: Date.now() - 86400000
    },
    {
        id: 2,
        title: 'SQL: выборка с JOIN',
        excerpt: 'Соединяем таблицы для получения связанных данных',
        topic: 'programming',
        lang: 'sql',
        content: 'JOIN позволяет объединять данные из нескольких таблиц.',
        code: `SELECT * FROM users INNER JOIN orders ON users.id = orders.user_id`,
        author: 'Иван',
        authorId: 'demo_user_2',
        image: null,
        date: Date.now() - 172800000
    },
    {
        id: 3,
        title: 'Hello World на C#',
        excerpt: 'Первая программа на C# в .NET',
        topic: 'programming',
        lang: 'csharp',
        content: 'C# — современный объектно-ориентированный язык.',
        code: `Console.WriteLine("Hello, World!");`,
        author: 'Сергей',
        authorId: 'demo_user_3',
        image: null,
        date: Date.now() - 200000000
    }
];

// ================================
// 2. СОСТОЯНИЕ ПРИЛОЖЕНИЯ
// ================================
let posts = [];
let currentUser = null; // { id, username, isAdmin }
let currentFilter = 'all';
let currentSort = 'new';

// ================================
// 3. DOM ЭЛЕМЕНТЫ
// ================================
const postsGrid        = document.getElementById('postsGrid');
const postsEmpty       = document.getElementById('postsEmpty');
const filterSelect     = document.getElementById('filterSelect');
const sortSelect       = document.getElementById('sortSelect');
const createModal      = document.getElementById('createModal');
const viewModal        = document.getElementById('viewModal');
const searchModal      = document.getElementById('searchModal');
const authModal        = document.getElementById('authModal');
const comingSoonModal  = document.getElementById('comingSoonModal');
const aboutModal       = document.getElementById('aboutModal');
const searchInput      = document.getElementById('searchInput');
const searchResults    = document.getElementById('searchResults');
const toastContainer   = document.getElementById('toastContainer');
const createForm       = document.getElementById('createForm');
const mobileMenu       = document.getElementById('mobileMenu');
const userArea         = document.getElementById('userArea');

// Элементы формы создания
const postImageUrl     = document.getElementById('postImageUrl');
const postImageFile    = document.getElementById('postImageFile');
const clearImageBtn    = document.getElementById('clearImageBtn');
const imagePreview     = document.getElementById('imagePreview');
const postTopicSelect  = document.getElementById('postTopic');
const postLangGroup    = document.getElementById('postLangGroup');
const postLangSelect   = document.getElementById('postLang');

// Элементы авторизации
const authForm         = document.getElementById('authForm');
const adminCodeGroup   = document.getElementById('adminCodeGroup');
const toggleAdminBtn   = document.getElementById('toggleAdminModeBtn');

// ================================
// 4. ФУНКЦИИ ПОМОЩНИКИ
// ================================
function savePosts() {
    localStorage.setItem('devspace_posts', JSON.stringify(posts));
}

function saveUser(user) {
    if (user) {
        localStorage.setItem('devspace_user', JSON.stringify(user));
        currentUser = user;
    } else {
        localStorage.removeItem('devspace_user');
        currentUser = null;
    }
    renderUserArea();
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days < 7) return `${days} дн назад`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ================================
// 5. АВТОРИЗАЦИЯ И ПОЛЬЗОВАТЕЛИ
// ================================
function renderUserArea() {
    if (currentUser) {
        const adminBadge = currentUser.isAdmin ? '<span style="color:var(--accent); font-size:10px; border:1px solid var(--accent); padding:2px 4px; border-radius:4px; margin-left:5px;">ADMIN</span>' : '';
        userArea.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-weight:500;">${escapeHtml(currentUser.username)} ${adminBadge}</span>
                <button class="btn btn--small" id="logoutBtn">Выйти</button>
            </div>
        `;
        document.getElementById('logoutBtn').addEventListener('click', () => {
            saveUser(null);
            showToast('Вы вышли из системы');
            renderPosts(); // Перерисовать, чтобы скрыть кнопки удаления
        });
    } else {
        userArea.innerHTML = `<button class="btn btn--primary btn--header" id="loginBtn">Войти</button>`;
        document.getElementById('loginBtn').addEventListener('click', () => openModal(authModal));
    }
}

// Обработка формы входа
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('authUsername').value.trim();
    const isAdminMode = adminCodeGroup.style.display !== 'none';
    let isAdmin = false;

    if (isAdminMode) {
        const code = document.getElementById('adminCodeInput').value.trim();
        if (code === ADMIN_SECRET_CODE) {
            isAdmin = true;
        } else {
            showToast('Неверный код администратора!');
            return;
        }
    }

    // Генерируем простой ID на основе имени (в реальном проекте это делает сервер)
    const userId = 'user_' + username.toLowerCase().replace(/\s/g, '_') + '_' + Date.now();
    
    const newUser = {
        id: userId,
        username: username,
        isAdmin: isAdmin
    };

    saveUser(newUser);
    closeModal(authModal);
    showToast(`Добро пожаловать, ${username}!`);
    renderPosts(); // Перерисовать посты, чтобы появились кнопки удаления
});

// Переключатель режима админа в модалке
toggleAdminBtn.addEventListener('click', () => {
    if (adminCodeGroup.style.display === 'none') {
        adminCodeGroup.style.display = 'block';
        toggleAdminBtn.textContent = 'Обычный пользователь';
        toggleAdminBtn.classList.add('btn--primary');
        toggleAdminBtn.classList.remove('btn--ghost');
    } else {
        adminCodeGroup.style.display = 'none';
        toggleAdminBtn.textContent = 'Я админ';
        toggleAdminBtn.classList.remove('btn--primary');
        toggleAdminBtn.classList.add('btn--ghost');
    }
});

// ================================
// 6. РАБОТА С КАРТИНКАМИ И ФОРМОЙ
// ================================
function showImagePreview(src) {
    const img = imagePreview.querySelector('img');
    img.src = src;
    imagePreview.classList.add('has-image');
}

function clearImagePreview() {
    const img = imagePreview.querySelector('img');
    img.src = '';
    imagePreview.classList.remove('has-image');
    postImageUrl.value = '';
    postImageFile.value = '';
}

postImageUrl.addEventListener('input', (e) => {
    const url = e.target.value.trim();
    if (url) showImagePreview(url);
    else clearImagePreview();
});

postImageFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        showToast('Выберите изображение');
        return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
        postImageUrl.value = event.target.result;
        showImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
});

clearImageBtn.addEventListener('click', clearImagePreview);

function updateLangVisibility() {
    const topic = postTopicSelect.value;
    if (topic === 'programming') {
        postLangGroup.style.display = '';
        postLangSelect.required = true;
    } else {
        postLangGroup.style.display = 'none';
        postLangSelect.required = false;
        postLangSelect.value = 'none';
    }
}
postTopicSelect.addEventListener('change', updateLangVisibility);

// ================================
// 7. РЕНДЕРИНГ
// ================================
function renderTopicsGrid() {
    const grid = document.getElementById('topicsGrid');
    if (!grid) return;
    grid.innerHTML = Object.entries(TOPICS).map(([key, t]) => {
        const count = posts.filter(p => p.topic === key).length;
        const word = count === 1 ? 'запись' : (count >= 2 && count < 5 ? 'записи' : 'записей');
        return `
            <div class="topic-card" data-filter="${key}">
                <span class="topic-card__icon">${t.icon}</span>
                <h3 class="topic-card__title">${t.name}</h3>
                <span class="topic-card__count">${count} ${word}</span>
            </div>
        `;
    }).join('');
}

function updateStats() {
    document.getElementById('statPosts').textContent = posts.length;
    const usedTopics = new Set(posts.map(p => p.topic));
    document.getElementById('statTopics').textContent = usedTopics.size;
    const usedLangs = new Set(posts.filter(p => p.topic === 'programming').map(p => p.lang));
    document.getElementById('statLangs').textContent = usedLangs.size;
}

function rebuildFilterOptions() {
    let html = '<option value="all">Все записи</option>';
    html += '<optgroup label="Категории">';
    Object.entries(TOPICS).forEach(([key, t]) => {
        html += `<option value="topic:${key}">${t.icon} ${t.name}</option>`;
    });
    html += '</optgroup>';
    html += '<optgroup label="Языки">';
    Object.entries(PROGRAMMING_LANGS).forEach(([key, l]) => {
        html += `<option value="lang:${key}">${l.icon} ${l.name}</option>`;
    });
    html += '</optgroup>';
    filterSelect.innerHTML = html;
}

function getPostTopic(post) {
    return TOPICS[post.topic] || TOPICS.programming;
}

function getPostLangLabel(post) {
    if (post.topic === 'programming' && PROGRAMMING_LANGS[post.lang]) {
        const l = PROGRAMMING_LANGS[post.lang];
        return `${l.icon} ${l.name}`;
    }
    return '';
}

// ГЛАВНАЯ ФУНКЦИЯ ОТРИСОВКИ ПОСТОВ
function renderPosts() {
    let filtered = [...posts];

    // Фильтрация
    if (currentFilter !== 'all') {
        const [type, value] = currentFilter.split(':');
        if (type === 'topic') {
            filtered = filtered.filter(p => p.topic === value);
        } else if (type === 'lang') {
            filtered = filtered.filter(p => p.topic === 'programming' && p.lang === value);
        }
    }

    // Сортировка
    filtered.sort((a, b) => currentSort === 'new' ? b.date - a.date : a.date - b.date);

    if (filtered.length === 0) {
        postsGrid.style.display = 'none';
        postsEmpty.style.display = 'block';
        return;
    }
    postsGrid.style.display = 'grid';
    postsEmpty.style.display = 'none';

    postsGrid.innerHTML = filtered.map(post => {
        const topic = getPostTopic(post);
        const langLabel = getPostLangLabel(post);
        
        // ПРОВЕРКА ПРАВ НА УДАЛЕНИЕ
        // Удалять можно если:
        // 1. Пользователь залогинен
        // 2. И (Он автор записи ИЛИ Он админ)
        const canDelete = currentUser && (currentUser.id === post.authorId || currentUser.isAdmin);
        
        const deleteButton = canDelete 
            ? `<button class="post-card__delete" data-delete="${post.id}" title="Удалить запись">✕</button>` 
            : '';

        const imageBlock = post.image ? `
            <div class="post-card__image"><img src="${post.image}" alt="${escapeHtml(post.title)}" loading="lazy"></div>
        ` : '';
        
        const langBadge = langLabel
            ? `<span class="post-card__lang">${langLabel}</span>`
            : '';

        return `
            <div class="post-card" data-id="${post.id}">
                <div class="post-card__header">
                    <span class="post-card__topic">${topic.icon} ${topic.name}</span>
                    ${deleteButton}
                </div>
                ${imageBlock}
                <h3 class="post-card__title">${escapeHtml(post.title)}</h3>
                <p class="post-card__excerpt">${escapeHtml(post.excerpt)}</p>
                <div class="post-card__footer">
                    <span class="post-card__author">${escapeHtml(post.author)}</span>
                    <span>${formatDate(post.date)}</span>
                </div>
                ${langBadge}
            </div>
        `;
    }).join('');
}

// ================================
// 8. ПРОСМОТР ЗАПИСИ
// ================================
function openPostView(id) {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    const topic = getPostTopic(post);
    const langLabel = getPostLangLabel(post);

    const imageBlock = post.image
        ? `<img src="${post.image}" class="view-image" alt="${escapeHtml(post.title)}">`
        : '';

    let codeBlock = '';
    if (post.code) {
        let prismLang = post.lang;
        if (post.topic === 'programming' && PROGRAMMING_LANGS[post.lang]) {
            prismLang = PROGRAMMING_LANGS[post.lang].prism;
        }
        if (post.topic === 'sysadmin' && (!post.lang || post.lang === 'none')) {
            prismLang = 'bash';
        }
        
        if (prismLang && prismLang !== 'none') {
            codeBlock = `
                <div class="view-code-wrap">
                    <div class="view-code-header">
                        <span>${LANG_NAMES[prismLang] || LANG_NAMES[post.lang] || 'Code'}</span>
                        <button class="view-code-copy" data-copy>Копировать</button>
                    </div>
                    <pre class="view-code"><code class="language-${prismLang}">${escapeHtml(post.code)}</code></pre>
                </div>
            `;
        }
    }

    const langBadge = langLabel
        ? `<span class="view-lang-badge">${langLabel}</span>`
        : '';

    document.getElementById('viewBody').innerHTML = `
        <span class="view-topic">${topic.icon} ${topic.name}</span>
        ${langBadge}
        <h2 class="view-title">${escapeHtml(post.title)}</h2>
        <div class="view-meta">
            <span class="view-meta__author">${escapeHtml(post.author)}</span>
            <span>${new Date(post.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
        ${imageBlock}
        <p class="view-excerpt">${escapeHtml(post.excerpt)}</p>
        ${post.content ? `<div class="view-content">${escapeHtml(post.content)}</div>` : ''}
        ${codeBlock}
    `;
    openModal(viewModal);
    if (typeof Prism !== 'undefined') {
        Prism.highlightAllUnder(viewModal);
    }
}

// ================================
// 9. ОБРАБОТЧИКИ СОБЫТИЙ
// ================================

// Закрытие модалок
document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.closest('.modal')));
});
document.querySelectorAll('.modal__overlay').forEach(overlay => {
    overlay.addEventListener('click', () => closeModal(overlay.closest('.modal')));
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(m => closeModal(m));
    }
});

// Открытие модалки создания
function openCreateModal() {
    if (!currentUser) {
        showToast('Сначала войдите в систему!');
        openModal(authModal);
        return;
    }
    updateLangVisibility();
    openModal(createModal);
}

document.getElementById('createBtn').addEventListener('click', openCreateModal);
document.getElementById('heroCreateBtn').addEventListener('click', openCreateModal);
document.getElementById('emptyCreateBtn').addEventListener('click', openCreateModal);

// Создание поста
createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const imageUrl = document.getElementById('postImageUrl').value.trim();
    const topic = postTopicSelect.value;
    const lang = topic === 'programming' ? postLangSelect.value : 'none';

    const newPost = {
        id: Date.now(),
        title: document.getElementById('postTitle').value.trim(),
        excerpt: document.getElementById('postExcerpt').value.trim(),
        topic: topic,
        lang: lang,
        content: document.getElementById('postContent').value.trim(),
        code: document.getElementById('postCode').value,
        author: currentUser.username,
        authorId: currentUser.id, // Привязываем к ID текущего юзера
        image: imageUrl || null,
        date: Date.now()
    };

    posts.unshift(newPost);
    savePosts();
    renderPosts();
    renderTopicsGrid();
    updateStats();
    createForm.reset();
    clearImagePreview();
    updateLangVisibility();
    closeModal(createModal);
    showToast('Запись опубликована');
    document.getElementById('posts').scrollIntoView({ behavior: 'smooth' });
});

// Клик по карточке или кнопке удаления
postsGrid.addEventListener('click', (e) => {
    // Удаление
    const deleteBtn = e.target.closest('[data-delete]');
    if (deleteBtn) {
        e.stopPropagation();
        const id = Number(deleteBtn.dataset.delete);
        
        // Дополнительная проверка на стороне клиента (хотя мы уже скрыли кнопку)
        const post = posts.find(p => p.id === id);
        if (post && (currentUser.id === post.authorId || currentUser.isAdmin)) {
            if (confirm('Удалить эту запись?')) {
                posts = posts.filter(p => p.id !== id);
                savePosts();
                renderPosts();
                renderTopicsGrid();
                updateStats();
                showToast('Запись удалена');
            }
        } else {
            showToast('Ошибка прав доступа');
        }
        return;
    }
    
    // Просмотр
    const card = e.target.closest('.post-card');
    if (card) openPostView(Number(card.dataset.id));
});

// Копирование кода
document.getElementById('viewBody').addEventListener('click', (e) => {
    if (e.target.dataset.copy !== undefined) {
        const code = document.querySelector('.view-code code').textContent;
        navigator.clipboard.writeText(code).then(() => {
            e.target.textContent = '✓ Скопировано';
            setTimeout(() => e.target.textContent = 'Копировать', 2000);
        });
    }
});

// Фильтры и сортировка
filterSelect.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    renderPosts();
});
sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderPosts();
});

// Клик по темам
document.addEventListener('click', (e) => {
    const card = e.target.closest('.topic-card');
    if (!card) return;
    const key = card.dataset.filter;
    if (!TOPICS[key]) return;
    currentFilter = `topic:${key}`;
    filterSelect.value = currentFilter;
    renderPosts();
    document.getElementById('posts').scrollIntoView({ behavior: 'smooth' });
});

// Поиск
document.getElementById('searchBtn').addEventListener('click', () => {
    openModal(searchModal);
    setTimeout(() => searchInput.focus(), 100);
});
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) { searchResults.innerHTML = ''; return; }
    const found = posts.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.excerpt.toLowerCase().includes(query) ||
        p.content.toLowerCase().includes(query) ||
        (p.code && p.code.toLowerCase().includes(query))
    );
    if (found.length === 0) {
        searchResults.innerHTML = '<p style="text-align:center; color:var(--text-dim)">Ничего не найдено</p>';
        return;
    }
    searchResults.innerHTML = found.map(p => {
        const topic = getPostTopic(p);
        return `
            <div class="search-result-item" data-search-id="${p.id}">
                <div class="search-result-item__topic">${topic.icon} ${topic.name}</div>
                <h4>${escapeHtml(p.title)}</h4>
                <p>${escapeHtml(p.excerpt)}</p>
            </div>
        `;
    }).join('');
});
searchResults.addEventListener('click', (e) => {
    const item = e.target.closest('.search-result-item');
    if (!item) return;
    closeModal(searchModal);
    searchInput.value = '';
    searchResults.innerHTML = '';
    openPostView(Number(item.dataset.searchId));
});

// Навигация
function handleMenuClick(e, text) {
    e.preventDefault();
    if (text === 'Авторы') openModal(comingSoonModal);
    else if (text === 'О проекте') openModal(aboutModal);
}
document.getElementById('navAuthors').addEventListener('click', (e) => handleMenuClick(e, 'Авторы'));
document.getElementById('navAbout').addEventListener('click', (e) => handleMenuClick(e, 'О проекте'));

// Мобильное меню
document.getElementById('burger').addEventListener('click', () => {
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
});
document.getElementById('mobileMenuClose').addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
});
mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ================================
// 10. ИНИЦИАЛИЗАЦИЯ
// ================================
function init() {
    // Загрузка постов
    const saved = localStorage.getItem('devspace_posts');
    if (saved) {
        posts = JSON.parse(saved);
    } else {
        posts = DEMO_POSTS;
        savePosts();
    }

    // Загрузка пользователя
    const savedUser = localStorage.getItem('devspace_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }

    rebuildFilterOptions();
    renderUserArea();
    renderTopicsGrid();
    renderPosts();
    updateStats();
    updateLangVisibility();
}

init();







// ================================
// 1. ДАННЫЕ И КОНСТАНТЫ
// ================================
/*const TOPICS = {
    programming:   { name: 'Программирование',           icon: '💻' },
    networks:      { name: 'Компьютерные сети',          icon: '🌍' },
    blockchain:    { name: 'Блокчейн',                   icon: '⛓️' },
    security:      { name: 'Кибербезопасность',          icon: '🛡️' },
    video_editing: { name: 'Монтаж',                     icon: '🎬' },
    modeling_3d:   { name: '3D-моделирование',           icon: '🎨' },
    sysadmin:      { name: 'Системное администрирование', icon: '🖥️' }
};

// Языки/технологии, относящиеся к категории "Программирование"
const PROGRAMMING_LANGS = {
    python:     { name: 'Python',     icon: '🐍',  prism: 'python' },
    sql:        { name: 'SQL',        icon: '🗄️',  prism: 'sql' },
    csharp:     { name: 'C#',         icon: '⚡',  prism: 'csharp' },
    cpp:        { name: 'C++',        icon: '⚙️',  prism: 'cpp' },
    java:       { name: 'Java',       icon: '☕',  prism: 'java' },
    javascript: { name: 'JavaScript', icon: '🟨',  prism: 'javascript' },
    kotlin:     { name: 'Kotlin',     icon: '🟪',  prism: 'kotlin' },
    go:         { name: 'GO',         icon: '🐹',  prism: 'go' },
    html:       { name: 'HTML',       icon: '🌐',  prism: 'markup' },
    css:        { name: 'CSS',        icon: '🎨',  prism: 'css' }
};

// Подписи языков для подсветки кода
const LANG_NAMES = {
    none: '', markup: 'HTML', css: 'CSS', bash: 'Bash', powershell: 'PowerShell',
    ...Object.fromEntries(Object.entries(PROGRAMMING_LANGS).map(([k, v]) => [k, v.name]))
};

const DEMO_POSTS = [
    {
        id: 1,
        title: 'Основы Python для начинающих',
        excerpt: 'Синтаксис, переменные и базовые конструкции Python',
        topic: 'programming',
        lang: 'python',
        content: 'Python — высокоуровневый язык с простым синтаксисом. Идеально подходит для начинающих разработчиков.',
        code: `# Пример кода на Python
def greet(name):
    return f"Привет, {name}!"

print(greet("Мир"))`,
        author: 'Алексей',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
        date: Date.now() - 86400000
    },
    {
        id: 2,
        title: 'SQL: выборка с JOIN',
        excerpt: 'Соединяем таблицы для получения связанных данных',
        topic: 'programming',
        lang: 'sql',
        content: 'JOIN позволяет объединять данные из нескольких таблиц по связанному полю.',
        code: `SELECT
    users.name,
    orders.id AS order_id,
    orders.total
FROM users
INNER JOIN orders ON users.id = orders.user_id
WHERE orders.total > 1000
ORDER BY orders.total DESC
LIMIT 10;`,
        author: 'Иван',
        image: null,
        date: Date.now() - 172800000
    },
    {
        id: 3,
        title: 'Hello World на C#',
        excerpt: 'Первая программа на C# в .NET',
        topic: 'programming',
        lang: 'csharp',
        content: 'C# — современный объектно-ориентированный язык от Microsoft.',
        code: `using System;

namespace HelloWorld
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello, World!");
        }
    }
}`,
        author: 'Сергей',
        image: null,
        date: Date.now() - 200000000
    },
    {
        id: 4,
        title: 'TCP/IP: три рукопожатия',
        excerpt: 'Как устанавливается надёжное соединение между клиентом и сервером',
        topic: 'networks',
        lang: 'none',
        content: 'TCP (Transmission Control Protocol) обеспечивает надёжную доставку данных.\n\n1. Клиент отправляет SYN-пакет серверу\n2. Сервер отвечает SYN-ACK\n3. Клиент подтверждает ACK\n\nПосле этого соединение установлено.',
        code: '',
        author: 'Дмитрий',
        image: null,
        date: Date.now() - 259200000
    },
    {
        id: 5,
        title: 'Что такое блокчейн простыми словами',
        excerpt: 'Распределённый реестр, хеши и консенсус',
        topic: 'blockchain',
        lang: 'none',
        content: 'Блокчейн — это цепочка блоков, где каждый следующий блок содержит хеш предыдущего. Это обеспечивает неизменность данных.',
        code: '',
        author: 'Ольга',
        image: null,
        date: Date.now() - 300000000
    },
    {
        id: 6,
        title: 'Основы кибербезопасности',
        excerpt: 'Защита данных и безопасность в интернете',
        topic: 'security',
        lang: 'none',
        content: 'Кибербезопасность включает практики защиты систем, сетей и программ от цифровых атак.',
        code: '',
        author: 'Мария',
        image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
        date: Date.now() - 345600000
    },
    {
        id: 7,
        title: 'Семантическая вёрстка на HTML5',
        excerpt: 'Используем правильные теги: header, main, section, article',
        topic: 'programming',
        lang: 'html',
        content: 'Семантические теги помогают поисковикам и скринридерам лучше понимать структуру страницы.',
        code: `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Мой сайт</title>
</head>
<body>
    <header>
        <h1>Добро пожаловать</h1>
        <nav>
            <a href="#about">О нас</a>
            <a href="#contact">Контакты</a>
        </nav>
    </header>
    <main>
        <section id="about">
            <h2>О нас</h2>
            <p>Мы создаём качественные сайты.</p>
        </section>
    </main>
</body>
</html>`,
        author: 'Анна',
        image: null,
        date: Date.now() - 400000000
    },
    {
        id: 8,
        title: 'Flexbox: выравнивание по центру',
        excerpt: 'Современный способ центрировать элементы на странице',
        topic: 'programming',
        lang: 'css',
        content: 'Flexbox — мощный инструмент для построения гибких макетов. С его помощью центрирование стало тривиальной задачей.',
        code: `.container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: #0a0a0f;
}

.card {
    padding: 32px;
    background: #12121a;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}`,
        author: 'Никита',
        image: null,
        date: Date.now() - 450000000
    },
    {
        id: 9,
        title: 'Linux: основные команды для администратора',
        excerpt: 'ls, cd, chmod, grep, systemctl — что должен знать каждый сисадмин',
        topic: 'sysadmin',
        lang: 'bash',
        content: 'Linux — основа серверной инфраструктуры. Знание командной строки обязательно для любого системного администратора.',
        code: `# Информация о системе
uname -a
df -h
free -m

# Работа с пользователями
sudo useradd -m -s /bin/bash newuser
sudo passwd newuser
sudo usermod -aG sudo newuser

# Управление службами
sudo systemctl status nginx
sudo systemctl restart sshd
sudo systemctl enable docker

# Поиск по логам
sudo grep "ERROR" /var/log/syslog | tail -n 20`,
        author: 'Константин',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
        date: Date.now() - 500000000
    }
];

// ================================
// 2. СОСТОЯНИЕ
// ================================
let posts = [];
let currentFilter = 'all';        // 'all' | 'topic:...' | 'lang:...'
let currentSort = 'new';

// ================================
// 3. DOM-ЭЛЕМЕНТЫ
// ================================
const postsGrid        = document.getElementById('postsGrid');
const postsEmpty       = document.getElementById('postsEmpty');
const filterSelect     = document.getElementById('filterSelect');
const sortSelect       = document.getElementById('sortSelect');
const createModal      = document.getElementById('createModal');
const viewModal        = document.getElementById('viewModal');
const searchModal      = document.getElementById('searchModal');
const comingSoonModal  = document.getElementById('comingSoonModal');
const aboutModal       = document.getElementById('aboutModal');
const searchInput      = document.getElementById('searchInput');
const searchResults    = document.getElementById('searchResults');
const toastContainer   = document.getElementById('toastContainer');
const createForm       = document.getElementById('createForm');
const mobileMenu       = document.getElementById('mobileMenu');
const postImageUrl     = document.getElementById('postImageUrl');
const postImageFile    = document.getElementById('postImageFile');
const clearImageBtn    = document.getElementById('clearImageBtn');
const imagePreview     = document.getElementById('imagePreview');
const postTopicSelect  = document.getElementById('postTopic');
const postLangGroup    = document.getElementById('postLangGroup');
const postLangSelect   = document.getElementById('postLang');

// ================================
// 4. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================
function savePosts() {
    localStorage.setItem('devspace_posts', JSON.stringify(posts));
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days < 7) return `${days} дн назад`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function getPostTopic(post) {
    return TOPICS[post.topic] || TOPICS.programming;
}

function getPostLangLabel(post) {
    if (post.topic === 'programming' && PROGRAMMING_LANGS[post.lang]) {
        const l = PROGRAMMING_LANGS[post.lang];
        return `${l.icon} ${l.name}`;
    }
    return '';
}

// ================================
// 5. РАБОТА С КАРТИНКАМИ
// ================================
function showImagePreview(src) {
    const img = imagePreview.querySelector('img');
    img.src = src;
    imagePreview.classList.add('has-image');
}

function clearImagePreview() {
    const img = imagePreview.querySelector('img');
    img.src = '';
    imagePreview.classList.remove('has-image');
    postImageUrl.value = '';
    postImageFile.value = '';
}

postImageUrl.addEventListener('input', (e) => {
    const url = e.target.value.trim();
    if (url) showImagePreview(url);
    else clearImagePreview();
});

postImageFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        showToast('Выберите изображение');
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        showToast('Файл слишком большой (макс. 5 МБ)');
        return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
        const base64 = event.target.result;
        postImageUrl.value = base64;
        showImagePreview(base64);
    };
    reader.readAsDataURL(file);
});

clearImageBtn.addEventListener('click', clearImagePreview);

// ================================
// 5.1. ЛОГИКА ФОРМЫ: показ выбора языка
// ================================
function updateLangVisibility() {
    const topic = postTopicSelect.value;
    if (topic === 'programming') {
        postLangGroup.style.display = '';
        postLangSelect.required = true;
    } else {
        postLangGroup.style.display = 'none';
        postLangSelect.required = false;
        postLangSelect.value = 'none';
    }
}
postTopicSelect.addEventListener('change', updateLangVisibility);

// ================================
// 6. РЕНДЕР И СТАТИСТИКА
// ================================
function renderTopicsGrid() {
    const grid = document.getElementById('topicsGrid');
    if (!grid) return;
    grid.innerHTML = Object.entries(TOPICS).map(([key, t]) => {
        const count = posts.filter(p => p.topic === key).length;
        const word = count === 1 ? 'запись' : (count >= 2 && count <= 4 ? 'записи' : 'записей');
        return `
            <div class="topic-card" data-filter="${key}">
                <span class="topic-card__icon">${t.icon}</span>
                <h3 class="topic-card__title">${t.name}</h3>
                <span class="topic-card__count" data-count="${key}">${count} ${word}</span>
            </div>
        `;
    }).join('');
}

function updateStats() {
    document.getElementById('statPosts').textContent = posts.length;
    const usedTopics = new Set(posts.map(p => p.topic));
    document.getElementById('statTopics').textContent = usedTopics.size;
    const usedLangs = new Set(posts.filter(p => p.topic === 'programming').map(p => p.lang));
    document.getElementById('statLangs').textContent = usedLangs.size;

    Object.keys(TOPICS).forEach(key => {
        const count = posts.filter(p => p.topic === key).length;
        const el = document.querySelector(`[data-count="${key}"]`);
        if (el) {
            const word = count === 1 ? 'запись' : (count >= 2 && count <= 4 ? 'записи' : 'записей');
            el.textContent = `${count} ${word}`;
        }
    });
}

function rebuildFilterOptions() {
    let html = '<option value="all">Все записи</option>';
    html += '<optgroup label="Категории">';
    Object.entries(TOPICS).forEach(([key, t]) => {
        html += `<option value="topic:${key}">${t.icon} ${t.name}</option>`;
    });
    html += '</optgroup>';
    html += '<optgroup label="Языки программирования">';
    Object.entries(PROGRAMMING_LANGS).forEach(([key, l]) => {
        html += `<option value="lang:${key}">${l.icon} ${l.name}</option>`;
    });
    html += '</optgroup>';
    filterSelect.innerHTML = html;
}

function renderPosts() {
    let filtered = [...posts];

    if (currentFilter !== 'all') {
        const [type, value] = currentFilter.split(':');
        if (type === 'topic') {
            filtered = filtered.filter(p => p.topic === value);
        } else if (type === 'lang') {
            filtered = filtered.filter(p => p.topic === 'programming' && p.lang === value);
        }
    }

    filtered.sort((a, b) => currentSort === 'new' ? b.date - a.date : a.date - b.date);

    if (filtered.length === 0) {
        postsGrid.style.display = 'none';
        postsEmpty.style.display = 'block';
        return;
    }
    postsGrid.style.display = 'grid';
    postsEmpty.style.display = 'none';

    postsGrid.innerHTML = filtered.map(post => {
        const topic = getPostTopic(post);
        const langLabel = getPostLangLabel(post);
        const imageBlock = post.image ? `
            <div class="post-card__image">
                <img src="${post.image}" alt="${escapeHtml(post.title)}">
            </div>
        ` : '';
        const langBadge = langLabel
            ? `<span class="post-card__lang">${langLabel}</span>`
            : '';

        return `
            <article class="post-card" data-id="${post.id}">
                <div class="post-card__header">
                    <span class="post-card__topic">${topic.icon} ${topic.name}</span>
                    <button class="post-card__delete" data-delete="${post.id}" title="Удалить">✕</button>
                </div>
                ${imageBlock}
                <h3 class="post-card__title">${escapeHtml(post.title)}</h3>
                <p class="post-card__excerpt">${escapeHtml(post.excerpt)}</p>
                <div class="post-card__footer">
                    <span class="post-card__author">${escapeHtml(post.author)}</span>
                    <span>${formatDate(post.date)}</span>
                </div>
                ${langBadge}
            </article>
        `;
    }).join('');
}

// ================================
// 7. ПРОСМОТР ЗАПИСИ
// ================================
function openPostView(id) {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    const topic = getPostTopic(post);
    const langLabel = getPostLangLabel(post);

    const imageBlock = post.image
        ? `<img src="${post.image}" alt="${escapeHtml(post.title)}" class="view-image">`
        : '';

    let codeBlock = '';
    if (post.code) {
        // Определяем язык подсветки
        let prismLang = post.lang;
        if (post.topic === 'programming' && PROGRAMMING_LANGS[post.lang]) {
            prismLang = PROGRAMMING_LANGS[post.lang].prism;
        }
        // Для sysadmin по умолчанию — bash
        if (post.topic === 'sysadmin' && (post.lang === 'none' || !post.lang)) {
            prismLang = 'bash';
        }
        if (prismLang && prismLang !== 'none') {
            codeBlock = `
                <div class="view-code-wrap">
                    <div class="view-code-header">
                        <span>${LANG_NAMES[prismLang] || LANG_NAMES[post.lang] || 'Code'}</span>
                        <button class="view-code-copy" data-copy>Копировать</button>
                    </div>
                    <pre class="view-code"><code class="language-${prismLang}">${escapeHtml(post.code)}</code></pre>
                </div>
            `;
        }
    }

    const langBadge = langLabel
        ? `<span class="view-lang-badge">${langLabel}</span>`
        : '';

    document.getElementById('viewBody').innerHTML = `
        <span class="view-topic">${topic.icon} ${topic.name}</span>
        ${langBadge}
        <h2 class="view-title">${escapeHtml(post.title)}</h2>
        <div class="view-meta">
            <span class="view-meta__author">${escapeHtml(post.author)}</span>
            <span>${new Date(post.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
        ${imageBlock}
        <p class="view-excerpt">${escapeHtml(post.excerpt)}</p>
        ${post.content ? `<div class="view-content">${escapeHtml(post.content)}</div>` : ''}
        ${codeBlock}
    `;
    openModal(viewModal);
    if (typeof Prism !== 'undefined') {
        Prism.highlightAllUnder(viewModal);
    }
}

// ================================
// 8. ОБРАБОТЧИКИ СОБЫТИЙ
// ================================
document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.closest('.modal')));
});
document.querySelectorAll('.modal__overlay').forEach(overlay => {
    overlay.addEventListener('click', () => closeModal(overlay.closest('.modal')));
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(m => closeModal(m));
    }
});

document.getElementById('createBtn').addEventListener('click', () => {
    updateLangVisibility();
    openModal(createModal);
});
document.getElementById('heroCreateBtn').addEventListener('click', () => {
    updateLangVisibility();
    openModal(createModal);
});
document.getElementById('emptyCreateBtn').addEventListener('click', () => {
    updateLangVisibility();
    openModal(createModal);
});

createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const imageUrl = document.getElementById('postImageUrl').value.trim();
    const topic = postTopicSelect.value;
    const lang = topic === 'programming' ? postLangSelect.value : 'none';

    const newPost = {
        id: Date.now(),
        title: document.getElementById('postTitle').value.trim(),
        excerpt: document.getElementById('postExcerpt').value.trim(),
        topic: topic,
        lang: lang,
        content: document.getElementById('postContent').value.trim(),
        code: document.getElementById('postCode').value,
        author: document.getElementById('postAuthor').value.trim(),
        image: imageUrl || null,
        date: Date.now()
    };

    posts.unshift(newPost);
    savePosts();
    renderPosts();
    renderTopicsGrid();
    updateStats();
    createForm.reset();
    clearImagePreview();
    updateLangVisibility();
    closeModal(createModal);
    showToast('Запись опубликована');
    document.getElementById('posts').scrollIntoView({ behavior: 'smooth' });
});

postsGrid.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('[data-delete]');
    if (deleteBtn) {
        e.stopPropagation();
        const id = Number(deleteBtn.dataset.delete);
        if (confirm('Удалить эту запись?')) {
            posts = posts.filter(p => p.id !== id);
            savePosts();
            renderPosts();
            renderTopicsGrid();
            updateStats();
            showToast('Запись удалена');
        }
        return;
    }
    const card = e.target.closest('.post-card');
    if (card) openPostView(Number(card.dataset.id));
});

document.getElementById('viewBody').addEventListener('click', (e) => {
    if (e.target.dataset.copy !== undefined) {
        const code = document.querySelector('.view-code code').textContent;
        navigator.clipboard.writeText(code).then(() => {
            e.target.textContent = '✓ Скопировано';
            setTimeout(() => e.target.textContent = 'Копировать', 2000);
        });
    }
});

filterSelect.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    renderPosts();
});
sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderPosts();
});

document.addEventListener('click', (e) => {
    const card = e.target.closest('.topic-card');
    if (!card) return;
    const key = card.dataset.filter;
    if (!TOPICS[key]) return;
    currentFilter = `topic:${key}`;
    filterSelect.value = currentFilter;
    renderPosts();
    document.getElementById('posts').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('searchBtn').addEventListener('click', () => {
    openModal(searchModal);
    setTimeout(() => searchInput.focus(), 100);
});
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) { searchResults.innerHTML = ''; return; }
    const found = posts.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.excerpt.toLowerCase().includes(query) ||
        p.content.toLowerCase().includes(query) ||
        (p.code && p.code.toLowerCase().includes(query))
    );
    if (found.length === 0) {
        searchResults.innerHTML = '<p style="color: var(--text-dim); text-align: center;">Ничего не найдено</p>';
        return;
    }
    searchResults.innerHTML = found.map(p => {
        const topic = getPostTopic(p);
        const langLabel = getPostLangLabel(p);
        const sub = langLabel ? ` · ${langLabel}` : '';
        return `
            <div class="search-result-item" data-search-id="${p.id}">
                <span class="search-result-item__topic">${topic.icon} ${topic.name}${sub}</span>
                <h4>${escapeHtml(p.title)}</h4>
                <p>${escapeHtml(p.excerpt)}</p>
            </div>
        `;
    }).join('');
});
searchResults.addEventListener('click', (e) => {
    const item = e.target.closest('.search-result-item');
    if (!item) return;
    closeModal(searchModal);
    searchInput.value = '';
    searchResults.innerHTML = '';
    openPostView(Number(item.dataset.searchId));
});

function handleMenuClick(e) {
    e.preventDefault();
    const text = e.currentTarget.textContent.trim();
    if (text === 'Авторы') openModal(comingSoonModal);
    else if (text === 'О проекте') openModal(aboutModal);
}
document.querySelectorAll('.nav__link').forEach(link => {
    const text = link.textContent.trim();
    if (text === 'Авторы' || text === 'О проекте') link.addEventListener('click', handleMenuClick);
});
document.querySelectorAll('.mobile-menu__nav a').forEach(link => {
    const text = link.textContent.trim();
    if (text === 'Авторы' || text === 'О проекте') link.addEventListener('click', handleMenuClick);
});

document.getElementById('burger').addEventListener('click', () => {
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
});
document.getElementById('mobileMenuClose').addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
});
mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ================================
// 9. ИНИЦИАЛИЗАЦИЯ
// ================================
function init() {
    const saved = localStorage.getItem('devspace_posts');
    if (saved) {
        // Миграция старых постов
        posts = JSON.parse(saved).map(p => {
            // Старые отдельные темы → programming
            if (['django', 'crypto'].includes(p.topic)) {
                return { ...p, topic: 'programming', lang: p.lang || 'python' };
            }
            // Старые html/css темы → programming с соответствующим lang
            if (p.topic === 'html') return { ...p, topic: 'programming', lang: 'html' };
            if (p.topic === 'css') return { ...p, topic: 'programming', lang: 'css' };
            return p;
        });
        savePosts();
    } else {
        posts = DEMO_POSTS;
        savePosts();
    }
    rebuildFilterOptions();
    renderTopicsGrid();
    renderPosts();
    updateStats();
    updateLangVisibility();
}
init();*/