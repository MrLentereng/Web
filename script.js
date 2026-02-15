const root = document.documentElement;
const toggle = document.querySelector('#theme-toggle');
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'light') {
  root.classList.add('light');
}

toggle?.addEventListener('click', () => {
  root.classList.toggle('light');
  localStorage.setItem('theme', root.classList.contains('light') ? 'light' : 'dark');
});

const revealItems = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  },
  {
    threshold: 0.25,
  }
);

revealItems.forEach((item) => observer.observe(item));
