import {parseSave} from './save-validation.js';
export const SAVE_KEY = 'greenlight-save-v1';

// Reading never writes, including when parsing or migration fails.
export function loadSave(storage, createFresh) {
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (raw === null) return {state:createFresh(), blocked:false, raw:null, warning:''};
    try {
      return {state:parseSave(raw), blocked:false, raw:null, warning:''};
    } catch {
      return {state:createFresh(), blocked:true, raw, warning:'The saved game could not be loaded. Its original data is preserved. Download it before choosing a replacement.'};
    }
  } catch {
    return {state:createFresh(), blocked:false, raw:null, warning:'Local saving is unavailable. Export a save to keep your progress.'};
  }
}
