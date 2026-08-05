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


const guidelineLinks = {
  'Core Principles': 'guide.html#section-2',
  'Core Principles: Equity, inclusion and cultural safety': 'guide.html#principle-equity-inclusion-cultural-safety',
  'Copyright and intellectual property principle': 'guide.html#principle-copyright-ip',
  'Definition: Material AI use': 'guide.html#definition-material-ai-use',
  'Roles and Responsibilities': 'guide.html#section-4',
  'Recommendation 1': 'guide.html#recommendation-1',
  'Recommendation 2': 'guide.html#recommendation-2',
  'Recommendation 3': 'guide.html#recommendation-3',
  'Recommendation 4': 'guide.html#recommendation-4',
  'Recommendation 6': 'guide.html#recommendation-6',
  'Recommendation 7': 'guide.html#recommendation-7',
  'Recommendation 8': 'guide.html#recommendation-8',
  'Levels of AI tool use': 'guide.html#levels-of-ai-tool-use',
  'Section 7': 'guide.html#section-7',
  'Section 7: Collaboration and third-party interactions': 'guide.html#section-7-collaboration',
  'Section 7: Ethics and governance': 'guide.html#section-7-ethics',
  'Section 7: Data collection': 'guide.html#section-7-data-collection',
  'Section 7: Data analysis': 'guide.html#section-7-data-analysis',
  'Section 8': 'guide.html#section-8',
  'Section 8: Research data stored in OneDrive and using Microsoft 365 Copilot': 'guide.html#section-8-onedrive-copilot',
  'Section 9': 'guide.html#section-9',
  'Section 10: Funder Requirements': 'guide.html#section-10',
  'Section 10: ARC and NHMRC updated joint policy': 'guide.html#section-10-arc-nhmrc',
  'Section 11': 'guide.html#section-11',
  'Section 11: Thesis examiners and assessors': 'guide.html#section-11-examiners',
  'Section 12': 'guide.html#section-12',
  'Appendix A': 'guide.html#appendix-a',
  'Appendix B': 'guide.html#appendix-b',
  'Appendix C': 'guide.html#appendix-c',
  'Appendix E': 'guide.html#appendix-e',
  'Case Study 4': 'guide.html#case-study-4',
  'Case Study 6': 'guide.html#case-study-6'
};

const supportLinks = {
  'Human Research Ethics Committee': 'https://www.csu.edu.au/research/integrity-ethics-compliance/human-ethics',
  'Human Research Ethics': 'https://www.csu.edu.au/research/integrity-ethics-compliance/human-ethics',
  'Research Data Management support': 'https://library.csu.edu.au/for-researchers/search-analyse/research-data-management',
  'DIT': 'https://staff.csu.edu.au/division/information-technology/home',
  'Privacy and information security': 'https://www.csu.edu.au/division/vcoffice/ogca/data-privacy',
  'Privacy': 'https://www.csu.edu.au/division/vcoffice/ogca/data-privacy',
  'Research integrity support': 'https://research.csu.edu.au/research-at-charles-sturt/research-integrity',
  'Graduate Research Office': 'https://research.csu.edu.au/graduate-research',
  'Graduate Research': 'https://research.csu.edu.au/graduate-research',
  'Library research support': 'https://library.csu.edu.au/for-researchers',
  'Library Copyright adviser': 'https://www.csu.edu.au/copyright/home',
  'Research Office': 'https://research.csu.edu.au/research-at-charles-sturt/research-support',
  'Library publishing support': 'https://library.csu.edu.au/for-researchers/publish-engage/where-to-publish',
  'Library faculty team': 'https://library.csu.edu.au/our-libraries/contact-library-team/faculty-teams',
  'AI guidance for students': 'https://www.csu.edu.au/current-students/studying/assignments-and-exams/generative-ai',
  'Charles Sturt AI principles': 'https://policy.csu.edu.au/document/view-current.php?id=577',
  'Generative AI Library Guide': 'https://libguides.csu.edu.au/generativeAI',
  'Microsoft Copilot information': 'https://www.csu.edu.au/current-students/support/it/software-downloads/microsoft-copilot',
  'AI in research guidance': 'https://libguides.csu.edu.au/generativeAI/research',
  'Copyright and GenAI guidance': 'https://libguides.csu.edu.au/generativeAI/Copyright',
  'Review methodologist': 'https://library.csu.edu.au/our-libraries/contact-library-team/faculty-teams',
  'Methodologist': 'https://research.csu.edu.au/research-at-charles-sturt/research-support',
  'Statistician or methodologist': 'https://research.csu.edu.au/research-at-charles-sturt/research-support'
};

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
  initInteractiveTitle();
  bindTabs();
  bindControls();
  renderGuide();
  renderCategories();
  renderSearchResults(state.questions.slice(0, 8), 'Popular questions');
}


