const currentPage = document.body.dataset.page || 'home';
const assetRoot = document.body.dataset.assetRoot || '../assets';
const submissionEndpoint = document.body.dataset.apiUrl || '../backend/api/submit.php';

const pages = [
  ['home', 'Home', 'index.html'],
  ['about', 'About Us', 'about.html'],
  ['services', 'Services', 'services.html'],
  ['team', 'Management', 'team.html'],
  ['careers', 'Careers', 'careers.html'],
  ['gallery', 'Gallery', 'gallery.html'],
];

const header = document.querySelector('[data-site-header]');
if (header) {
  header.innerHTML = `
    <div class="topbar"><div class="shell"><span>Serving clients across Nagaland</span><div class="topbar__right"><a href="tel:+919863387321">+91 98633 87321</a><a href="mailto:hamtheimenhahu@gmail.com">hamtheimenhahu@gmail.com</a></div></div></div>
    <header class="site-header">
      <nav class="nav shell" aria-label="Primary navigation">
        <a class="brand" href="index.html" aria-label="Eastern Sky home">
          <img class="brand__mark" src="${assetRoot}/images/eastern-sky-logo.jpeg" alt="Eastern Sky eagle emblem">
          <span class="brand__copy"><strong>EASTERN SKY</strong><small>Private Security Agency</small></span>
        </a>
        <button class="nav-toggle" type="button" aria-label="Open navigation" aria-expanded="false">☰</button>
        <div class="nav__links">
          ${pages.map(([key, label, href]) => `<a href="${href}" ${currentPage === key ? 'aria-current="page"' : ''}>${label}</a>`).join('')}
          <a class="nav__cta" href="contact.html" ${currentPage === 'contact' ? 'aria-current="page"' : ''}>Contact Us</a>
        </div>
      </nav>
    </header>`;
}

const footer = document.querySelector('[data-site-footer]');
if (footer) {
  footer.innerHTML = `
    <footer class="site-footer">
      <div class="shell footer__main">
        <div class="footer__brand">
          <a class="brand" href="index.html"><img class="brand__mark" src="${assetRoot}/images/eastern-sky-logo.jpeg" alt=""><span class="brand__copy"><strong>EASTERN SKY</strong><small>Private Security Agency</small></span></a>
          <p>Reliable, disciplined and professional security personnel protecting people, property and premises throughout Nagaland.</p>
        </div>
        <div><h2 class="footer__heading">Explore</h2><div class="footer__links"><a href="about.html">About us</a><a href="services.html">Our services</a><a href="team.html">Management team</a><a href="careers.html">Careers</a><a href="gallery.html">Gallery</a></div></div>
        <div><h2 class="footer__heading">Contact</h2><div class="footer__links"><a href="tel:+919863387321">+91 98633 87321</a><a href="tel:+917085481672">+91 70854 81672</a><a href="mailto:hamtheimenhahu@gmail.com">hamtheimenhahu@gmail.com</a><span>Medical Colony, Longleng<br>Nagaland – 798625</span></div></div>
      </div>
      <div class="footer__bottom"><div class="shell"><span>© <span data-year></span> Eastern Sky Private Security Agency.</span><span>Professional Security. Trusted Protection.</span></div></div>
    </footer>
    <a class="floating-call" href="tel:+919863387321" aria-label="Call Eastern Sky">☎</a>`;
}

document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav__links');
toggle?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  document.body.classList.toggle('menu-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? '✕' : '☰';
});
navLinks?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    document.body.classList.remove('menu-open');
    toggle?.setAttribute('aria-expanded', 'false');
    if (toggle) toggle.textContent = '☰';
  });
});

const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 }) : null;
document.querySelectorAll('.reveal').forEach((el) => observer ? observer.observe(el) : el.classList.add('visible'));

document.querySelectorAll('[data-gallery-src]').forEach((button) => {
  button.addEventListener('click', () => {
    const lightbox = document.querySelector('.lightbox');
    const image = lightbox?.querySelector('img');
    if (!lightbox || !image) return;
    image.src = button.dataset.gallerySrc;
    image.alt = button.dataset.galleryAlt || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  });
});
const closeLightbox = () => {
  const lightbox = document.querySelector('.lightbox');
  lightbox?.classList.remove('open');
  lightbox?.setAttribute('aria-hidden', 'true');
};
document.querySelector('.lightbox__close')?.addEventListener('click', closeLightbox);
document.querySelector('.lightbox')?.addEventListener('click', (event) => { if (event.target.classList.contains('lightbox')) closeLightbox(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeLightbox(); });

document.querySelectorAll('[data-email-form]').forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const kind = form.dataset.emailForm;
    data.set('submission_type', kind);
    const subject = kind === 'career' ? `Career enquiry — ${data.get('name')}` : `Security service enquiry — ${data.get('name')}`;
    const lines = Array.from(data.entries()).filter(([key]) => key !== 'website').map(([key, value]) => `${key.replaceAll('-', ' ')}: ${value}`);
    const status = form.querySelector('.form-status');
    const submit = form.querySelector('button[type="submit"]');
    status?.classList.remove('visible', 'error');
    if (submit) submit.disabled = true;

    try {
      const response = await fetch(submissionEndpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.message || 'The enquiry could not be saved.');
      }
      if (status) {
        status.textContent = result.message;
        status.classList.add('visible');
      }
      form.reset();
    } catch (error) {
      if (status) {
        status.textContent = `${error.message} Opening your email app as a backup.`;
        status.classList.add('visible', 'error');
      }
      window.location.href = `mailto:hamtheimenhahu@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    } finally {
      if (submit) submit.disabled = false;
    }
  });
});
