// Manejo del formulario de reservaciones
document.addEventListener('DOMContentLoaded', function() {
    const reservationForm = document.getElementById('reservationForm');
    
    if (reservationForm) {
        reservationForm.addEventListener('submit', function(e) {
            // Obtener los valores del formulario
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            const guests = document.getElementById('guests').value;
            const comments = document.getElementById('comments').value;

            // Validación básica
            if (!name || !email || !date || !time || !guests) {
                e.preventDefault();
                alert('Por favor complete todos los campos requeridos');
            } else {
                // Mostrar mensaje de agradecimiento después de enviar el formulario
                setTimeout(function() {
                    alert('Gracias por tu reserva, pronto te contactaremos para confirmar tu reserva');
                     reservationForm.reset();   // Limpiar el formulario
                }, 1000);
            }
        });
    }
});





    
  // --- Lógica del Menú Responsive ---
const header = document.querySelector('header');
const nav = document.querySelector('nav'); // Selecciona el <nav>
const navList = document.querySelector('nav .nav-list'); // Selecciona la lista <ul>

if (header && nav && navList) { // Verifica que existan
    // Crear botón toggle si no existe (mejor añadirlo directamente en HTML)
    // O si lo creas dinámicamente:
    let menuToggle = header.querySelector('.menu-toggle');
    if (!menuToggle) {
         menuToggle = document.createElement('button'); // Usa <button> semánticamente
         menuToggle.className = 'menu-toggle';
         menuToggle.setAttribute('aria-label', 'Abrir menú');
         menuToggle.setAttribute('aria-expanded', 'false'); // Estado inicial
         menuToggle.innerHTML = '<span></span><span></span><span></span>'; // Las líneas del icono
         // Inserta el botón en el header (ajusta según tu estructura)
         // Por ejemplo, antes de <nav>
         header.insertBefore(menuToggle, nav); 
    }
    
    // Función para mostrar/ocultar menú
function toggleMenu() {
  const nav = document.querySelector('nav');
  const menuToggle = document.querySelector('.menu-toggle');
  nav.classList.toggle('active');
  menuToggle.classList.toggle('active');
  menuToggle.setAttribute('aria-expanded', nav.classList.contains('active'));
  menuToggle.setAttribute('aria-label', nav.classList.contains('active') ? 'Cerrar menú' : 'Abrir menú');
}
document.querySelector('.menu-toggle').addEventListener('click', toggleMenu);





    // Opcional: Cerrar menú si se hace clic fuera de él
    document.addEventListener('click', function(event) {
        const isClickInsideNav = nav.contains(event.target);
        const isClickOnToggle = menuToggle.contains(event.target);
        
        if (!isClickInsideNav && !isClickOnToggle && nav.classList.contains('active')) {
            toggleMenu();
        }
    });

    // Ajustar al cambiar tamaño de pantalla
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
             // Si estamos en pantalla grande, asegura que el menú no esté 'activo'
             // y el botón toggle esté reseteado
             if (nav.classList.contains('active')) {
                  nav.classList.remove('active');
                  menuToggle.classList.remove('active');
                  menuToggle.setAttribute('aria-expanded', 'false');
                  menuToggle.setAttribute('aria-label', 'Abrir menú');
             }
        }
    });
}



    // --- Marcar enlace activo según la página actual ---
    const currentPage = window.location.pathname.split("/").pop(); // Obtiene el nombre del archivo (index.html, menu.html, etc.)
    const navLinks = document.querySelectorAll('nav ul li a');

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split("/").pop();
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) { // Considera la raíz como index.html
            link.classList.add('active');
            // Si el enlace activo está dentro del menú móvil y este está cerrado, no hacemos nada especial aquí
            // La clase 'active' se usará para estilizarlo (ver CSS)
        } else {
            link.classList.remove('active'); // Asegura que otros no estén activos
        }
    });




    // MENU
const menuItems = document.querySelectorAll('.menu-item');
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        item.classList.toggle('active');
    });
});




// MODAL PARA AMPLIAR LAS IMAGENES
 const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImg");
  const closeBtn = document.querySelector(".close");

  // Añadir evento a todas las imágenes de clase menu-item-image
  document.querySelectorAll(".menu-item-image, .ampliar-imagen").forEach(img => {
    img.addEventListener("click", function() {
      modal.style.display = "block";
      modalImg.src = this.src;
    });
  });

  // Cerrar el modal
  closeBtn.onclick = function() {
    modal.style.display = "none";
  }

  // Cerrar al hacer clic fuera de la imagen
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }