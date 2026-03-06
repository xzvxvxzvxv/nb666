let currentCategory = 'all';
let currentSearch = '';
let updateHistory = JSON.parse(localStorage.getItem('recipeUpdateHistory') || '[]');

function addUpdateRecord(recipe) {
  const record = {
    id: recipe.id,
    name: recipe.name,
    category: recipe.category,
    categoryName: recipe.categoryName,
    time: new Date().toLocaleString('zh-CN'),
    timestamp: Date.now()
  };
  
  updateHistory.unshift(record);
  
  if (updateHistory.length > 50) {
    updateHistory = updateHistory.slice(0, 50);
  }
  
  localStorage.setItem('recipeUpdateHistory', JSON.stringify(updateHistory));
  updateNotificationBadge();
}

function updateNotificationBadge() {
  const badge = document.getElementById('notificationBadge');
  const lastVisit = parseInt(localStorage.getItem('lastVisitTimestamp') || '0');
  const newUpdates = updateHistory.filter(r => r.timestamp > lastVisit);
  badge.textContent = newUpdates.length > 0 ? newUpdates.length : '';
  badge.style.display = newUpdates.length > 0 ? 'block' : 'none';
}

function renderHistory() {
  const historyList = document.getElementById('historyList');
  
  if (updateHistory.length === 0) {
    historyList.innerHTML = `
      <div class="empty-history">
        <div class="empty-history-icon">📭</div>
        <p>暂无更新记录</p>
      </div>
    `;
    return;
  }
  
  historyList.innerHTML = updateHistory.map(record => {
    const categoryColors = {
      staple: '#ff9f43',
      vegetable: '#26de81',
      meat: '#ff6b6b',
      soup: '#45aaf2',
      snack: '#fd79a8',
      dessert: '#a29bfe',
      midnight: '#fdcb6e',
      spice: '#e17055'
    };
    
    return `
      <div class="history-item" onclick="showRecipeDetail(${record.id})">
        <div class="recipe-name">${record.name}</div>
        <span class="recipe-category" style="background: ${categoryColors[record.category]}">${record.categoryName}</span>
        <div class="update-time">🕐 ${record.time}</div>
      </div>
    `;
  }).join('');
}

function initHistoryModal() {
  const historyBtn = document.getElementById('historyBtn');
  const modal = document.getElementById('historyModal');
  const closeBtn = document.getElementById('closeModal');
  
  historyBtn.addEventListener('click', () => {
    modal.classList.add('active');
    renderHistory();
    localStorage.setItem('lastVisitTimestamp', Date.now().toString());
    updateNotificationBadge();
  });
  
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
  
  updateNotificationBadge();
}

function getDailyRecommend() {
  const today = new Date();
  const dateString = today.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));

  const stapleRecipes = recipes.filter(r => r.category === 'staple');
  const vegetableRecipes = recipes.filter(r => r.category === 'vegetable');
  const meatRecipes = recipes.filter(r => r.category === 'meat');
  const soupRecipes = recipes.filter(r => r.category === 'soup');

  const recommended = [
    stapleRecipes[dayOfYear % stapleRecipes.length],
    vegetableRecipes[dayOfYear % vegetableRecipes.length],
    meatRecipes[dayOfYear % meatRecipes.length],
    soupRecipes[dayOfYear % soupRecipes.length]
  ];

  return { date: dateString, recipes: recommended };
}

function renderDailyRecommend() {
  const { date, recipes: recommended } = getDailyRecommend();
  const container = document.getElementById('dailyRecommend');
  const dateEl = document.getElementById('recommendDate');

  dateEl.textContent = date;

  container.innerHTML = recommended.map(recipe => `
    <div class="recommend-card ${recipe.category}" onclick="showRecipeDetail(${recipe.id})">
      <span class="category-tag">${recipe.categoryName}</span>
      <h3>${recipe.name}</h3>
      <p>${recipe.description}</p>
    </div>
  `).join('');
}

