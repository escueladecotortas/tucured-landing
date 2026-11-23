// Archivo: public/js/admin_shared/admin_features.js
// Registro modular único de capacidades por nivel (Esencial, Gestión, Equipos) y Add-ons (< 110L)

(function (global) {
  const PLAN_META = {
    l1: {
      id: 'l1',
      name: 'Esencial',
      title: 'Admin · Esencial',
      badge: 'Plan Esencial',
      features: {
        agenda: true,
        deposits: true,
        holidays2026: true,
        splitHours: true,
        crm: false,
        vacations: false,
        multiStaff: false,
        autoConfirm2h: false
      }
    },
    l2: {
      id: 'l2',
      name: 'Gestión',
      title: 'Admin · Gestión',
      badge: 'Plan Gestión',
      features: {
        agenda: true,
        deposits: true,
        holidays2026: true,
        splitHours: true,
        crm: true,
        vacations: true,
        multiStaff: false,
        autoConfirm2h: false
      }
    },
    l3: {
      id: 'l3',
      name: 'Equipos',
      title: 'Admin · Equipos',
      badge: 'Plan Equipos',
      features: {
        agenda: true,
        deposits: true,
        holidays2026: true,
        splitHours: true,
        crm: true,
        vacations: true,
        multiStaff: true,
        autoConfirm2h: true
      }
    }
  };

  const ADDONS_CATALOG = {
    mercadoPago: { id: 'mercadoPago', name: 'Cobro Online Mercado Pago', category: 'pagos', enabledByDefault: false },
    whatsappPro: { id: 'whatsappPro', name: 'WhatsApp Oficial Multidispositivo', category: 'mensajeria', enabledByDefault: false },
    cumpleanos: { id: 'cumpleanos', name: 'Saludito Automático de Cumpleaños', category: 'fidelizacion', enabledByDefault: false }
  };

  const normLevel = (level) => {
    const k = String(level || 'l1').toLowerCase().trim();
    return PLAN_META[k] ? k : 'l1';
  };

  function getPlanMeta(level) {
    return PLAN_META[normLevel(level)];
  }

  function getOverrides(level) {
    const key = `tucu_${normLevel(level)}_feature_overrides`;
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  // Prioridad de resolución: overrides explícitos > overrides persistidos > plan > add-on
  function hasFeature(level, key, overrides) {
    if (!key) return false;
    const plan = getPlanMeta(level);
    if (overrides && typeof overrides === 'object' && Object.prototype.hasOwnProperty.call(overrides, key)) {
      return Boolean(overrides[key]);
    }
    const stored = getOverrides(level);
    if (Object.prototype.hasOwnProperty.call(stored, key)) {
      return Boolean(stored[key]);
    }
    if (Object.prototype.hasOwnProperty.call(plan.features, key)) {
      return Boolean(plan.features[key]);
    }
    if (ADDONS_CATALOG[key]) {
      return Boolean(ADDONS_CATALOG[key].enabledByDefault);
    }
    return false;
  }

  function getActiveFeatures(level, overrides) {
    const plan = getPlanMeta(level);
    const out = {};
    Object.keys(plan.features).forEach((k) => { out[k] = hasFeature(level, k, overrides); });
    Object.keys(ADDONS_CATALOG).forEach((k) => { out[k] = hasFeature(level, k, overrides); });
    return out;
  }

  global.AdminFeatures = { PLAN_META, ADDONS_CATALOG, getPlanMeta, getOverrides, hasFeature, getActiveFeatures };
})(typeof window !== 'undefined' ? window : global);
