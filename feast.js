var currentMenu = [];
var selectedRecipes = [];
var currentFilter = 'all';
var isCustomMode = false;

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateMenu() {
  const meatRecipes = shuffleArray(recipes.filter(r => r.category === 'meat'));
  const vegetableRecipes = shuffleArray(recipes.filter(r => r.category === 'vegetable'));
  const soupRecipes = shuffleArray(recipes.filter(r => r.category === 'soup'));
  const stapleRecipes = shuffleArray(recipes.filter(r => r.category === 'staple'));

  const menu = [
    ...meatRecipes.slice(0, 5),
    ...vegetableRecipes.slice(0, 4),
    ...soupRecipes.slice(0, 2),
    ...stapleRecipes.slice(0, 1)
  ];

  currentMenu = shuffleArray(menu);
  renderMenu();
  updateStats();
  document.getElementById('exportBtn').disabled = false;
  document.getElementById('aiBtn').disabled = false;
}

function renderMenu() {
  const container = document.getElementById('menuPreview');

  container.innerHTML = `
    <div class="menu-grid">
      ${currentMenu.map((recipe, index) => `
        <div class="menu-card ${recipe.category}" onclick="showRecipeDetail(${recipe.id})">
          <span class="card-number">${index + 1}</span>
          <div class="card-icon">${categoryIcons[recipe.category]}</div>
          <h3>${recipe.name}</h3>
          <span class="card-category ${recipe.category}">${recipe.categoryName}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function updateStats() {
  const stats = {
    meat: currentMenu.filter(r => r.category === 'meat').length,
    vegetable: currentMenu.filter(r => r.category === 'vegetable').length,
    soup: currentMenu.filter(r => r.category === 'soup').length,
    staple: currentMenu.filter(r => r.category === 'staple').length
  };

  document.getElementById('meatCount').textContent = stats.meat;
  document.getElementById('vegetableCount').textContent = stats.vegetable;
  document.getElementById('soupCount').textContent = stats.soup;
  document.getElementById('stapleCount').textContent = stats.staple;
  document.getElementById('menuStats').style.display = 'flex';
}

function showRecipeDetail(id) {
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return;

  const modal = document.getElementById('recipeModal');
  const modalBody = document.getElementById('modalBody');

  modalBody.innerHTML = `
    <div class="modal-image" style="background-image: url('${recipe.image}')"></div>
    <span class="modal-category card-category ${recipe.category}">${recipe.categoryName}</span>
    <h2>${recipe.name}</h2>
    <p style="color: #666; margin-bottom: 20px;">${recipe.description}</p>

    <div class="modal-section">
      <h3>🥗 食材准备</h3>
      <ul>
        ${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}
      </ul>
    </div>

    <div class="modal-section">
      <h3>👨‍🍳 制作步骤</h3>
      <ol>
        ${recipe.steps.map(s => `<li>${s}</li>`).join('')}
      </ol>
    </div>

    <div style="display: flex; gap: 20px; color: #888; font-size: 0.9rem;">
      <span>⏱ 用时：${recipe.time}</span>
      <span>📊 难度：${recipe.difficulty}</span>
    </div>
  `;

  modal.classList.add('active');
}

function closeModal() {
  document.getElementById('recipeModal').classList.remove('active');
}

function getAIContent() {
  const aiContent = document.getElementById('aiContent');
  const streamEl = aiContent.querySelector('.ai-stream');
  if (streamEl && streamEl.innerHTML.trim()) {
    return convertToPDFStyles(streamEl.innerHTML);
  }
  return null;
}

function convertToPDFStyles(html) {
  return html
    .replace(/class="ingredient-table-container"/g, 'style="margin-bottom: 30px;"')
    .replace(/class="table-title"/g, 'style="color: #8e44ad; font-size: 18px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #e8d5f0;"')
    .replace(/class="ingredient-category"/g, 'style="background: white; border-radius: 8px; margin-bottom: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08);"')
    .replace(/class="category-header"/g, 'style="display: flex; align-items: center; padding: 10px 14px; border-bottom: 1px solid #f0f0f0; background: #fafafa;"')
    .replace(/class="category-icon"/g, 'style="font-size: 18px; margin-right: 8px;"')
    .replace(/class="category-name"/g, 'style="font-weight: 600; color: #333; font-size: 14px; flex: 1;"')
    .replace(/class="category-count"/g, 'style="font-size: 12px; color: #888; background: #f0f0f0; padding: 3px 8px; border-radius: 10px;"')
    .replace(/class="ingredient-table"/g, 'style="width: 100%; border-collapse: collapse;"')
    .replace(/<th/g, '<th style="background: #f8f8f8; padding: 8px 10px; text-align: left; font-size: 12px; color: #666; font-weight: 600; border-bottom: 1px solid #e0e0e0;"')
    .replace(/<td/g, '<td style="padding: 8px 10px; font-size: 12px; color: #333; border-bottom: 1px solid #f0f0f0;"');
}

function generatePDFContent() {
  const container = document.createElement('div');
  container.style.cssText = 'width: 800px; padding: 40px; background: white; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif;';

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let html = `
    <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #f5576c; padding-bottom: 20px;">
      <h1 style="color: #f5576c; font-size: 32px; margin: 0 0 10px 0;">🎊 吃席菜单</h1>
      <p style="color: #888; font-size: 14px; margin: 0;">${today}</p>
    </div>
  `;

  const aiContent = getAIContent();
  if (aiContent) {
    html += `
      <div style="margin-bottom: 40px;">
        <div style="background: linear-gradient(135deg, #f8f4ff 0%, #fff 100%); border: 2px solid #9b59b6; border-radius: 12px; padding: 25px; margin-bottom: 20px;">
          <h2 style="color: #8e44ad; font-size: 22px; margin: 0 0 20px 0; padding-bottom: 15px; border-bottom: 2px solid #e8d5f0;">
            🤖 AI 智能烹饪规划
          </h2>
          <div style="color: #333; font-size: 13px; line-height: 1.8;">
            ${aiContent}
          </div>
        </div>
      </div>

      <div style="margin: 40px 0; text-align: center;">
        <div style="display: inline-block; padding: 15px 40px; background: linear-gradient(90deg, #f5576c, #9b59b6); border-radius: 30px;">
          <span style="color: white; font-size: 16px; font-weight: 600;">━━━━━ 食谱详情 ━━━━━</span>
        </div>
      </div>
    `;
  }

  const categories = [
    { key: 'meat', name: '荤菜', icon: '🍖' },
    { key: 'vegetable', name: '素菜', icon: '🥬' },
    { key: 'soup', name: '汤', icon: '🍲' },
    { key: 'staple', name: '主食', icon: '🍚' }
  ];

  categories.forEach(cat => {
    const items = currentMenu.filter(r => r.category === cat.key);
    if (items.length === 0) return;

    html += `<div style="margin-bottom: 30px;">`;
    html += `<h2 style="color: #333; font-size: 20px; border-left: 4px solid #f5576c; padding-left: 10px; margin-bottom: 20px;">${cat.icon} ${cat.name}</h2>`;

    items.forEach((item, index) => {
      html += `
        <div style="margin-bottom: 25px; padding: 15px; background: #f9f9f9; border-radius: 8px;">
          <h3 style="color: #333; font-size: 18px; margin: 0 0 10px 0;">${index + 1}. ${item.name}</h3>
          <p style="color: #666; font-size: 13px; margin: 0 0 10px 0; line-height: 1.5;">${item.description}</p>

          <div style="margin-bottom: 10px;">
            <p style="font-weight: bold; color: #555; font-size: 13px; margin: 0 0 5px 0;">🥗 食材：</p>
            <p style="color: #666; font-size: 12px; margin: 0; line-height: 1.6;">${item.ingredients.join('、')}</p>
          </div>

          <div>
            <p style="font-weight: bold; color: #555; font-size: 13px; margin: 0 0 5px 0;">👨‍🍳 步骤：</p>
            <ol style="color: #666; font-size: 12px; margin: 0; padding-left: 20px; line-height: 1.8;">
              ${item.steps.map(step => `<li>${step}</li>`).join('')}
            </ol>
          </div>

          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #ddd;">
            <span style="color: #999; font-size: 11px;">⏱ ${item.time} | 📊 ${item.difficulty}</span>
          </div>
        </div>
      `;
    });

    html += `</div>`;
  });

  html += `
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="color: #aaa; font-size: 12px;">由 吃席菜单生成器 生成</p>
    </div>
  `;

  container.innerHTML = html;
  document.body.appendChild(container);
  return container;
}

async function exportPDF() {
  if (currentMenu.length === 0) return;

  const exportBtn = document.getElementById('exportBtn');
  const originalText = exportBtn.innerHTML;
  exportBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">生成中...</span>';
  exportBtn.disabled = true;

  let pdfContainer = null;

  try {
    const { jsPDF } = window.jspdf;

    pdfContainer = generatePDFContent();

    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(pdfContainer, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: 800,
      width: 800
    });

    const imgData = canvas.toDataURL('image/png');

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    doc.save(`chi-xi-menu-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('PDF export failed:', error);
    alert('PDF导出失败，请重试');
  } finally {
    exportBtn.innerHTML = originalText;
    exportBtn.disabled = false;
    if (pdfContainer) {
      document.body.removeChild(pdfContainer);
    }
  }
}

document.getElementById('generateBtn').addEventListener('click', generateMenu);
document.getElementById('exportBtn').addEventListener('click', exportPDF);
document.getElementById('aiBtn').addEventListener('click', analyzeWithAI);
document.getElementById('aiClose').addEventListener('click', closeAIResult);
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('recipeModal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    closeModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeAIResult();
  }
});

document.getElementById('randomMode').addEventListener('click', () => toggleMode('random'));
document.getElementById('customMode').addEventListener('click', () => toggleMode('custom'));
document.getElementById('confirmSelection').addEventListener('click', confirmSelection);
document.getElementById('clearSelection').addEventListener('click', clearSelection);

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => filterByCategory(btn.dataset.filter));
});

function buildAIPrompt() {
  let menuInfo = '以下是我需要制作的12道菜：\n\n';

  currentMenu.forEach((recipe, index) => {
    menuInfo += `【第${index + 1}道】${recipe.name}（${recipe.categoryName}）\n`;
    menuInfo += `用时：${recipe.time}，难度：${recipe.difficulty}\n`;
    menuInfo += `食材：${recipe.ingredients.join('、')}\n`;
    menuInfo += `步骤：\n`;
    recipe.steps.forEach((step, i) => {
      menuInfo += `  ${i + 1}. ${step}\n`;
    });
    menuInfo += '\n';
  });

  const systemPrompt = `你是一位拥有20年中餐烹饪经验的专业厨师，精通川粤鲁苏淮扬各菜系，擅长单人厨房的高效多菜并行规划。你输出风格：专业、简洁、逻辑严密、数据化、鼓励行动，但不使用任何亲昵或带徒弟式的称呼。语言直接，像一份厨房操作手册。

任务：在严格180分钟（3小时）内，单人完成12道中式家常菜（适合4-8人聚餐，荤素汤主食均衡，包含热菜、凉菜）。

严格按以下4步输出，结构固定，不得省略或打乱。

**第一步：全菜食材汇总清单**
请按以下JSON格式输出食材清单（必须严格遵循JSON格式，方便程序解析）：

\`\`\`json
{
  "蔬菜类": [
    {"name": "西红柿", "amount": "1.5kg", "note": "约10个中等"},
    {"name": "土豆", "amount": "1kg", "note": "约5个"}
  ],
  "肉禽类": [
    {"name": "五花肉", "amount": "1kg", "note": "红烧用"},
    {"name": "鸡胸肉", "amount": "500g", "note": "切丝"}
  ],
  "水产蛋类": [
    {"name": "鸡蛋", "amount": "10个", "note": ""}
  ],
  "菌菇豆制品类": [
    {"name": "豆腐", "amount": "2块", "note": "嫩豆腐"}
  ],
  "调味干货类": [
    {"name": "食用油", "amount": "500ml", "note": ""},
    {"name": "生抽", "amount": "200ml", "note": ""}
  ],
  "主食及其他": [
    {"name": "大米", "amount": "1kg", "note": ""}
  ]
}
\`\`\`

JSON之后，用简短文字说明食材准备要点。

**第二步：每道菜时间拆解**
请按以下模板JSON格式输出时间拆解（必须严格遵循JSON格式，方便程序解析）：

\`\`\`json
{
  "dishes": [
    {
      "name": "酸甜虎皮扣肉",
      "prepTime": "35分钟",
      "activeTime": "15分钟",
      "passiveTime": "125分钟",
      "totalTime": "175分钟",
      "parallelPotential": "极高",
      "parallelNote": "浸泡和蒸制期间可完成几乎所有其他任务"
    }
  ]
}
\`\`\`

JSON之后，用简短文字说明时间规划要点。

**第三步：180分钟详细时间轴**
严格遵循以下调度原则：
1. 开工0分钟内立即启动所有被动长时任务（炖汤、红烧、烤制、高压锅、电饭煲煮饭等）。
2. 立即进行统一Mise en Place：一次性完成所有洗菜、切配、腌制、调料分碗。
3. 充分利用所有被动等待期（尤其是40分钟以上），密集安排快手菜、凉菜、洗锅、擦台面、摆盘准备。
4. 快炒及最后出锅菜安排在后20-40分钟，确保上桌时温度最佳。
5. 每30分钟左右插入1-2分钟检查点（尝味、翻拌、加水、调整火候、洗锅）。
6. 假设标准家用厨房：2-3个灶头 + 电饭煲 + 蒸锅/烤箱，最大化并行。
7. 最后10-15分钟专用于最终摆盘、装饰、擦拭台面灶台。
8. 预留5-10分钟总缓冲时间。

请按以下JSON格式输出时间轴（必须严格遵循JSON格式，方便程序解析）：

\`\`\`json
{
  "timeline": [
    {
      "timeRange": "0:00-0:10",
      "activeTask": "启动炖汤、红烧肉等被动任务，淘米煮饭",
      "passiveTask": "无",
      "helperTask": "准备调料碗、检查食材"
    },
    {
      "timeRange": "0:10-0:40",
      "activeTask": "统一洗切所有蔬菜及肉类",
      "passiveTask": "炖汤、红烧肉继续",
      "helperTask": "洗锅、整理台面"
    }
  ]
}
\`\`\`

JSON之后，用简短文字说明时间轴执行要点。

**第四步：风险控制与优化建议**
- 列出3个最常见风险点及应对措施
- 若时间紧张，推荐优先保留/简化/放弃的1-2道菜，并说明理由
- 厨房收尾技巧：如何实现边烹饪边清理、结束时基本无剩余工作量

输出全程保持专业语气，结尾以一句简短鼓励结束（如"按此执行，可高效完成高质量12道菜"）。严格按以上结构输出，开始。`;

  return `${systemPrompt}\n\n${menuInfo}`;
}

async function analyzeWithAI() {
  if (currentMenu.length === 0) return;

  const aiBtn = document.getElementById('aiBtn');
  const aiResult = document.getElementById('aiResult');
  const aiContent = document.getElementById('aiContent');

  aiBtn.disabled = true;
  aiBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">分析中...</span>';
  aiResult.style.display = 'block';
  aiContent.innerHTML = `
    <div class="ai-loading">
      <div class="ai-spinner"></div>
      <p>AI 正在分析最优烹饪方案...</p>
      <p class="ai-tip">预计需要 30-60 秒，请耐心等待</p>
    </div>
  `;

  aiResult.scrollIntoView({ behavior: 'smooth', block: 'start' });

  try {
    const prompt = buildAIPrompt();

    const response = await fetch('https://api-inference.modelscope.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ms-d2c12a44-8862-49e8-9f0e-a4c722ed109d'
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3.2',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: true,
        extra_body: {
          enable_thinking: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let thinkingContent = '';
    let isThinking = true;

    aiContent.innerHTML = '<div class="ai-stream"></div>';
    const streamEl = aiContent.querySelector('.ai-stream');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta;

            if (delta) {
              if (delta.reasoning_content) {
                thinkingContent += delta.reasoning_content;
              }
              if (delta.content) {
                if (isThinking && thinkingContent) {
                  fullContent += '\n\n---\n\n**📋 烹饪规划方案**\n\n';
                  isThinking = false;
                }
                fullContent += delta.content;
              }
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }

      streamEl.innerHTML = formatAIResponse(fullContent);
      streamEl.scrollTop = streamEl.scrollHeight;
    }

    if (!fullContent) {
      throw new Error('AI 未返回有效内容');
    }

    setTimeout(() => {
      exportPDF();
    }, 500);

  } catch (error) {
    console.error('AI analysis failed:', error);
    aiContent.innerHTML = `
      <div class="ai-error">
        <p>❌ AI 分析失败</p>
        <p class="error-detail">${error.message}</p>
        <button class="retry-btn" onclick="analyzeWithAI()">重试</button>
      </div>
    `;
  } finally {
    aiBtn.disabled = false;
    aiBtn.innerHTML = '<span class="btn-icon">🤖</span><span class="btn-text">AI时间规划</span>';
  }
}

function formatAIResponse(text) {
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/g;
  let ingredientTable = '';
  let timeCards = '';
  let timelineHTML = '';
  let textWithoutJson = text;

  const matches = [...text.matchAll(jsonRegex)];

  matches.forEach(match => {
    try {
      const jsonData = JSON.parse(match[1]);
      if (jsonData.dishes) {
        timeCards = renderTimeCards(jsonData);
      } else if (jsonData.timeline) {
        timelineHTML = renderTimeline(jsonData);
      } else {
        ingredientTable = renderIngredientTable(jsonData);
      }
      textWithoutJson = textWithoutJson.replace(match[0], '').trim();
    } catch (e) {
      console.error('JSON parse error:', e);
    }
  });

  let formattedText = textWithoutJson
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^## (.*$)/gim, '<h3>$1</h3>')
    .replace(/^# (.*$)/gim, '<h2>$1</h2>')
    .replace(/^[-•] (.*$)/gim, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li><span class="num">$1.</span> $2</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/<li>/g, '</p><ul><li>')
    .replace(/<\/li>/g, '</li></ul><p>')
    .replace(/<p><\/p>/g, '')
    .replace(/<p><br>/g, '<p>')
    .replace(/<br><\/p>/g, '</p>');

  return ingredientTable + timeCards + timelineHTML + formattedText;
}

function renderTimeCards(data) {
  if (!data.dishes || data.dishes.length === 0) return '';

  const potentialColors = {
    '极高': '#26de81',
    '高': '#45aaf2',
    '中': '#fdcb6e',
    '低': '#ff6b6b'
  };

  let cardsHTML = '<div class="time-cards-container">';
  cardsHTML += '<h3 class="table-title">⏱️ 每道菜时间拆解</h3>';
  cardsHTML += '<div class="time-cards-grid">';

  data.dishes.forEach((dish, index) => {
    const potentialColor = potentialColors[dish.parallelPotential] || '#9b59b6';

    cardsHTML += `
      <div class="time-card">
        <div class="time-card-header">
          <span class="dish-number">${index + 1}</span>
          <h4 class="dish-name">${dish.name}</h4>
        </div>
        <div class="time-card-body">
          <div class="time-row">
            <span class="time-label">🥘 准备时间</span>
            <span class="time-value">${dish.prepTime}</span>
          </div>
          <div class="time-row">
            <span class="time-label">🔥 主动操作</span>
            <span class="time-value">${dish.activeTime}</span>
          </div>
          <div class="time-row">
            <span class="time-label">⏳ 被动等待</span>
            <span class="time-value">${dish.passiveTime}</span>
          </div>
          <div class="time-row total">
            <span class="time-label">📊 总耗时</span>
            <span class="time-value total-time">${dish.totalTime}</span>
          </div>
        </div>
        <div class="time-card-footer" style="background: linear-gradient(90deg, ${potentialColor}20, transparent); border-left: 3px solid ${potentialColor};">
          <span class="parallel-label">并行潜力：</span>
          <span class="parallel-value" style="color: ${potentialColor};">${dish.parallelPotential}</span>
          <p class="parallel-note">${dish.parallelNote}</p>
        </div>
      </div>
    `;
  });

  cardsHTML += '</div></div>';
  return cardsHTML;
}

function renderTimeline(data) {
  if (!data.timeline || data.timeline.length === 0) return '';

  let timelineHTML = '<div class="timeline-container">';
  timelineHTML += '<h3 class="table-title">🕐 180分钟详细时间轴</h3>';
  timelineHTML += '<div class="timeline-wrapper">';

  data.timeline.forEach((item, index) => {
    const isEven = index % 2 === 0;

    timelineHTML += `
      <div class="timeline-item ${isEven ? 'timeline-left' : 'timeline-right'}">
        <div class="timeline-marker"></div>
        <div class="timeline-content">
          <div class="timeline-time">${item.timeRange}</div>
          <div class="timeline-tasks">
            <div class="timeline-task active-task">
              <span class="task-icon">🔥</span>
              <span class="task-label">主动任务</span>
              <span class="task-text">${item.activeTask}</span>
            </div>
            ${item.passiveTask && item.passiveTask !== '无' ? `
            <div class="timeline-task passive-task">
              <span class="task-icon">⏳</span>
              <span class="task-label">后台任务</span>
              <span class="task-text">${item.passiveTask}</span>
            </div>
            ` : ''}
            ${item.helperTask ? `
            <div class="timeline-task helper-task">
              <span class="task-icon">🧹</span>
              <span class="task-label">辅助任务</span>
              <span class="task-text">${item.helperTask}</span>
            </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  });

  timelineHTML += '</div></div>';
  return timelineHTML;
}

function renderIngredientTable(data) {
  const categoryIcons = {
    '蔬菜类': '🥬',
    '肉禽类': '🍖',
    '水产蛋类': '🦐',
    '菌菇豆制品类': '🍄',
    '调味干货类': '🧂',
    '主食及其他': '🍚'
  };

  const categoryColors = {
    '蔬菜类': '#26de81',
    '肉禽类': '#ff6b6b',
    '水产蛋类': '#45aaf2',
    '菌菇豆制品类': '#a29bfe',
    '调味干货类': '#fdcb6e',
    '主食及其他': '#ff9f43'
  };

  let tableHTML = '<div class="ingredient-table-container">';
  tableHTML += '<h3 class="table-title">📋 全菜食材汇总清单</h3>';

  Object.entries(data).forEach(([category, items]) => {
    if (!items || items.length === 0) return;

    const icon = categoryIcons[category] || '📦';
    const color = categoryColors[category] || '#9b59b6';

    tableHTML += `
      <div class="ingredient-category" style="border-left: 4px solid ${color};">
        <div class="category-header" style="background: linear-gradient(90deg, ${color}15, transparent);">
          <span class="category-icon">${icon}</span>
          <span class="category-name">${category}</span>
          <span class="category-count">${items.length}种</span>
        </div>
        <table class="ingredient-table">
          <thead>
            <tr>
              <th style="width: 40%;">食材名称</th>
              <th style="width: 30%;">用量</th>
              <th style="width: 30%;">备注</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.amount}</td>
                <td>${item.note || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  });

  tableHTML += '</div>';
  return tableHTML;
}

function closeAIResult() {
  document.getElementById('aiResult').style.display = 'none';
}

function toggleMode(mode) {
  isCustomMode = mode === 'custom';
  const randomModeBtn = document.getElementById('randomMode');
  const customModeBtn = document.getElementById('customMode');
  const customSelector = document.getElementById('customSelector');
  const menuPreview = document.getElementById('menuPreview');
  const menuStats = document.getElementById('menuStats');
  const generateBtn = document.getElementById('generateBtn');

  if (isCustomMode) {
    randomModeBtn.classList.remove('active');
    customModeBtn.classList.add('active');
    customSelector.style.display = 'block';
    menuPreview.style.display = 'none';
    menuStats.style.display = 'none';
    generateBtn.style.display = 'none';
    renderAvailableRecipes();
    renderSelectedList();
  } else {
    randomModeBtn.classList.add('active');
    customModeBtn.classList.remove('active');
    customSelector.style.display = 'none';
    menuPreview.style.display = 'block';
    generateBtn.style.display = 'flex';
    if (currentMenu.length > 0) {
      menuStats.style.display = 'flex';
    }
  }
}

function renderAvailableRecipes() {
  const container = document.getElementById('availableRecipes');
  let filteredRecipes = recipes;

  if (currentFilter !== 'all') {
    filteredRecipes = recipes.filter(r => r.category === currentFilter);
  }

  container.innerHTML = `
    <div class="recipe-grid">
      ${filteredRecipes.map(recipe => {
        const isSelected = selectedRecipes.some(r => r.id === recipe.id);
        return `
          <div class="recipe-card ${recipe.category} ${isSelected ? 'selected' : ''}" onclick="toggleRecipe(${recipe.id})">
            <div class="recipe-card-icon">${categoryIcons[recipe.category]}</div>
            <h4>${recipe.name}</h4>
            <span class="recipe-card-category">${recipe.categoryName}</span>
            <div class="recipe-card-meta">
              <span>⏱ ${recipe.time}</span>
              <span>📊 ${recipe.difficulty}</span>
            </div>
            ${isSelected ? '<div class="selected-badge">✓</div>' : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function toggleRecipe(id) {
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return;

  const index = selectedRecipes.findIndex(r => r.id === id);
  if (index > -1) {
    selectedRecipes.splice(index, 1);
  } else if (selectedRecipes.length < 12) {
    selectedRecipes.push(recipe);
  } else {
    alert('最多只能选择12道菜！');
    return;
  }

  renderAvailableRecipes();
  renderSelectedList();
  updateSelectedCount();
}

function renderSelectedList() {
  const container = document.getElementById('selectedList');

  if (selectedRecipes.length === 0) {
    container.innerHTML = '<p class="empty-selected">还没有选择菜品</p>';
    return;
  }

  container.innerHTML = `
    <div class="selected-items">
      ${selectedRecipes.map((recipe, index) => `
        <div class="selected-item">
          <span class="selected-item-number">${index + 1}</span>
          <div class="selected-item-icon">${categoryIcons[recipe.category]}</div>
          <div class="selected-item-info">
            <div class="selected-item-name">${recipe.name}</div>
            <div class="selected-item-category">${recipe.categoryName}</div>
          </div>
          <button class="remove-btn" onclick="event.stopPropagation(); removeRecipe(${recipe.id})">×</button>
        </div>
      `).join('')}
    </div>
  `;
}

function removeRecipe(id) {
  selectedRecipes = selectedRecipes.filter(r => r.id !== id);
  renderAvailableRecipes();
  renderSelectedList();
  updateSelectedCount();
}

function updateSelectedCount() {
  document.getElementById('selectedCount').textContent = selectedRecipes.length;
  document.getElementById('confirmSelection').disabled = selectedRecipes.length < 1;
}

function clearSelection() {
  if (selectedRecipes.length === 0) return;
  if (confirm('确定要清空所有选择吗？')) {
    selectedRecipes = [];
    renderAvailableRecipes();
    renderSelectedList();
    updateSelectedCount();
  }
}

function confirmSelection() {
  if (selectedRecipes.length === 0) return;

  currentMenu = selectedRecipes;
  renderMenu();
  updateStats();
  toggleMode('random');
  document.getElementById('exportBtn').disabled = false;
  document.getElementById('aiBtn').disabled = false;
}

function filterByCategory(category) {
  currentFilter = category;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === category);
  });
  renderAvailableRecipes();
}
