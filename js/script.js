document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reservationForm');
  const API_URL = 'https://script.google.com/macros/s/AKfycbyjaRQs2D9lwebdi8ToAnuh_qFQaveYoEi9eOZIhAd5Yhs_hI6RhEcBskxucW-o9eqE1A/exec';

  // Elementos UI
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
    disable: [date => [1, 2].includes(date.getDay())], // lunes y martes
    onReady: () => {
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
        horaSelect.innerHTML = '<option value="">Tancat</option>';
        return;
      }

      if (data.success) {
        updateTimeOptions(data.afternoonAvailable, data.nightAvailable);
      }
    } catch (error) {
      console.error('Error:', error);
      horaSelect.innerHTML = '<option value="">Error en disponibilitat</option>';
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
        const option = new Option(`Tarda - ${time} (${afternoon} llocs)`, time);
        horaSelect.add(option);
      });
    }

    if (night > 0) {
      times.night.forEach(time => {
        const option = new Option(`Nit - ${time} (${night} llocs)`, time);
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

    fetch(`${API_URL}?date=${dateInput.value}&t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        const available = shift === 'afternoon' ? data.afternoonAvailable : data.nightAvailable;
        updateGuests(available);
      })
      .catch(err => console.error('Error obtenint disponibilitat:', err));
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

    // Validaciones
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

      const res = await fetch(API_URL, { method: 'POST', body: formData });
      const result = await res.json();

      if (result.success) {
        showToast('Reserva realitzada amb èxit!');
        form.reset();
        resetSelectors();
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
  toast.style.backgroundColor = success ? '#28a745' : '#dc3545';
  toast.classList.add('show');

  setTimeout(() => toast.classList.remove('show'), 4000);
}

// --- Menú Responsive ---
const header = document.querySelector('header');
const nav = document.querySelector('nav'); 
const navList = document.querySelector('nav .nav-list'); 

if (header && nav && navList) {
  let menuToggle = header.querySelector('.menu-toggle');

  if (!menuToggle) {
    menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.setAttribute('aria-label', 'Abrir menú');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.innerHTML = '<span></span><span></span><span></span>';
    header.insertBefore(menuToggle, nav);
  }

  function toggleMenu() {
    nav.classList.toggle('active');
    menuToggle.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', nav.classList.contains('active'));
    menuToggle.setAttribute(
      'aria-label',
      nav.classList.contains('active') ? 'Cerrar menú' : 'Abrir menú'
    );
  }

  menuToggle.addEventListener('click', toggleMenu);

  document.addEventListener('click', function (event) {
    if (!nav.contains(event.target) && !menuToggle.contains(event.target) && nav.classList.contains('active')) {
      toggleMenu();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 768 && nav.classList.contains('active')) {
      nav.classList.remove('active');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Abrir menú');
    }
  });
}
