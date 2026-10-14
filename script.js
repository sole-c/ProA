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
        <h2 id="terms-title">Términos y Condiciones de Uso – Proyecto ProA</h2>
        <p><strong>Última actualización:</strong> 23 de septiembre de 2026</p>

        <p><strong>1. Introducción</strong><br>
        Bienvenido al sitio web del proyecto ProA. Este sitio ha sido desarrollado con fines educativos e informativos como un proyecto estudiantil por el equipo conformado por: Acuña, Bracamonte, Castillo, Lopez, Quialvo y Zarate, perteneciente a la Escuela Experimental con Énfasis en TIC PROA, Sede Capital Norte. Al navegar por este sitio, aceptas estos términos de uso de manera sencilla y transparente.</p>

        <p><strong>2. Propósito del sitio</strong><br>
        Este sitio web es meramente informativo y educativo. Su objetivo es mostrar información sobre la institución, sus instalaciones, planes de estudio, equipo de orientación y novedades. Todo el contenido se proporciona "tal cual" y el equipo de desarrollo no se hace responsable por posibles errores tipográficos o desactualizaciones en la información.</p>

        <p><strong>3. Propiedad Intelectual</strong><br>
        Todo el contenido de esta página, incluyendo el diseño, los textos, el código fuente (HTML, CSS, JavaScript) y las imágenes, es propiedad del equipo de desarrollo de ProA y de la institución educativa. Queda prohibida la copia, reproducción o uso de este material con fines comerciales sin el permiso previo de los autores. Se permite su uso con fines educativos o de investigación, siempre que se cite la fuente original.</p>

        <p><strong>4. Derecho a la Propia Imagen y Autorizaciones</strong><br>
        Todas las fotografías, videos o registros que se publican en este sitio web, en los que puedan aparecer estudiantes, docentes, personal o visitantes, cuentan con el debido respaldo legal de la institución. La Escuela Experimental con Énfasis en TIC ProA Sede Capital Norte, garantiza que se han obtenido las autorizaciones de uso de imagen y voz correspondientes de todas las personas que aparecen en ellas, conforme a lo establecido en el Código Civil y Comercial de la Nación y la Ley 11.723 de Propiedad Intelectual. Dichas autorizaciones se gestionan de la siguiente manera:</p>
        <ul>
          <li>Docentes y personal mayor de edad: firman personalmente su propia autorización de uso de imagen y voz.</li>
          <li>Estudiantes menores de edad: la autorización es firmada por su padre, madre o tutor legal, quienes otorgan el consentimiento expreso para la publicación de las imágenes en los medios digitales de la institución.</li>
        </ul>

        <p><strong>5. Privacidad y Datos Personales</strong><br>
        Este sitio web es puramente informativo y no cuenta con formularios, registros de usuarios ni sistemas que recolecten datos personales. La sección de "Contacto" únicamente muestra información pública de la secretaría de la institución (teléfono, correo electrónico institucional y dirección) para que los visitantes puedan comunicarse por sus propios medios. Por lo tanto, no se almacena, procesa ni comparte ninguna información personal de los visitantes, en cumplimiento con la Ley 25.326 de Protección de Datos Personales.</p>

        <p><strong>6. Enlaces a otros sitios</strong><br>
        El sitio puede contener enlaces o mapas interactivos (como Google Maps) que dirigen a páginas o servicios externos. El equipo de ProA no administra ni se hace responsable por el contenido, la veracidad o las prácticas de privacidad de esos sitios externos.</p>

        <p><strong>7. Ley Aplicable y Jurisdicción</strong><br>
        Este sitio se rige por las leyes de la República Argentina. Cualquier cuestión relacionada con el uso de este sitio web se resolverá en los tribunales competentes de la ciudad de Córdoba.</p>

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
        overflow-y: auto;
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

    const termsContent = termsDialog.querySelector('.terms-dialog__content');
    termsContent.setAttribute('tabindex', '-1');

    document.head.append(termsStyles);
    document.body.append(termsDialog);
    termsButton.addEventListener('click', function() {
      termsDialog.showModal();
      termsDialog.scrollTop = 0;
      termsContent.focus();
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
