'use strict';

const state = {
  questions: [],
  pathways: null,
  guideNode: 'start',
  guideHistory: [],
  activeCategory: null
};

const statusMeta = {
  acceptable: { label: 'Generally acceptable', icon: '✓' },
  caution: { label: 'Use with caution', icon: '!' },
  approval: { label: 'Approval or advice required', icon: '⚑' },
  prohibited: { label: 'Do not proceed', icon: '✕' }
};

const el = id => document.getElementById(id);

async function loadData() {
  try {
    const [questionsResponse, pathwaysResponse] = await Promise.all([
      fetch('data/questions.json'),
      fetch('data/pathways.json')
    ]);
    if (!questionsResponse.ok || !pathwaysResponse.ok) throw new Error('Data files could not be loaded.');
    state.questions = await questionsResponse.json();
    state.pathways = await pathwaysResponse.json();
    init();
  } catch (error) {
    el('guideContent').innerHTML = `<div class="status-banner status-prohibited"><h3>Unable to load the guidance content</h3><p>${escapeHtml(error.message)} Open this site through GitHub Pages or another web server rather than directly from your computer.</p></div>`;
  }
}

function init() {
  bindTabs();
  bindControls();
  renderGuide();
  renderCategories();
  renderSearchResults(state.questions.slice(0, 8), 'Popular questions');
}

function bindTabs() {
  const tabs = ['guide', 'search', 'browse'];
  tabs.forEach(name => {
    el(`tab-${name}`).addEventListener('click', () => {
      tabs.forEach(other => {
        const selected = other === name;
        el(`tab-${other}`).classList.toggle('is-active', selected);
        el(`tab-${other}`).setAttribute('aria-selected', String(selected));
        el(`${other}-panel`).hidden = !selected;
      });
      el('answerPanel').hidden = true;
      if (name === 'search') el('searchInput').focus();
    });
  });
}

function bindControls() {
  el('restartGuide').addEventListener('click', restartGuide);
  el('printButton').addEventListener('click', () => window.print());
  el('clearSearch').addEventListener('click', () => {
    el('searchInput').value = '';
    renderSearchResults(state.questions.slice(0, 8), 'Popular questions');
    el('searchInput').focus();
  });
  el('searchInput').addEventListener('input', event => runSearch(event.target.value));
}

function renderGuide() {
  const node = state.pathways[state.guideNode];
  el('progress').textContent = state.guideHistory.length ? `Step ${state.guideHistory.length + 1}` : 'Start here';
  el('answerPanel').hidden = true;
  if (!node) return;

  const buttons = node.options.map(option =>
    `<button class="option-card" type="button" data-next="${escapeHtml(option.next || '')}" data-result="${escapeHtml(option.result || '')}">${escapeHtml(option.label)}</button>`
  ).join('');

  el('guideContent').innerHTML = `<h3>${escapeHtml(node.question)}</h3><div class="option-grid">${buttons}</div>`;
  el('guideContent').querySelectorAll('.option-card').forEach(button => {
    button.addEventListener('click', () => {
      state.guideHistory.push(state.guideNode);
      if (button.dataset.result) renderPathwayResult(button.dataset.result);
      else {
        state.guideNode = button.dataset.next;
        renderGuide();
      }
    });
  });
}

