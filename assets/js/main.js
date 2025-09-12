const sidebar = document.querySelector('.sidebar');
const toggle = document.querySelector('.nav-toggle');

if (sidebar && toggle) {
  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  });
}

export function showLoader() {
  const l = document.querySelector('.loader');
  if (l) l.hidden = false;
}

export function hideLoader() {
  const l = document.querySelector('.loader');
  if (l) l.hidden = true;
}
