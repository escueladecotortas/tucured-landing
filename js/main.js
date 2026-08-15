// Archivo: js/main.js
import { initParticles } from './animations.js';
import { renderTurneroDemo, renderCatalogoDemo, renderAsistenteDemo, renderEventosDemo } from './simulators.js';

const DEMO_META = {
  turnero: {
    title: 'Turnero Web Inteligente',
    desc: 'Probá la experiencia de reserva interactiva en tiempo real.',
    render: renderTurneroDemo,
    selectValue: 'turnero'
  },
  catalogo: {
    title: 'Catálogo & Pedidos con Envío',
    desc: 'Simulá la compra de productos y el cálculo de envío por GPS.',
    render: renderCatalogoDemo,
    selectValue: 'catalogo'
  },
  asistente: {
    title: 'Asistente de Ventas por WhatsApp',
    desc: 'Simulá la atención automática y los botones de cobro 24/7.',
    render: renderAsistenteDemo,
    selectValue: 'asistente'
  },
  eventos: {
    title: 'Eventos e Invitaciones QR',
    desc: 'Probá la publicación en el muro interactivo del salón.',
    render: renderEventosDemo,
    selectValue: 'eventos'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initParticles();

  const form = document.getElementById('formContacto');
  const formWrapper = document.getElementById('formWrapper');
  const modal = document.getElementById('demoModal');
  const closeModalBtn = document.getElementById('closeModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalBody = document.getElementById('modalBody');
  const modalCta = document.getElementById('modalCta');
  const necesidadSelect = document.getElementById('necesidad');

  let activeToolKey = null;

  const scrollToContactoAndSelect = (toolKey) => {
    if (toolKey && DEMO_META[toolKey] && necesidadSelect) {
      necesidadSelect.value = DEMO_META[toolKey].selectValue;
    }
    const contactoSection = document.getElementById('contacto');
    if (contactoSection) {
      contactoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  document.querySelectorAll('.btn-consultar').forEach((btn) => {
    btn.addEventListener('click', () => {
      const toolKey = btn.getAttribute('data-tool');
      scrollToContactoAndSelect(toolKey);
    });
  });

  if (form && formWrapper) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      if (!data.nombre || !data.negocio || !data.telefono || !data.necesidad) return;

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      }).catch(err => console.warn('Netlify form submission notice:', err));

      try {
        const history = JSON.parse(localStorage.getItem('tucured_consultas') || '[]');
        history.push({ ...data, fecha: new Date().toISOString() });
        localStorage.setItem('tucured_consultas', JSON.stringify(history));
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }

      formWrapper.innerHTML = `
        <div class="success-card">
          <h3>¡Consulta recibida!</h3>
          <p>Un asesor revisará tu pedido y se pondrá en contacto a la brevedad.</p>
        </div>
      `;
    });
  }

  document.querySelectorAll('.btn-demo').forEach((btn) => {
    btn.addEventListener('click', () => {
      const toolKey = btn.getAttribute('data-tool');
      const toolInfo = DEMO_META[toolKey];
      if (!toolInfo || !modal) return;

      activeToolKey = toolKey;
      modalTitle.textContent = toolInfo.title;
      modalDesc.textContent = toolInfo.desc;
      modalBody.innerHTML = '';
      toolInfo.render(modalBody);
      modal.classList.add('active');
    });
  });

  const closeModal = () => modal && modal.classList.remove('active');

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (modalCta) {
    modalCta.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
      scrollToContactoAndSelect(activeToolKey);
    });
  }
});
