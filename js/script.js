document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reservationForm');
  const API_URL = 'https://script.google.com/macros/s/AKfycbyjaRQs2D9lwebdi8ToAnuh_qFQaveYoEi9eOZIhAd5Yhs_hI6RhEcBskxucW-o9eqE1A/exec';

  // Elementos UI
  const afternoonCount = document.getElementById('afternoon-count');
  const nightCount = document.getElementById('night-count');
  const horaSelect = document.getElementById('hora');
  const guestsSelect = document.getElementById('guests');
  const dateInput = document.getElementById('date');
  const submitBtn = form.querySelector('button[type="submit"]');

  // Inicializar Flatpickr
  const nextOpenDate = getNextOpenDate();
  flatpickr(dateInput, {
    defaultDate: nextOpenDate,
    dateFormat: "Y-m-d",
    minDate: "today",
    disable: [date => [1, 2].includes(date.getDay())],
    onReady: (_, dateStr, fp) => {
      dateInput.value = nextOpenDate;
      fetchAvailability(nextOpenDate);
    },
    onChange: (_, dateStr) => {
      fetchAvailability(dateStr);
      resetSelectors();
    }
  });

  function getNextOpenDate() {
    const today = new Date();
    const day = today.getDay();
    if (day === 1) today.setDate(today.getDate() + 2); // lunes
    else if (day === 2) today.setDate(today.getDate() + 1); // martes
    return today.toISOString().split('T')[0];
  }

  function resetSelectors() {
    horaSelect.innerHTML = '<option value="">Selecciona una hora</option>';
    guestsSelect.innerHTML = '<option value="">Selecciona un torn</option>';
    guestsSelect.disabled = true;
  }

  async function fetchAvailability(date) {
    try {
      const res = await fetch(`${API_URL}?date=${date}&t=${Date.now()}`);
      const data = await res.json();

      if (data.message === 'Tancat els dilluns i dimarts') {
        afternoonCount.textContent = '0';
        nightCount.textContent = '0';
        horaSelect.innerHTML = '<option value="">Tancat</option>';
        return;
      }

      if (data.success) {
        afternoonCount.textContent = data.afternoonAvailable;
        nightCount.textContent = data.nightAvailable;
        updateTimeOptions(data.afternoonAvailable, data.nightAvailable);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  function updateTimeOptions(afternoon, night) {
    const times = {
      afternoon: ["13:30", "14:00", "14:30", "15:00"],
      night: ["20:30", "21:00", "21:30", "22:00", "22:30"]
    };

    resetSelectors();

    if (afternoon > 0) {
      times.afternoon.forEach(time => {
        const option = new Option(`Tarda - ${time}`, time);
        horaSelect.add(option);
      });
    }

    if (night > 0) {
      times.night.forEach(time => {
        const option = new Option(`Nit - ${time}`, time);
        horaSelect.add(option);
      });
    }

    if (horaSelect.options.length === 1) {
      horaSelect.innerHTML = '<option value="">Sense horaris disponibles</option>';
    }
  }

  horaSelect.addEventListener('change', () => {
    const time = horaSelect.value;
    if (!time) return;

    const shift = time < '18:00' ? 'afternoon' : 'night';
    updateGuests(shift === 'afternoon'
      ? parseInt(afternoonCount.textContent)
      : parseInt(nightCount.textContent)
    );
  });

  function updateGuests(available) {
    guestsSelect.innerHTML = '';

    if (available <= 0) {
      guestsSelect.add(new Option('Sense llocs disponibles', ''));
      guestsSelect.disabled = true;
      return;
    }

    guestsSelect.disabled = false;
    const max = Math.min(available, 10);

    for (let i = 1; i <= max; i++) {
      guestsSelect.add(new Option(`${i} ${i === 1 ? 'persona' : 'persones'}`, i));
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const phoneInput = document.getElementById('phone');
    const phoneValue = phoneInput.value.trim();
    const phoneRegex = /^[67]\d{8}$/;

    // Validación básica
    if (!horaSelect.value || !guestsSelect.value) {
      showToast('Si us plau, completa tots els camps');
      return;
    }
    if (!phoneRegex.test(phoneValue)) {
      showToast('El telèfon ha de començar per 6 o 7 i tenir 9 dígits', false);
      phoneInput.focus();
      return;
    }

    const formData = new FormData(form);

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviant...';

      const res = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });

      const result = await res.json();

      if (result.success) {
        showToast('Reserva realitzada amb èxit!');
        form.reset();
        resetSelectors();
        afternoonCount.textContent = '23';
        nightCount.textContent = '23';
      } else {
        showToast(result.message || 'Error en la reserva');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error de connexió');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Reservar';
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