function searchRecipes(searchText, category) {
  if (!searchText && category === 'all') {
    return recipes;
  }

  const searchLower = searchText.toLowerCase();
  
  return recipes.filter(recipe => {
    const matchCategory = category === 'all' || recipe.category === category;
    
    if (!searchText) {
      return matchCategory;
    }

    const matchName = recipe.name.toLowerCase().includes(searchLower);
    const matchDescription = recipe.description.toLowerCase().includes(searchLower);
    const matchIngredients = recipe.ingredients.some(ing => ing.toLowerCase().includes(searchLower));
    
    return matchCategory && (matchName || matchDescription || matchIngredients);
  });
}

function renderRecipeList(category = null, search = null) {
  if (category !== null) currentCategory = category;
  if (search !== null) currentSearch = search;
  
  const container = document.getElementById('recipeList');

  if (currentCategory === 'spice') {
    renderSpiceTable(container);
    return;
  }

  const filteredRecipes = searchRecipes(currentSearch, currentCategory);

  if (filteredRecipes.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <h3>未找到匹配的菜谱</h3>
        <p>试试其他关键词或分类</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredRecipes.map(recipe => `
    <div class="recipe-card" onclick="showRecipeDetail(${recipe.id})">
      <div class="card-content">
        <span class="card-category ${recipe.category}">${recipe.categoryName}</span>
        <h3>${recipe.name}</h3>
        <p class="card-desc">${recipe.description}</p>
        <div class="card-info">
          <span>⏱ ${recipe.time}</span>
          <span>📊 ${recipe.difficulty}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function renderSpiceTable(container) {
  let html = '<div class="spice-container">';

  spiceCategories.forEach(cat => {
    html += `
      <div class="spice-category">
        <div class="spice-category-header">
          <h3>${cat.name}</h3>
          <p>${cat.description}</p>
        </div>
        <div class="spice-table-wrapper">
          <table class="spice-table">
            <thead>
              <tr>
                <th style="width: 12%">名称</th>
                <th style="width: 13%">别名</th>
                <th style="width: 20%">核心用途</th>
                <th style="width: 25%">风味效果</th>
                <th style="width: 18%">适配场景</th>
                <th style="width: 12%">使用要点</th>
              </tr>
            </thead>
            <tbody>
              ${cat.spices.map(spice => `
                <tr>
                  <td><strong>${spice.name}</strong></td>
                  <td>${spice.alias || '-'}</td>
                  <td>${spice.purpose}</td>
                  <td>${spice.flavor}</td>
                  <td>${spice.usage}</td>
                  <td>${spice.tips}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

function showRecipeDetail(id) {
  window.location.href = `recipe.html?id=${id}`;
}

function initCategoryNav() {
  const buttons = document.querySelectorAll('.category-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderRecipeList(btn.dataset.category);
    });
  });
}

function initSearch() {
  const searchInput = document.getElementById('searchInput');
  let searchTimeout;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      renderRecipeList(null, e.target.value);
    }, 200);
  });
}

function init() {
  renderDailyRecommend();
  renderRecipeList();
  initCategoryNav();
  initSearch();
  initHistoryModal();
  initializeDemoHistory();
}

function initializeDemoHistory() {
  let savedHistory = JSON.parse(localStorage.getItem('recipeUpdateHistory') || '[]');
  const existingIds = new Set(savedHistory.map(r => r.id));
  
  const recentRecipes = [...recipes].reverse();
  const now = Date.now();
  
  recentRecipes.forEach((recipe, index) => {
    if (!existingIds.has(recipe.id)) {
      const record = {
        id: recipe.id,
        name: recipe.name,
        category: recipe.category,
        categoryName: recipe.categoryName,
        time: new Date(now - (index * 86400000)).toLocaleString('zh-CN'),
        timestamp: now - (index * 86400000)
      };
      savedHistory.unshift(record);
    }
  });
  
  savedHistory.sort((a, b) => b.timestamp - a.timestamp);
  
  if (savedHistory.length > 50) {
    savedHistory = savedHistory.slice(0, 50);
  }
  
  localStorage.setItem('recipeUpdateHistory', JSON.stringify(savedHistory));
  updateHistory = savedHistory;
  updateNotificationBadge();
}

init();
