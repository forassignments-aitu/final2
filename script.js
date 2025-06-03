document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const articlesContainer = document.getElementById('articles-container');
    const mostPopular = document.getElementById('most-popular');
    const categoriesList = document.getElementById('categories-list');
    const themeToggle = document.getElementById('theme-toggle');
    const sortByDateBtn = document.getElementById('sort-by-date');
    const sortByViewsBtn = document.getElementById('sort-by-views');

    let articles = [];
    let categories = new Set();

    // Initialize theme
    initTheme();

    // Event Listeners
    themeToggle.addEventListener('click', toggleTheme);
    sortByDateBtn.addEventListener('click', () => sortArticles('date'));
    sortByViewsBtn.addEventListener('click', () => sortArticles('views'));

    // Load articles
    loadArticles();

    // Functions
    function loadArticles() {
        fetch('Articles.json')
            .then(response => response.json())
            .then(data => {
                articles = data.articles;
                processArticles();
                displayArticles(articles);
                updateMostPopular();
                updateCategories();
            })
            .catch(error => console.error('Error loading articles:', error));
    }

    function processArticles() {
        // Extract unique categories
        articles.forEach(article => {
            categories.add(article.category);
            article.readingTime = Math.ceil(article.wordCount / 200);
        });
    }

    function displayArticles(articlesToShow) {
        articlesContainer.innerHTML = '';

        articlesToShow.forEach(article => {
            const card = document.createElement('div');
            card.className = 'col';
            card.innerHTML = `
                <div class="card h-100" data-id="${article.id}">
                    <div class="card-body">
                        <span class="badge bg-primary float-end">${article.category}</span>
                        <h5 class="card-title">${article.title}</h5>
                        <p class="card-text text-muted">
                            ${formatDate(article.date)} | 
                            ${article.views} views | 
                            ${article.readingTime} min read
                        </p>
                        <button class="btn btn-sm btn-outline-primary read-more">Read More</button>
                    </div>
                </div>
            `;
            articlesContainer.appendChild(card);
        });

        // Add event listeners to new cards
        document.querySelectorAll('.read-more').forEach(button => {
            button.addEventListener('click', function() {
                const card = this.closest('.card');
                const articleId = parseInt(card.dataset.id);
                openArticleModal(articleId);
            });
        });
    }

    function updateMostPopular() {
        const popular = [...articles].sort((a, b) => b.views - a.views)[0];
        mostPopular.innerHTML = `
            <h5>${popular.title}</h5>
            <p class="text-muted">${formatDate(popular.date)} | ${popular.category}</p>
            <p>${popular.views} views | ${popular.readingTime} min read</p>
            <button class="btn btn-sm btn-outline-primary read-popular">Read Article</button>
        `;

        // Add event listener to popular article button
        document.querySelector('.read-popular')?.addEventListener('click', () => {
            openArticleModal(popular.id);
        });
    }

    function updateCategories() {
        categoriesList.innerHTML = '';
        categories.forEach(category => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                ${category}
                <span class="badge bg-primary rounded-pill">
                    ${articles.filter(a => a.category === category).length}
                </span>
            `;
            categoriesList.appendChild(li);
        });
    }

    function openArticleModal(articleId) {
        const article = articles.find(a => a.id === articleId);
        if (!article) return;

        // Update views count
        article.views += 1;

        // Update modal content
        document.getElementById('modal-title').textContent = article.title;
        document.getElementById('modal-date').textContent = formatDate(article.date);
        document.getElementById('modal-category').textContent = article.category;
        document.getElementById('modal-views').textContent = article.views;
        document.getElementById('modal-reading-time').textContent = article.readingTime;
        document.getElementById('modal-content').textContent = article.content;

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('articleModal'));
        modal.show();

        // Update UI
        updateArticleCard(articleId);
        updateMostPopular();
    }

    function updateArticleCard(articleId) {
        const article = articles.find(a => a.id === articleId);
        const card = document.querySelector(`.card[data-id="${articleId}"]`);
        if (card) {
            card.querySelector('.card-text').innerHTML = `
                ${formatDate(article.date)} | 
                ${article.views} views | 
                ${article.readingTime} min read
            `;
        }
    }

    function sortArticles(criteria) {
        const sorted = [...articles];
        if (criteria === 'date') {
            sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (criteria === 'views') {
            sorted.sort((a, b) => b.views - a.views);
        }
        displayArticles(sorted);
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.classList.toggle('dark-theme', savedTheme === 'dark');
    }

    function toggleTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
});