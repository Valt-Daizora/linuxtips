const searchInput = document.getElementById('commandSearch');
const commandRows = Array.from(document.querySelectorAll('.commands'));
const slides = Array.from(document.querySelectorAll('.slide'));
const dots = Array.from(document.querySelectorAll('.slide-dot'));
const prevButton = document.querySelector('.slide-arrow.prev');
const nextButton = document.querySelector('.slide-arrow.next');
let currentSlide = 0;

function addCopyButtons() {
  commandRows.forEach((row) => {
    if (row.closest('.slide.no-copy')) return;
    if (row.querySelector('.copy-btn')) return;

    const commandText = row.querySelector('.command strong')?.textContent.trim();
    if (!commandText) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-btn';
    button.innerHTML = '<span class="copy-icon">📋</span><span class="copy-label">Copy</span>';
    button.setAttribute('aria-label', `Copy ${commandText}`);

    button.addEventListener('click', async (event) => {
      event.stopPropagation();
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(commandText);
        } else {
          const temp = document.createElement('textarea');
          temp.value = commandText;
          document.body.appendChild(temp);
          temp.select();
          document.execCommand('copy');
          temp.remove();
        }

        button.innerHTML = '<span class="copy-icon">✅</span><span class="copy-label">Copied!</span>';
        button.classList.add('copied');
        setTimeout(() => {
          button.innerHTML = '<span class="copy-icon">📋</span><span class="copy-label">Copy</span>';
          button.classList.remove('copied');
        }, 1400);
      } catch (error) {
        button.innerHTML = '<span class="copy-icon">⚠️</span><span class="copy-label">Failed</span>';
        setTimeout(() => {
          button.innerHTML = '<span class="copy-icon">📋</span><span class="copy-label">Copy</span>';
          button.classList.remove('copied');
        }, 1400);
      }
    });

    row.appendChild(button);
  });
}

function showSlide(index, isRelative = false) {
  if (!slides.length) return;

  const visibleIndexes = slides.reduce((indexes, slide, idx) => {
    if (!slide.classList.contains('is-hidden')) {
      indexes.push(idx);
    }
    return indexes;
  }, []);

  if (!visibleIndexes.length) return;

  let targetIndex;
  if (isRelative) {
    const currentPosition = visibleIndexes.indexOf(currentSlide);
    if (currentPosition === -1) {
      targetIndex = visibleIndexes[0];
    } else {
      targetIndex = visibleIndexes[(currentPosition + index + visibleIndexes.length) % visibleIndexes.length];
    }
  } else {
    targetIndex = visibleIndexes.includes(index) ? index : visibleIndexes[0];
  }

  currentSlide = targetIndex;
  slides.forEach((slide, idx) => {
    slide.classList.toggle('active', idx === currentSlide);
  });
  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentSlide);
  });
}

function filterCommands() {
  const query = searchInput.value.trim().toLowerCase();

  commandRows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    const matches = text.includes(query);
    row.classList.toggle('is-hidden', !matches);
  });

  slides.forEach((slide) => {
    const cards = Array.from(slide.querySelectorAll('.commands'));
    const hasVisible = cards.some((row) => !row.classList.contains('is-hidden'));
    slide.classList.toggle('is-hidden', !hasVisible);
  });

  showSlide(currentSlide);
}

if (searchInput) {
  searchInput.addEventListener('input', filterCommands);
}

if (prevButton) {
  prevButton.addEventListener('click', () => showSlide(-1, true));
}

if (nextButton) {
  nextButton.addEventListener('click', () => showSlide(1, true));
}

dots.forEach((dot) => {
  dot.addEventListener('click', () => showSlide(Number(dot.dataset.slide), false));
});

addCopyButtons();
showSlide(0);