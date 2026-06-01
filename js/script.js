document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reservationForm');
  
    if (form) {
      const API_URL = 'https://script.google.com/macros/s/AKfycbz7IKm3zUN1O6hJW-EV-ThvkF7tgAeX9GTxPgqRpgoPE9LKZ7q5k4fW-QGehnoKKNyMwQ/exec';
      
      const horaSelect = document.getElementById('hora');
      const guestsSelect = document.getElementById('guests');
      const dateInput = document.getElementById('date');
      const submitBtn = form.querySelector('button[type="submit"]');
  
      // 1. CALENDARIO: Bloqueamos Lunes (1) y Martes (2)
      const nextOpenDate = getNextOpenDate();
      
      flatpickr(dateInput, {
        defaultDate: nextOpenDate,
        dateFormat: "Y-m-d",
        minDate: "today",
        disable: [
          function(date) {
              return (date.getDay() === 1 || date.getDay() === 2);
          }
        ],
        locale: {
          firstDayOfWeek: 1 // La semana empieza en lunes
        },
        onReady: () => {
          dateInput.value = nextOpenDate;
          fetchAvailability(nextOpenDate);
        },
        onChange: (_, dateStr) => {
          fetchAvailability(dateStr);
        }
      });
  
      function getNextOpenDate() {
        const today = new Date();
        const day = today.getDay();
        if (day === 1) today.setDate(today.getDate() + 2);
        else if (day === 2) today.setDate(today.getDate() + 1);
        return today.toISOString().split('T')[0];
      }
  
      function parseDateLocal(dateString) {
        if (!dateString) return new Date();
        const parts = dateString.split('-'); 
        return new Date(parts[0], parts[1] - 1, parts[2]);
      }
  
      function resetSelectors() {
        horaSelect.innerHTML = '<option value="">Selecciona una hora</option>';
        guestsSelect.innerHTML = '<option value="">Selecciona un torn</option>';
        guestsSelect.disabled = true;
      }
  
      async function fetchAvailability(date) {
        try {
          horaSelect.innerHTML = '<option value="">Carregant...</option>';
          guestsSelect.disabled = true;
  
          const res = await fetch(`${API_URL}?date=${date}&t=${Date.now()}`);
          const data = await res.json();
  
          if (data.success) {
            updateTimeOptions(data, date);
          } else {
              horaSelect.innerHTML = '<option value="">Error al carregar</option>';
          }
        } catch (error) {
          console.error('Error:', error);
          horaSelect.innerHTML = '<option value="">Error de connexió</option>';
        }
      }
  
      function updateTimeOptions(data, dateStr) {
        resetSelectors();
        
        // Datos de disponibilidad sincronizados con el nuevo Apps Script
        const afternoon = data.afternoonAvailable;
        const night1 = data.night1Available;
        const night2 = data.night2Available;
        const night3 = data.night3Available; 
  
        const times = {
          afternoon: ["13:30", "14:00", "14:30"], // Actualizado al nuevo horario de mediodía
          night1: ["20:30"], 
          night2: ["21:30"],
          night3: ["22:30"]
        };
  
        let optionsAdded = 0;
  
        // --- TURNO MEDIODÍA ---
        // Si el Apps Script envía que está cerrado (Mie/Jue), afternoon será 0 y no se añadirán
        if (afternoon > 0) {
          times.afternoon.forEach(time => {
            horaSelect.add(new Option(`Tarda - ${time}`, time));
            optionsAdded++;
          });
        }
  
        // --- LÓGICA DE CENAS ---
        // Se aplica para todas las noches de apertura (Miércoles a Domingo)
        if (night1 > 0) {
            times.night1.forEach(time => {
                horaSelect.add(new Option(`Nit - ${time}`, time));
                optionsAdded++;
            });
        }
        if (night2 > 0) {
            times.night2.forEach(time => {
                horaSelect.add(new Option(`Nit - ${time}`, time));
                optionsAdded++;
            });
        }
        if (night3 > 0) {
            times.night3.forEach(time => {
                horaSelect.add(new Option(`Nit - ${time}`, time));
                optionsAdded++;
            });
        }
  
        if (optionsAdded === 0) {
          horaSelect.innerHTML = '<option value="">Complet o Tancat</option>';
        }
      }
  
      horaSelect.addEventListener('change', () => {
        const time = horaSelect.value;
        if (!time) return;
  
        // Lógica simplificada para saber qué cupo revisar según el nuevo formato
        let shiftType = 'afternoon'; // Por defecto tarde
        
        if (time === '20:30') shiftType = 'night1';
        else if (time === '21:30') shiftType = 'night2';
        else if (time === '22:30') shiftType = 'night3';
  
        fetch(`${API_URL}?date=${dateInput.value}&t=${Date.now()}`)
          .then(res => res.json())
          .then(data => {
            let available = 0;
            
            if (shiftType === 'afternoon') available = data.afternoonAvailable;
            else if (shiftType === 'night1') available = data.night1Available;
            else if (shiftType === 'night2') available = data.night2Available;
            else if (shiftType === 'night3') available = data.night3Available;
            
            updateGuests(available);
          });
      });
  
      function updateGuests(available) {
        guestsSelect.innerHTML = '';
        guestsSelect.disabled = false;
  
        if (available <= 0) {
          guestsSelect.add(new Option('Sense llocs', ''));
          guestsSelect.disabled = true;
          return;
        }
  
        guestsSelect.add(new Option('Persones...', ''));
        const max = Math.min(available, 10);
        
        for (let i = 1; i <= max; i++) {
          guestsSelect.add(new Option(`${i} ${i === 1 ? 'persona' : 'persones'}`, i));
        }
      }
  
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const phoneInput = document.getElementById('phone');
        const phoneRegex = /^[67]\d{8}$/;
  
        if (!horaSelect.value || !guestsSelect.value) {
          showToast('Si us plau, completa tots els camps', false);
          return;
        }
        if (!phoneRegex.test(phoneInput.value)) {
          showToast('Telèfon incorrecte (9 dígits, comença per 6 o 7)', false);
          return;
        }
  
        const formData = new FormData(form);
        
        try {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Enviant...';
  
          const res = await fetch(API_URL, { method: 'POST', body: formData });
          const result = await res.json();
  
          if (result.success) {
            showToast('Reserva confirmada!', true);
            form.reset();
            resetSelectors();
            fetchAvailability(dateInput.value);
          } else {
            showToast('Error: ' + result.message, false);
          }
        } catch (error) {
          showToast('Error de connexió', false);
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Reservar';
        }
      });
    }
  
    function showToast(message, success = true) {
      let toast = document.getElementById('toast'); 
      if (toast && toast.length > 0 && typeof toast !== 'object') { }
      
      if (toast) {
          if (toast instanceof HTMLCollection || toast instanceof NodeList) {
             toast = toast[0];
          }
          toast.textContent = message;
          toast.style.backgroundColor = success ? '#28a745' : '#dc3545';
          toast.className = "toast show";
          setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
      }
    }
  
    const header = document.querySelector('header');
    const nav = document.querySelector('nav'); 
    if (header && nav) {
      let menuToggle = header.querySelector('.menu-toggle');
      if(menuToggle) {
          menuToggle.addEventListener('click', () => {
              nav.classList.toggle('active');
              menuToggle.classList.toggle('active');
          });
      }
    }
  });