function initInteractiveTitle() {
  const title = el('page-title');
  const phrase = el('lifecyclePhrase');
  const target = el('tool-options');
  const cue = el('lifecycleCue');
  if (!title || !phrase || !target) return;

  const titleText = 'AI in Research Decision Tool';
  const lifecycle = [
    'Develop a question',
    'Design the method',
    'Search the literature',
    'Collect and manage data',
    'Analyse responsibly',
    'Write and publish'
  ];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let phraseIndex = 0;
  let touchTimer = null;

  title.textContent = '';
  title.setAttribute('aria-describedby', 'titleInteractionHelp');
  titleText.split(' ').forEach((word, wordIndex, words) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'title-word';
    wordSpan.setAttribute('aria-hidden', 'true');
    [...word].forEach(character => {
      const letter = document.createElement('span');
      letter.className = 'title-letter';
      letter.textContent = character;
      wordSpan.appendChild(letter);
    });
    title.appendChild(wordSpan);
    if (wordIndex < words.length - 1) {
      const space = document.createElement('span');
      space.className = 'title-space';
      space.setAttribute('aria-hidden', 'true');
      title.appendChild(space);
    }
  });

  const letters = [...title.querySelectorAll('.title-letter')];

  function setPhrase(index) {
    const next = ((index % lifecycle.length) + lifecycle.length) % lifecycle.length;
    if (next === phraseIndex && phrase.textContent === lifecycle[next]) return;
    phraseIndex = next;
    if (reduceMotion.matches) {
      phrase.textContent = lifecycle[next];
      return;
    }
    phrase.classList.add('is-changing');
    window.setTimeout(() => {
      phrase.textContent = lifecycle[next];
      phrase.classList.remove('is-changing');
    }, 130);
  }

  function resetLetters() {
    title.classList.remove('is-active');
    letters.forEach(letter => {
      letter.classList.remove('is-near');
      letter.style.setProperty('--lift', '0px');
      letter.style.setProperty('--scale', '1');
      letter.style.setProperty('--tilt', '0deg');
    });
  }

  function animateFromPoint(clientX, clientY) {
    if (reduceMotion.matches) return;
    title.classList.add('is-active');
    letters.forEach((letter, index) => {
      const rect = letter.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const distance = Math.hypot(clientX - x, (clientY - y) * 1.35);
      const influence = Math.max(0, 1 - distance / 115);
      const lift = -14 * influence;
      const scale = 1 + .055 * influence;
      const tilt = ((clientX - x) / 115) * 2.4 * influence;
      letter.style.setProperty('--lift', `${lift.toFixed(2)}px`);
      letter.style.setProperty('--scale', scale.toFixed(3));
      letter.style.setProperty('--tilt', `${tilt.toFixed(2)}deg`);
      letter.classList.toggle('is-near', influence > .42);
    });
    const rect = title.getBoundingClientRect();
    const ratio = Math.min(.999, Math.max(0, (clientX - rect.left) / Math.max(rect.width, 1)));
    setPhrase(Math.floor(ratio * lifecycle.length));
  }

  function playTouchWave() {
    if (reduceMotion.matches) return;
    window.clearInterval(touchTimer);
    let step = 0;
    touchTimer = window.setInterval(() => {
      const titleRect = title.getBoundingClientRect();
      const ratio = step / 20;
      animateFromPoint(titleRect.left + titleRect.width * ratio, titleRect.top + titleRect.height * .5);
      setPhrase(Math.min(lifecycle.length - 1, Math.floor(ratio * lifecycle.length)));
      step += 1;
      if (step > 20) {
        window.clearInterval(touchTimer);
        window.setTimeout(resetLetters, 220);
      }
    }, 38);
  }

  title.addEventListener('pointermove', event => {
    if (finePointer.matches) animateFromPoint(event.clientX, event.clientY);
  });
  title.addEventListener('pointerleave', resetLetters);
  title.addEventListener('focus', () => {
    if (!finePointer.matches) playTouchWave();
  });
  title.addEventListener('click', () => {
    if (!finePointer.matches) playTouchWave();
    target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
  });
  title.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      playTouchWave();
      target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
    }
  });

  if (cue) {
    const goToToolOptions = () => {
      if (!finePointer.matches) playTouchWave();
      target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
    };
    cue.addEventListener('click', goToToolOptions);
    cue.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        goToToolOptions();
      }
    });
  }


  if (!finePointer.matches && 'IntersectionObserver' in window && !reduceMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        playTouchWave();
        observer.disconnect();
      }
    }, { threshold: .65 });
    observer.observe(title);
  }
}

