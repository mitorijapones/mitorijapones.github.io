document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reservationForm');
  const messageBox = document.getElementById('reservation-message');
  const afternoonCount = document.getElementById('afternoon-count');
  const nightCount = document.getElementById('night-count');
  const dateInput = document.getElementById('date');
  const shiftSelect = document.getElementById('shift');
  const guestsSelect = document.getElementById('guests');
  const submitBtn = form.querySelector('button[type="submit"]');

  const API_URL = 'https://script.google.com/macros/s/AKfycbzv3KUCIoWAgKNGUbkgfI1YxdhN59ZBobxgLHXpG8s9fCJiMblSyxqK3xBcvjtpUVINdQ/exec';

  let availability = {};

  // Inicializar Flatpickr
  flatpickr("#date", {
    dateFormat: "Y-m-d",
    minDate: "today",
    disable: [
      function (date) {
        return date.getDay() === 1 || date.getDay() === 2; // lunes o martes
      }
    ],
    defaultDate: (() => {
      const now = new Date();
      const day = now.getDay();
      const target = new Date(now);
      if (day === 1) target.setDate(now.getDate() + 2); // lunes → miércoles
      else if (day === 2) target.setDate(now.getDate() + 1); // martes → miércoles
      return target;
    })(),
    onReady: function (selectedDates, dateStr) {
      fetchAvailability(dateStr);
    },
    onChange: function (selectedDates, dateStr) {
      if (dateStr) fetchAvailability(dateStr);
    }
  });

  async function fetchAvailability(date) {
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_URL}?date=${date}&t=${timestamp}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      console.log('Disponibilidad:', data);

      if (data.success) {
        afternoonCount.textContent = data.afternoonAvailable;
        nightCount.textContent = data.nightAvailable;
        availability = {
          afternoon: data.afternoonAvailable,
          night: data.nightAvailable
        };

        messageBox.style.display = 'none';
        updateGuestsOptions(shiftSelect.value);
      }

      if (data.message) {
        messageBox.textContent = data.message;
        messageBox.style.display = 'block';
      }

    } catch (error) {
      console.error('Error en disponibilidad:', error);
      messageBox.textContent = 'Error al conectar. Intenta nuevamente.';
      messageBox.style.display = 'block';
    }
  }

  shiftSelect.addEventListener('change', () => {
    updateGuestsOptions(shiftSelect.value);
  });

  function updateGuestsOptions(shift) {
    guestsSelect.innerHTML = '';
    const maxAvailable = availability[shift];

    if (!maxAvailable || maxAvailable <= 0) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'Sense llocs disponibles';
      guestsSelect.appendChild(option);
      guestsSelect.disabled = true;
      submitBtn.disabled = true;
    } else {
      guestsSelect.disabled = false;
      submitBtn.disabled = false;

      for (let i = 1; i <= Math.min(maxAvailable, 10); i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i} ${i === 1 ? 'persona' : 'persones'}`;
        guestsSelect.appendChild(option);
      }
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const phoneValue = form.phone.value.trim();

    // Validación robusta del teléfono
    const phoneRegex = /^[67]\d{8}$/;

     if (!phoneRegex.test(phoneValue)) {
    showToast('El número de telèfon ha de tenir 9 dígits i començar per 6 o 7.', false);
    form.phone.focus();
    return;
  }



    const formData = new FormData();
    formData.append('name', form.name.value.trim());
    formData.append('email', form.email.value.trim());
    formData.append('phone', form.phone.value.trim());
    formData.append('date', form.date.value);
    formData.append('shift', form.shift.value);
    formData.append('guests', form.guests.value);
    formData.append('comments', form.comments.value.trim());


    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });

      const resultText = await response.text();
      console.log('Respuesta cruda:', resultText);

      let result;
      try {
        result = JSON.parse(resultText);
      } catch (err) {
        throw new Error('Respuesta no válida: ' + resultText);
      }

      if (result.success) {
        showToast('¡Reserva realitzada amb èxit!', true);
        form.reset();
        availability = {};
        afternoonCount.textContent = '23';
        nightCount.textContent = '23';
        guestsSelect.disabled = true;
        submitBtn.disabled = true;
      } else {
        showToast('Error al registrar la reserva', false);
      }
    } catch (error) {
      console.error('Error al enviar reserva:', error);
      messageBox.textContent = 'No se pudo conectar con el servidor.';
      messageBox.style.color = 'red';
      messageBox.style.display = 'block';
    }
  });
});

function showToast(message, success = true) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.backgroundColor = success ? '#28a745' : '#dc3545'; // verde o rojo
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}


// --- Acordeón para secciones con toggle-title ---
document.querySelectorAll('.toggle-title').forEach(title => {
  title.addEventListener('click', () => {
    const content = title.nextElementSibling;
    if (content && content.classList.contains('toggle-content')) {
      content.classList.toggle('open');
    }
  });
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
  document.addEventListener('click', function (event) {
    const isClickInsideNav = nav.contains(event.target);
    const isClickOnToggle = menuToggle.contains(event.target);

    if (!isClickInsideNav && !isClickOnToggle && nav.classList.contains('active')) {
      toggleMenu();
    }
  });

  // Ajustar al cambiar tamaño de pantalla
  window.addEventListener('resize', function () {
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
  img.addEventListener("click", function () {
    modal.style.display = "block";
    modalImg.src = this.src;
  });
});

// Cerrar el modal
closeBtn.onclick = function () {
  modal.style.display = "none";
}

// Cerrar al hacer clic fuera de la imagen
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

document.querySelectorAll('.experience-card-link').forEach(link => {
  link.addEventListener('click', function (event) {
    let target = event.target;
    while (target !== link) {
      if (target.classList.contains('ampliar-imagen')) {
        event.preventDefault();
        return;
      }
      target = target.parentNode;
    }
  });
});