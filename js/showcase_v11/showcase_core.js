// Archivo: js/showcase_v11/showcase_core.js
// Fachada de compatibilidad para Showroom V2 (< 35L)

import { ShowcaseState } from './showcase_state.js';
import { ShowcaseController } from './showcase_controller.js';

export const ShowcaseCore = {
  init: () => ShowcaseController.init(),
  selectRubro: (r) => ShowcaseController.selectRubro(r),
  selectLevel: (l) => ShowcaseController.selectLevel(l),
  setViewMode: (m) => ShowcaseController.setViewMode(m),
  getState: () => ShowcaseState
};