function bindTabs() {
  const tabs = ['guide', 'search', 'browse'];
  tabs.forEach(name => {
    el(`tab-${name}`)?.addEventListener('click', () => {
      tabs.forEach(other => {
        const selected = other === name;
        el(`tab-${other}`).classList.toggle('is-active', selected);
        el(`tab-${other}`).setAttribute('aria-selected', String(selected));
        el(`${other}-panel`).hidden = !selected;
      });
      el('answerPanel').hidden = true;
      if (name === 'search') el('searchInput')?.focus();
    });
  });
}

function bindControls() {
  el('restartGuide')?.addEventListener('click', restartGuide);
  el('clearSearch')?.addEventListener('click', () => {
    if (el('searchInput')) el('searchInput').value = '';
    renderSearchResults(state.questions.slice(0, 8), 'Popular questions');
    el('searchInput')?.focus();
  });
  el('searchInput')?.addEventListener('input', event => runSearch(event.target.value));
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
  const raw = query.trim().toLowerCase();
  const clean = raw
    .replace(/first\s+nations?/g, 'indigenous aboriginal torres strait islander')
    .replace(/first-nations?/g, 'indigenous aboriginal torres strait islander');
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
  const grid = el('categoryGrid');
  const results = el('categoryResults');

  grid.innerHTML = categories.map(category => {
    const count = state.questions.filter(question => question.category === category).length;
    return `<button class="category-card" type="button" data-category="${escapeHtml(category)}" aria-pressed="false">
      <span class="category-name">${escapeHtml(category)}</span>
      <span class="result-meta">${count} question${count === 1 ? '' : 's'}</span>
    </button>`;
  }).join('');

  grid.querySelectorAll('.category-card').forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;
      const matches = state.questions.filter(question => question.category === category);

      grid.querySelectorAll('.category-card').forEach(card => {
        const selected = card === button;
        card.classList.toggle('is-selected', selected);
        card.setAttribute('aria-pressed', String(selected));
      });

      results.innerHTML = `
        <div class="category-results-header">
          <p class="eyebrow">Selected activity</p>
          <h3>${escapeHtml(category)}</h3>
          <p>${matches.length} controlled question${matches.length === 1 ? '' : 's'}</p>
        </div>
        <div class="category-question-grid">
          ${matches.map(question => resultCard(question)).join('')}
        </div>`;
      bindAnswerButtons(results);
      results.scrollIntoView({ behavior: 'smooth', block: 'start' });
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


function guidelineBasisList(items) {
  return `<ul class="guideline-basis-list">${items.map(item => {
    const url = guidelineLinks[item];
    if (!url) return `<li>${escapeHtml(item)}</li>`;
    return `<li><a href="${escapeHtml(url)}">${escapeHtml(item)}<span class="basis-link-note">View in full guidance</span></a></li>`;
  }).join('')}</ul><p class="guidance-document-link"><a href="guide.html">View the complete AI in Research guidance</a></p>`;
}

function showAnswer(id) {
  const question = state.questions.find(item => item.id === id);
  if (!question) return;
  const meta = statusMeta[question.status];
  const panel = el('answerPanel');
  const list = items => `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  const supportList = items => `<ul class="support-link-list">${items.map(item => {
    const url = supportLinks[item];
    if (!url) return `<li>${escapeHtml(item)}</li>`;
    return `<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item)}<span class="visually-hidden"> (opens in a new tab)</span></a></li>`;
  }).join('')}</ul>`;
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
      ${accordionItem('Guideline basis', guidelineBasisList(question.sections))}
      ${accordionItem('Possible support pathways', supportList(question.support))}
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
