class URLOrganizer {
    constructor() {
        this.savedUrls = [];
        this.categories = this.getDefaultCategories();
        this.initializeEventListeners();
        this.loadSavedData();
    }

    initializeEventListeners() {
        document.getElementById('saveUrl').addEventListener('click', () => this.saveUrl());
        document.getElementById('getCurrentUrl').addEventListener('click', () => this.getCurrentPageUrl());
        
        document.getElementById('searchInput').addEventListener('input', (e) => this.filterUrls(e.target.value));
        document.getElementById('filterCategory').addEventListener('change', (e) => this.filterByCategory(e.target.value));
        
        document.getElementById('addCategory').addEventListener('click', () => this.showCategoryModal());
        document.getElementById('confirmCategory').addEventListener('click', () => this.addNewCategory());
        document.getElementById('cancelCategory').addEventListener('click', () => this.hideCategoryModal());
        document.getElementById('closeModal').addEventListener('click', () => this.hideCategoryModal());
        
        document.getElementById('exportUrls').addEventListener('click', () => this.exportUrls());
        document.getElementById('clearAll').addEventListener('click', () => this.clearAllUrls());
        document.getElementById('urlInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveUrl();
        });
        document.getElementById('newCategoryInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addNewCategory();
        });

        document.getElementById('categoryModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.hideCategoryModal();
            }
        });
        document.getElementById('urlsList').addEventListener('click', (e) => {
            const urlItem = e.target.closest('.url-item');
            if (!urlItem) return;

            const urlId = parseInt(urlItem.dataset.urlId);
            const urlData = this.savedUrls.find(url => url.id === urlId);
            if (!urlData) return;

            if (e.target.closest('.copy-btn')) {
                e.preventDefault();
                this.copyUrl(urlData.url);
            }
            else if (e.target.closest('.delete-btn')) {
                e.preventDefault();
                this.deleteUrl(urlId);
            }
            else if (e.target.closest('.url-link')) {
                e.preventDefault();
                this.openUrl(urlId, urlData.url);
            }
        });
    }

    async loadSavedData() {
        try {
            const result = await chrome.storage.local.get(['savedUrls', 'categories']);
            this.savedUrls = result.savedUrls || [];
            this.categories = result.categories || this.getDefaultCategories();
            
            this.updateCategorySelects();
            this.displayUrls();
            this.updateStats();
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }

    getDefaultCategories() {
        return ['work', 'personal', 'research', 'entertainment', 'news', 'shopping', 'social', 'education', 'other'];
    }

    async getCurrentPageUrl() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab) {
                document.getElementById('urlInput').value = tab.url;
                document.getElementById('titleInput').value = tab.title || '';
                const urlInput = document.getElementById('urlInput');
                urlInput.style.borderColor = 'var(--accent-primary)';
                setTimeout(() => {
                    urlInput.style.borderColor = '';
                }, 1000);
            }
        } catch (error) {
            console.error('Error getting current page URL:', error);
            this.showNotification('Unable to get current page URL', 'error');
        }
    }

    validateUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            try {
                new URL('https://' + url);
                return 'https://' + url;
            } catch {
                return false;
            }
        }
    }

    async saveUrl() {
        const urlInput = document.getElementById('urlInput');
        const titleInput = document.getElementById('titleInput');
        const categorySelect = document.getElementById('categorySelect');
        
        let url = urlInput.value.trim();
        const title = titleInput.value.trim();
        const category = categorySelect.value;

        if (!url) {
            this.showNotification('Please enter a URL', 'error');
            urlInput.focus();
            return;
        }

        const validatedUrl = this.validateUrl(url);
        if (!validatedUrl) {
            this.showNotification('Please enter a valid URL', 'error');
            urlInput.focus();
            return;
        }
        
        if (typeof validatedUrl === 'string') {
            url = validatedUrl;
        }

        const exists = this.savedUrls.find(item => item.url === url);
        if (exists) {
            this.showNotification('URL already saved', 'warning');
            return;
        }

        const urlObject = {
            id: Date.now(),
            url: url,
            title: title || this.extractDomainFromUrl(url),
            category: category || 'other',
            dateAdded: new Date().toISOString(),
            dateAccessed: null,
            accessCount: 0
        };

        const saveBtn = document.getElementById('saveUrl');
        saveBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            saveBtn.style.transform = '';
        }, 150);

        this.savedUrls.unshift(urlObject);
        await this.saveToStorage();

        urlInput.value = '';
        titleInput.value = '';
        categorySelect.value = '';

        this.displayUrls();
        this.updateStats();
        this.showNotification('URL saved successfully!', 'success');
    }

    extractDomainFromUrl(url) {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return url;
        }
    }

    async deleteUrl(id) {
        if (confirm('Are you sure you want to delete this URL?')) {
            this.savedUrls = this.savedUrls.filter(url => url.id !== id);
            await this.saveToStorage();
            this.displayUrls();
            this.updateStats();
            this.showNotification('URL deleted', 'success');
        }
    }

    async openUrl(id, url) {
        const urlObject = this.savedUrls.find(item => item.id === id);
        if (urlObject) {
            urlObject.accessCount++;
            urlObject.dateAccessed = new Date().toISOString();
            await this.saveToStorage();
        }

        chrome.tabs.create({ url: url });
    }

    filterUrls(searchTerm) {
        const filteredUrls = this.savedUrls.filter(url => 
            url.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            url.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
            url.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.displayUrls(filteredUrls);
    }

    filterByCategory(category) {
        if (!category) {
            this.displayUrls();
            return;
        }
        const filteredUrls = this.savedUrls.filter(url => url.category === category);
        this.displayUrls(filteredUrls);
    }

    displayUrls(urls = this.savedUrls) {
        const urlsList = document.getElementById('urlsList');
        
        if (urls.length === 0) {
            urlsList.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons-round">bookmark_border</span>
                    <p>No URLs saved yet.<br>Start by adding your first URL!</p>
                </div>
            `;
            return;
        }

        urlsList.innerHTML = urls.map(url => this.createUrlItemHTML(url)).join('');
    }

    createUrlItemHTML(url) {
        const date = new Date(url.dateAdded).toLocaleDateString();
        const categoryColor = this.getCategoryColor(url.category);
        
        return `
            <div class="url-item" data-url-id="${url.id}">
                <div class="url-header">
                    <div class="url-info">
                        <div class="url-title">${this.escapeHtml(url.title)}</div>
                        <a href="#" class="url-link">${this.truncateUrl(url.url)}</a>
                    </div>
                    <div class="url-actions">
                        <button class="action-btn copy-btn" title="Copy URL">
                            <span class="material-icons-round">content_copy</span>
                        </button>
                        <button class="action-btn danger delete-btn" title="Delete">
                            <span class="material-icons-round">delete</span>
                        </button>
                    </div>
                </div>
                <div class="url-meta">
                    <span class="url-category" style="background-color: ${categoryColor}">${url.category}</span>
                    <span class="url-date">${date}</span>
                </div>
            </div>
        `;
    }

    getCategoryColor(category) {
        const colors = {
            work: '#3b82f6',
            personal: '#10b981',
            research: '#f59e0b',
            entertainment: '#ec4899',
            news: '#8b5cf6',
            shopping: '#ef4444',
            social: '#06b6d4',
            education: '#6366f1',
            other: '#6b7280'
        };
        return colors[category] || colors.other;
    }

    truncateUrl(url, maxLength = 45) {
        return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async copyUrl(url) {
        try {
            await navigator.clipboard.writeText(url);
            this.showNotification('URL copied to clipboard!', 'success');
        } catch (error) {
            console.error('Error copying URL:', error);
            this.showNotification('Failed to copy URL', 'error');
        }
    }

    showCategoryModal() {
        const modal = document.getElementById('categoryModal');
        modal.style.display = 'flex';
        document.getElementById('newCategoryInput').focus();
        document.body.style.overflow = 'hidden';
    }

    hideCategoryModal() {
        const modal = document.getElementById('categoryModal');
        modal.style.display = 'none';
        document.getElementById('newCategoryInput').value = '';
        document.body.style.overflow = '';
    }

    async addNewCategory() {
        const input = document.getElementById('newCategoryInput');
        const categoryName = input.value.trim().toLowerCase();

        if (!categoryName) {
            this.showNotification('Please enter a category name', 'error');
            input.focus();
            return;
        }

        if (this.categories.includes(categoryName)) {
            this.showNotification('Category already exists', 'warning');
            input.focus();
            return;
        }

        this.categories.push(categoryName);
        await this.saveToStorage();
        this.updateCategorySelects();
        this.hideCategoryModal();
        this.showNotification('Category added successfully!', 'success');
    }

    updateCategorySelects() {
        const categorySelect = document.getElementById('categorySelect');
        const filterSelect = document.getElementById('filterCategory');

        const currentValue = categorySelect.value;
        categorySelect.innerHTML = '<option value="">Choose category</option>' +
            this.categories.map(cat => `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`).join('');
        categorySelect.value = currentValue;

        const currentFilterValue = filterSelect.value;
        filterSelect.innerHTML = '<option value="">All</option>' +
            this.categories.map(cat => `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`).join('');
        filterSelect.value = currentFilterValue;
    }

    updateStats() {
        const totalUrls = this.savedUrls.length;
        const totalCategories = new Set(this.savedUrls.map(url => url.category)).size;
        
        document.getElementById('totalUrls').textContent = totalUrls;
        document.getElementById('totalCategories').textContent = totalCategories;
        
        const urlsCount = document.getElementById('urlsCount');
        if (urlsCount) {
            urlsCount.textContent = totalUrls;
        }
    }

    async exportUrls() {
        const dataStr = JSON.stringify(this.savedUrls, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `url-organizer-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showNotification('URLs exported successfully!', 'success');
    }

    async clearAllUrls() {
        if (confirm('Are you sure you want to delete all saved URLs? This action cannot be undone.')) {
            this.savedUrls = [];
            await this.saveToStorage();
            this.displayUrls();
            this.updateStats();
            this.showNotification('All URLs cleared', 'success');
        }
    }

    async saveToStorage() {
        try {
            await chrome.storage.local.set({
                savedUrls: this.savedUrls,
                categories: this.categories
            });
        } catch (error) {
            console.error('Error saving to storage:', error);
            this.showNotification('Error saving data', 'error');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const colors = {
            success: '#ffffff',
            error: '#cc0000',
            warning: '#ff8800',
            info: '#333333'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 16px;
            right: 16px;
            background: ${colors[type]};
            color: ${type === 'success' ? '#000000' : '#ffffff'};
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            z-index: 10001;
            border: 1px solid ${type === 'success' ? '#cccccc' : colors[type]};
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.2s ease;
            max-width: 250px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0) scale(1)';
        });
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%) scale(0.9)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

let urlOrganizer;
document.addEventListener('DOMContentLoaded', () => {
    urlOrganizer = new URLOrganizer();
});