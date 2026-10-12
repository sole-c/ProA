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

  const termsButton = document.querySelector('.terms-button');
  if (termsButton) {
    const termsDialog = document.createElement('dialog');
    termsDialog.className = 'terms-dialog';
    termsDialog.setAttribute('aria-labelledby', 'terms-title');
    termsDialog.innerHTML = `
      <div class="terms-dialog__content">
        <h2 id="terms-title">Términos y condiciones de uso</h2>
        <p>Este sitio ofrece información general sobre la Escuela ProA. Su contenido puede actualizarse para mantenerlo vigente y no reemplaza los canales oficiales de comunicación de la institución.</p>
        <p>Al navegar por el sitio, te comprometés a utilizarlo de forma responsable y con fines informativos y educativos, respetando la privacidad de las personas y los derechos sobre los contenidos publicados.</p>
        <p>No publiques ni compartas datos personales o información sensible a través de este sitio.</p>
        <button type="button" class="terms-dialog__close">Cerrar</button>
      </div>
    `;

    const termsStyles = document.createElement('style');
    termsStyles.textContent = `
      body {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
      body > footer {
        margin-top: auto;
      }
      .terms-dialog {
        width: min(90vw, 36rem);
        max-height: 85vh;
        padding: 0;
        border: 0;
        border-radius: 1rem;
        color: #191c1e;
        box-shadow: 0 20px 50px rgb(0 0 0 / 30%);
      }
      .terms-dialog::backdrop {
        background: rgb(0 0 0 / 55%);
      }
      .terms-dialog__content {
        padding: 2rem;
        font: 1rem/1.65 Poppins, sans-serif;
      }
      .terms-dialog__content h2 {
        margin: 0 0 1rem;
        color: #00355f;
        font: 700 1.4rem/1.3 Montserrat, sans-serif;
      }
      .terms-dialog__content p {
        margin: 0 0 1rem;
      }
      .terms-dialog__close {
        margin-top: 0.5rem;
        padding: 0.65rem 1.25rem;
        border: 0;
        border-radius: 0.5rem;
        background: #00355f;
        color: white;
        font: inherit;
        cursor: pointer;
      }
      .terms-dialog__close:hover {
        background: #006590;
      }
    `;

    document.head.append(termsStyles);
    document.body.append(termsDialog);
    termsButton.addEventListener('click', function() {
      termsDialog.showModal();
    });
    termsDialog.querySelector('.terms-dialog__close').addEventListener('click', function() {
      termsDialog.close();
    });
    termsDialog.addEventListener('click', function(event) {
      if (event.target === termsDialog) {
        termsDialog.close();
      }
    });
  }
});
