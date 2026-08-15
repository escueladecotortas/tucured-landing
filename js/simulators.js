// Archivo: js/simulators.js

function renderCleanVideoOrFallback(container, videoName, renderFallback, extraClass = '') {
  const videoPath = `./assets/demos/${videoName}.mp4`;
  container.innerHTML = `
    <div id="vidBox" class="video-zoom-box">
      <video src="${videoPath}" autoplay loop muted playsinline class="clean-video ${extraClass}" id="demoVid"></video>
    </div>
    <div id="simFallback" style="display:none;"></div>
  `;
  const vid = container.querySelector('#demoVid');
  const vidBox = container.querySelector('#vidBox');
  const fallback = container.querySelector('#simFallback');

  if (vid) {
    vid.onerror = () => {
      vidBox.style.display = 'none';
      fallback.style.display = 'block';
      renderFallback(fallback);
    };
  }
}

export function renderTurneroDemo(container) {
  renderCleanVideoOrFallback(container, 'turnero', (box) => {
    box.innerHTML = `<div class="sim-container" style="text-align:center; color:var(--text-muted);">Demo de Turnero Web en video.</div>`;
  }, 'video-turnero');
}

export function renderCatalogoDemo(container) {
  container.innerHTML = `
    <div class="demo-tabs">
      <button class="tab-btn active" data-vid="catalogo.mp4">Vista Cliente</button>
      <button class="tab-btn" data-vid="catalogo_admin.mp4">Panel Admin</button>
    </div>
    <div id="vidBox" class="video-zoom-box">
      <video src="./assets/demos/catalogo.mp4" autoplay loop muted playsinline class="clean-video" id="demoVid"></video>
    </div>
  `;
  const vid = container.querySelector('#demoVid');
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      const v = btn.getAttribute('data-vid');
      if (vid) {
        vid.src = `./assets/demos/${v}`;
        vid.play().catch(() => {});
      }
    });
  });
}

export function renderAsistenteDemo(container) {
  renderCleanVideoOrFallback(container, 'asistente', (box) => {
    box.innerHTML = `
      <div class="sim-container">
        <div style="font-size:0.85rem; color:var(--gold-primary); font-weight:700; margin-bottom:0.5rem;">[ ASISTENTE WHATSAPP 24/7 ]</div>
        <div class="sim-chat-screen" id="simChat">
          <div class="chat-msg bot">¡Hola! 🤖 Soy el asistente de Tucu Red. ¿En qué te puedo ayudar hoy?</div>
        </div>
        <div style="display:flex; gap:0.3rem; margin-top:0.4rem;">
          <button class="sim-chat-opt" data-q="Precios" data-r="Nuestros servicios parten desde $15.000.">💰 Precios</button>
          <button class="sim-chat-opt" data-q="Horarios" data-r="Atendemos consultas las 24 hs automáticas.">⏰ Horarios</button>
          <button class="sim-chat-opt" data-q="Mercado Pago" data-r="Link de cobro directo: mpago.la/demo 💳">💳 Link Pago</button>
        </div>
      </div>
    `;
    const chat = box.querySelector('#simChat');
    box.querySelectorAll('.sim-chat-opt').forEach(btn => btn.addEventListener('click', () => {
      chat.innerHTML += `<div class="chat-msg user">${btn.getAttribute('data-q')}</div>`;
      chat.scrollTop = chat.scrollHeight;
      setTimeout(() => {
        chat.innerHTML += `<div class="chat-msg bot">${btn.getAttribute('data-r')}</div>`;
        chat.scrollTop = chat.scrollHeight;
      }, 350);
    }));
  });
}

export function renderEventosDemo(container) {
  container.innerHTML = `
    <div class="demo-tabs">
      <button class="tab-btn active" data-vid="eventos.mp4">Vista Cliente</button>
      <button class="tab-btn" data-vid="eventos_admin.mp4">Panel Admin</button>
    </div>
    <div id="vidBox" class="video-zoom-box">
      <video src="./assets/demos/eventos.mp4" autoplay loop muted playsinline class="clean-video" id="demoVid"></video>
    </div>
  `;
  const vid = container.querySelector('#demoVid');
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      const v = btn.getAttribute('data-vid');
      if (vid) {
        vid.src = `./assets/demos/${v}`;
        vid.play().catch(() => {});
      }
    });
  });
}
