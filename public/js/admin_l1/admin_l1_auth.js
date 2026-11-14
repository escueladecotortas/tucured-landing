// Archivo: public/js/admin_l1/admin_l1_auth.js
// Puente de Compatibilidad PIN L1 hacia AdminPinGate Universal (Nexus OS v11.1 < 25 líneas)

(function (global) {
  global.adminL1Auth = {
    init: () => global.AdminPinGate?.init?.(),
    press: (d) => global.AdminPinGate?.press?.(d),
    del: () => global.AdminPinGate?.del?.(),
    clear: () => global.AdminPinGate?.clear?.(),
    logout: () => global.AdminPinGate?.logout?.(),
    openPinModal: () => global.AdminPinGate?.openModal?.(),
    closePinModal: () => global.AdminPinGate?.closeModal?.()
  };
})(typeof window !== 'undefined' ? window : global);