function restartGuide() {
  state.guideNode = 'start';
  state.guideHistory = [];
  renderGuide();
  el('guide-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderPathwayResult(resultId) {
  const result = state.pathways.results[resultId];
  if (!result) return;
  const meta = statusMeta[result.status];
  el('guideContent').innerHTML = `
    <div class="status-banner status-${result.status}">
      <p class="status-label">${meta.icon} ${meta.label}</p>
      <h3>${escapeHtml(result.title)}</h3>
      <p>${escapeHtml(result.text)}</p>
    </div>
    <h3>Before proceeding</h3>
    <ul>${result.actions.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
    <div class="answer-actions no-print">
      <button class="button button-secondary" id="guideBack" type="button">Back</button>
      <button class="button button-primary" id="guideRestartResult" type="button">Start again</button>
    </div>`;
  el('progress').textContent = `Indicative result after ${state.guideHistory.length} question${state.guideHistory.length === 1 ? '' : 's'}`;
  el('guideBack').addEventListener('click', () => {
    state.guideNode = state.guideHistory.pop() || 'start';
    renderGuide();
  });
  el('guideRestartResult').addEventListener('click', restartGuide);
}

function runSearch(query) {
  const clean = query.trim().toLowerCase();
  if (!clean) {
    renderSearchResults(state.questions.slice(0, 8), 'Popular questions');
    return;
  }
  const terms = clean.split(/\s+/).filter(term => term.length > 1);
  const scored = state.questions.map(question => {
    const title = question.title.toLowerCase();
    const category = question.category.toLowerCase();
    const keywords = question.keywords.join(' ').toLowerCase();
    const answer = question.answer.toLowerCase();
    let score = 0;
    if (title.includes(clean)) score += 12;
    terms.forEach(term => {
      if (title.includes(term)) score += 5;
      if (keywords.includes(term)) score += 3;
      if (category.includes(term)) score += 2;
      if (answer.includes(term)) score += 1;
    });
    return { question, score };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);
  renderSearchResults(scored.map(item => item.question), `${scored.length} matching question${scored.length === 1 ? '' : 's'}`);
}

function renderSearchResults(questions, summary) {
  el('searchSummary').textContent = summary;
  const container = el('searchResults');
  if (!questions.length) {
    container.innerHTML = `<div class="alert"><h3>No controlled answer matched</h3><p>Try broader words describing the task, such as <em>transcripts</em>, <em>copyright</em>, <em>screening</em>, <em>editing</em> or <em>grant</em>. Do not add sensitive details.</p></div>`;
    return;
  }
  container.innerHTML = questions.slice(0, 12).map(question => resultCard(question)).join('');
  bindAnswerButtons(container);
}

function renderCategories() {
  const categories = [...new Set(state.questions.map(question => question.category))];
  el('categoryGrid').innerHTML = categories.map(category => {
    const count = state.questions.filter(question => question.category === category).length;
    return `<button class="category-card" type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}<span class="result-meta">${count} question${count === 1 ? '' : 's'}</span></button>`;
  }).join('');

  el('categoryGrid').querySelectorAll('.category-card').forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;
      const matches = state.questions.filter(question => question.category === category);
      el('categoryResults').innerHTML = `<h3>${escapeHtml(category)}</h3>${matches.map(question => resultCard(question)).join('')}`;
      bindAnswerButtons(el('categoryResults'));
      el('categoryResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function resultCard(question) {
  const meta = statusMeta[question.status];
  return `<button class="question-card" type="button" data-question-id="${escapeHtml(question.id)}">
    <strong>${escapeHtml(question.title)}</strong>
    <span>${escapeHtml(question.category)} · ${meta.label}</span>
  </button>`;
}

function bindAnswerButtons(container) {
  container.querySelectorAll('[data-question-id]').forEach(button => {
    button.addEventListener('click', () => showAnswer(button.dataset.questionId));
  });
}

function accordionItem(title, content, open = false) {
  const id = `accordion-${Math.random().toString(36).slice(2)}`;
  return `<div class="accordion-item">
    <button class="accordion-trigger" type="button" aria-expanded="${open}" aria-controls="${id}">
      <span>${escapeHtml(title)}</span><span aria-hidden="true">${open ? '−' : '+'}</span>
    </button>
    <div class="accordion-panel" id="${id}" ${open ? '' : 'hidden'}>${content}</div>
  </div>`;
}

function showAnswer(id) {
  const question = state.questions.find(item => item.id === id);
  if (!question) return;
  const meta = statusMeta[question.status];
  const panel = el('answerPanel');
  const list = items => `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  panel.innerHTML = `
    <section class="verdict-panel status-${question.status}" aria-labelledby="verdict-title">
      <div>
        <p class="verdict-kicker">${meta.icon} ${meta.label}</p>
        <h2 id="verdict-title">${escapeHtml(question.title)}</h2>
        <p>${escapeHtml(question.answer)}</p>
      </div>
      <button id="closeAnswer" class="back-button" type="button">Back to the tool</button>
    </section>
    <section class="detail-panel" aria-label="Guideline breakdown">
      <p class="eyebrow">Guideline breakdown</p>
      ${accordionItem('Why this matters', list(question.why), true)}
      ${accordionItem('Before proceeding', list(question.actions))}
      ${accordionItem('What to record or declare', `<p>${escapeHtml(question.recording)}</p>`)}
      ${accordionItem('Guideline basis', list(question.sections))}
      ${accordionItem('Possible support pathways', list(question.support))}
      <button id="printAnswer" class="mode-button" type="button">Print this result</button>
    </section>`;
  panel.hidden = false;
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  panel.querySelectorAll('.accordion-trigger').forEach(button => {
    button.addEventListener('click', () => {
      const target = document.getElementById(button.getAttribute('aria-controls'));
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      target.hidden = expanded;
      button.lastElementChild.textContent = expanded ? '+' : '−';
    });
  });
  el('closeAnswer').addEventListener('click', () => {
    panel.hidden = true;
    document.querySelector('.experience-card:not([hidden])')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  el('printAnswer').addEventListener('click', () => window.print());
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

loadData();
