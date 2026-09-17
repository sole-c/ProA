// Menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.querySelector('.menu-toggle');
  const siteMenu = document.querySelector('.site-menu');
  
  if (menuToggle && siteMenu) {
    menuToggle.addEventListener('click', function() {
      // Toggle active class on button
      menuToggle.classList.toggle('active');
      
      // Toggle open class on menu
      siteMenu.classList.toggle('open');
      
      // Update aria attributes
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      siteMenu.setAttribute('aria-hidden', isExpanded);
    });
    
    // Close menu when clicking on a link
    const menuLinks = siteMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', function() {
        menuToggle.classList.remove('active');
        siteMenu.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        siteMenu.setAttribute('aria-hidden', 'true');
      });
    });
  }
});
