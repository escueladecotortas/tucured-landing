<!-- Archivo: .agent/skills/css_video_masking.md -->
# SKILL: Zoom y Máscara CSS sobre Lienzo de Video & Pistas Dinámicas (v10.0)

**Propósito:** Proporcionar patrones de recorte de franjas muertas de video y cambio dinámico de pistas en modales interactivos.

---

### 1. Zoom y Máscara CSS (`overflow: hidden` + `scale`)

Cuando un video vertical u optimizado en 720p/1080p contiene bordes laterales negros no deseados dentro de su encuadre grabado:

```html
<div class="video-zoom-box">
  <video src="./assets/demos/turnero.mp4" autoplay loop muted playsinline class="clean-video video-turnero"></video>
</div>
```

```css
.video-zoom-box {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  box-shadow: 0 8px 30px rgba(0,0,0,0.8);
}

.clean-video {
  width: 100%;
  max-height: 74vh;
  border-radius: 12px;
  display: block;
  object-fit: contain;
  transition: transform 0.3s ease;
}

/* Escala proporcional para recortar franjas muertas */
.video-turnero {
  transform: scale(1.38);
  transform-origin: center center;
}

@media (max-width: 640px) {
  .video-turnero {
    transform: scale(1.48);
  }
}
```

---

### 2. Doble Pista Dinámica en Modales (Cliente vs. Admin)

Permite alternar entre la vista de cliente y panel administrador sin destruir ni recargar el DOM del modal:

```html
<div class="demo-tabs">
  <button class="tab-btn active" data-vid="catalogo.mp4">Vista Cliente</button>
  <button class="tab-btn" data-vid="catalogo_admin.mp4">Panel Admin</button>
</div>
<div class="video-zoom-box">
  <video src="./assets/demos/catalogo.mp4" autoplay loop muted playsinline class="clean-video" id="demoVid"></video>
</div>
```

```javascript
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
```
