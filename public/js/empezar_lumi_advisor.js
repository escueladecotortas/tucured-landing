// Archivo: public/js/empezar_lumi_advisor.js
// Reglas proactivas del radar de Lumi (exclusividad visible en P3, P4, P5, P6 y estilo en P10) (< 130L)

(function (global) {
  function estimateHexContrastWhite(hex) {
    const clean = String(hex || '').replace('#', '');
    if (clean.length !== 6) return 4.5;
    const r = parseInt(clean.slice(0, 2), 16) || 0, g = parseInt(clean.slice(2, 4), 16) || 0, b = parseInt(clean.slice(4, 6), 16) || 0;
    const ext = global.TucuEmpezarColorExtract;
    if (ext && typeof ext.contrastWithWhite === 'function') return ext.contrastWithWhite(r, g, b);
    const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return 1.05 / (l + 0.05);
  }

  function suggestAccessibleHex(hex, ext) {
    const clean = String(hex || '').replace('#', '');
    if (clean.length !== 6 || typeof ext?.enforceWhiteContrast !== 'function') return '#C2410C';
    const res = ext.enforceWhiteContrast(
      parseInt(clean.slice(0, 2), 16) || 180,
      parseInt(clean.slice(2, 4), 16) || 83,
      parseInt(clean.slice(4, 6), 16) || 9
    );
    return res?.bg || '#C2410C';
  }

  function evaluateRadar(stepIndex, st) {
    const s = st || {};
    if (stepIndex === 1) {
      const name = String(s.comercio || '').trim();
      return name
        ? { mood: 'wink', line: `${name} suena claro y cercano. Sigamos al rubro de tu negocio.`, advice: 'Ya podés avanzar para elegir tu rubro y adaptar la tipografía del celular.', actionLabel: '', apply: null }
        : { mood: 'idle', line: 'Contame cómo se llama tu negocio para empezar a darle vida a tu App.', advice: 'Usá un nombre corto y recordable tal como te buscan en Instagram o Maps.', actionLabel: '', apply: null };
    }

    if (stepIndex === 3) {
      const isTemp = s.coverMode === 'temp' || String(s.coverId || '').startsWith('temp_');
      return {
        mood: isTemp ? 'advisor' : 'idle',
        line: isTemp
          ? 'Portada temporal activada. Después podés subir tu foto real o elegir una exclusiva.'
          : 'Elegí una portada o subí tu foto. Cada portada disponible queda reservada solo para tu marca cuando confirmás el alta.',
        advice: 'Podés alternar entre portadas en movimiento, imagen fija o tu propia fotografía vertical.',
        actionLabel: '',
        apply: null
      };
    }

    if (stepIndex === 4) {
      const effHex = global.TucuEmpezarState?.getEffectiveAccent?.(s)?.bg || '#B45309';
      const logoSlot = global.TucuEmpezarMedia?.getSlot?.('logo');
      const lowContrast = estimateHexContrastWhite(effHex) < 3.4;
      const suggested = lowContrast ? suggestAccessibleHex(effHex, global.TucuEmpezarColorExtract) : '';
      return {
        mood: lowContrast ? 'advisor' : 'idle',
        line: logoSlot?.url ? 'Tu logo ya luce sobre blanco en el encabezado del turnero.' : 'Subí tu logo sobre blanco y definí el color principal de los botones.',
        advice: lowContrast && suggested ? 'El color elegido es claro sobre blanco; oscurecerlo un punto mejora la lectura en celular.' : 'Un color firme hace que el botón de reserva resalte apenas entran tus clientes.',
        actionLabel: lowContrast && suggested ? 'Aplicar consejo' : '',
        apply: lowContrast && suggested ? (api) => api?.applyAccentHex?.(suggested) : null
      };
    }

    if (stepIndex === 5) {
      const rem = global.TucuEmpezarTaglineAssist?.getRemaining?.() ?? 5;
      const text = String(s.bajada || '').trim();
      if (rem <= 0) return { mood: 'advisor', line: 'Usaste tus 5 ideas con IA; podés elegir ideas curadas o escribir tu propia frase.', advice: 'Probá "Ver otras 3" arriba para descubrir más eslóganes sin consumir IA.', actionLabel: '', apply: null };
      if (s.noTagline) return { mood: 'idle', line: 'Portada limpia sin frase: tus clientes van directo al botón de reserva.', advice: 'Podés volver a incluir una frase en una línea cuando quieras.', actionLabel: '', apply: null };
      if (!text) return { mood: 'advisor', line: 'Elegí una idea lista, generá una con IA o escribí tu propio eslogan.', advice: 'Las ideas listas te permiten comparar sin gastar cupo de IA.', actionLabel: '', apply: null };
      return { mood: text.length > 46 ? 'advisor' : 'wink', line: text.length > 46 ? 'Tu frase está casi al límite; en menos de 45 letras se lee de un vistazo.' : 'Linda frase de presentación: clara y en una sola línea.', advice: 'Podés compararla con otra sugerencia en la casilla de IA sin perder la tuya.', actionLabel: '', apply: null };
    }

    if (stepIndex === 6) {
      const schedErr = global.TucuEmpezarState?.validateSchedule?.(s) || '';
      if (schedErr) return { mood: 'advisor', line: schedErr, advice: 'Revisá que la hora Hasta sea posterior a Desde y no se superpongan las franjas.', actionLabel: '', apply: null };
      return { mood: 'idle', line: 'Contame dónde está tu local y en qué horarios recibís turnos.', advice: 'Elegí la dirección de la lista sugerida para confirmar tus coordenadas en el mapa.', actionLabel: '', apply: null };
    }

    if (stepIndex === 10) {
      const style = s.coverStyle || 'editorial';
      return {
        mood: 'idle',
        line: 'Elegí el estilo visual de tu portada, revisá cada detalle y activá tu Mes Fundador.',
        advice: style === 'editorial' ? 'Probá Póster Cristal o Bento Boutique en 1 toque para ver cómo luce tu portada final.' : 'Cuando confirmes, tu portada y tu link quedan reservados para tu negocio.',
        actionLabel: style === 'editorial' ? 'Probar Póster Cristal' : '',
        apply: style === 'editorial' ? (api) => api?.setCoverStyle?.('poster') : null
      };
    }

    return { mood: 'idle', line: '', advice: 'Revisá la vista previa en vivo antes de avanzar.', actionLabel: '', apply: null };
  }

  global.TucuLumiAdvisor = { evaluateRadar, estimateHexContrastWhite };
})(window);