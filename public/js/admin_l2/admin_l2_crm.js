// Archivo: public/js/admin_l2/admin_l2_crm.js
// Orquestador Unificado CRM & Clientes L2 (< 25 líneas)

(function (global) {
  function init() {
    global.AdminContactsManager?.mount?.({
      containerId: 'l2-contacts-mount',
      level: 'l2',
      getRubro: () => localStorage.getItem('tucu_l2_rubro') || 'estetica',
      onToast: (m, t) => global.adminL2Core?.showToast(m, t)
    });
  }

  global.adminL2CRM = { init };
})(typeof window !== 'undefined' ? window : global);
