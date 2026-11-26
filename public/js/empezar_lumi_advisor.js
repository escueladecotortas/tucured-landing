// Archivo: public/js/empezar_lumi_advisor.js
// Reglas proactivas del radar de Lumi (Pasos 1, 3, 4, 5 y 6 horarios + cupo IA) (< 165L)

(function (global) {
  function estimateHexContrastWhite(hex) {
    const clean = String(hex || '').replace('#', '');
    if (clean.length !== 6) return 4.5;
    const r = parseInt(clean.slice(0, 2), 16) || 0;
    const g = parseInt(clean.slice(2, 4), 16) || 0;
    const b = parseInt(clean.slice(4, 6), 16) || 0;
    const ext = global.TucuEmpezarColorExtract;
    if (ext && typeof ext.contrastWithWhite === 'function') return ext.contrastWithWhite(r, g, b);
    const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return 1.05 / (l + 0.05);
  }

  function suggestAccessibleHex(hex, ext) {
    const clean = String(hex || '').replace('#', '');
    if (clean.length !== 6 || typeof ext?.enforceWhiteContrast !== 'function') return '#C2410C';
    const [r, g, b] = ext.enforceWhiteContrast(
      parseInt(clean.slice(0, 2), 16) || 180,
      parseInt(clean.slice(2, 4), 16) || 83,
      parseInt(clean.slice(4, 6), 16) || 9
    );
    return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  }

  function evaluateRadar(stepIndex, st) {
    const s = st || {};
    if (stepIndex === 1) {
      const name = String(s.comercio || '').trim();
      return name
        ? { mood: 'wink', line: `${name} suena claro y cercano. Sigamos al rubro de tu negocio.`, advice: 'Ya podés avanzar para elegir tu rubro y adaptar la tipografía del celular.', actionLabel: '', apply: null }
        : { mood: 'idle', line: 'Hola, soy Lumi. Contame el nombre de tu negocio para empezar.', advice: 'Usá un nombre corto y recordable tal como te buscan en Instagram o Maps.', actionLabel: '', apply: null };
    }

    if (stepIndex === 3) {
      const isTemp = s.coverMode === 'temp' || String(s.coverId || '').startsWith('temp_');
      const style = s.coverStyle || 'editorial';
      return {
        mood: isTemp ? 'advisor' : 'idle',
        line: isTemp
          ? 'Portada temporal activada. Después podés subir tu foto real o elegir una exclusiva.'
          : 'Elegí una portada exclusiva para tu negocio o probá cómo luce en los 3 estilos.',
        advice: style === 'editorial'
          ? 'El estilo Póster Cristal o Bento Boutique separa la foto y deja aire limpio para tu logo.'
          : 'Cada portada disponible queda reservada solo para tu marca cuando confirmás el alta.',
        actionLabel: style === 'editorial' ? 'Aplicar consejo' : '',
        apply: style === 'editorial' ? (api) => api?.setCoverStyle?.('poster') : null
      };
    }

    if (stepIndex === 4) {
      const effHex = global.TucuEmpezarState?.getEffectiveAccent?.(s)?.bg || '#B45309';
      const logoSlot = global.TucuEmpezarMedia?.getSlot?.('logo');
      const lowContrast = estimateHexContrastWhite(effHex) < 3.4;
      const suggested = lowContrast ? suggestAccessibleHex(effHex, global.TucuEmpezarColorExtract) : '';
      return {
        mood: lowContrast ? 'advisor' : 'idle',
        line: logoSlot?.url
          ? 'Tu logo ya luce sobre blanco en el encabezado del turnero.'
          : 'Subí tu logo sobre blanco y definí el color principal de los botones.',
        advice: lowContrast && suggested
          ? 'El color elegido es claro sobre blanco; oscurecerlo un punto mejora la lectura en celular.'
          : 'Un color firme hace que el botón de reserva resalte apenas entran tus clientes.',
        actionLabel: lowContrast && suggested ? 'Aplicar consejo' : '',
        apply: lowContrast && suggested ? (api) => api?.applyAccentHex?.(suggested) : null
      };
    }

    if (stepIndex === 5) {
      const rem = global.TucuEmpezarTaglineAssist?.getRemaining?.() ?? 5;
      const text = String(s.bajada || '').trim();
      if (rem <= 0) {
        return {
          mood: 'advisor',
          line: 'Usaste tus 5 ideas con IA; podés elegir una sugerida o escribir tu propia frase.',
          advice: 'Tocá "Ver ideas sugeridas" debajo o escribí tu frase breve en una sola línea.',
          actionLabel: '',
          apply: null
        };
      }
      if (s.noTagline) {
        return { mood: 'idle', line: 'Portada limpia sin frase: tus clientes van directo al botón de reserva.', advice: 'Podés volver a activar una frase en una línea cuando quieras.', actionLabel: '', apply: null };
      }
      if (!text) {
        return { mood: 'advisor', line: 'Marcá 1 a 3 palabras clave o escribí una frase corta de presentación.', advice: 'Elegí hasta 3 palabras clave de tu rubro y creamos tu frase con IA.', actionLabel: '', apply: null };
      }
      return {
        mood: text.length > 46 ? 'advisor' : 'wink',
        line: text.length > 46 ? 'Tu frase está casi al límite; en menos de 45 letras se lee de un vistazo.' : 'Linda frase de presentación: clara y en una sola línea.',
        advice: 'Podés mejorar tu idea con IA o volver a tu versión original en un clic.',
        actionLabel: '',
        apply: null
      };
    }

    if (stepIndex === 6) {
      const schedErr = global.TucuEmpezarState?.validateSchedule?.(s) || '';
      if (schedErr) {
        return { mood: 'advisor', line: schedErr, advice: 'Revisá que la hora Hasta sea posterior a Desde y no se superpongan las franjas.', actionLabel: '', apply: null };
      }
      return {
        mood: 'idle',
        line: 'Contame dónde está tu local y en qué horarios recibís turnos.',
        advice: 'Elegí la dirección de la lista sugerida para confirmar tus coordenadas en el mapa.',
        actionLabel: '',
        apply: null
      };
    }

    return { mood: 'idle', line: '', advice: 'Revisá el resumen y la vista previa en vivo antes de seguir.', actionLabel: '', apply: null };
  }

  global.TucuLumiAdvisor = { evaluateRadar, estimateHexContrastWhite };
})(window);
