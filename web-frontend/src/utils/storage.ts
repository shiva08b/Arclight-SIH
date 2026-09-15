import { ProductInspectionRecord } from '../types';
import { INITIAL_INSPECTION_RECORDS } from '../data/seedRecords';

const STORAGE_KEY = 'labellens_inspection_history_v1';

export function getStoredRecords(): ProductInspectionRecord[] {
  if (typeof window === 'undefined') return INITIAL_INSPECTION_RECORDS;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INSPECTION_RECORDS));
      return INITIAL_INSPECTION_RECORDS;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_INSPECTION_RECORDS;
  } catch (e) {
    console.error('Error reading from localStorage', e);
    return INITIAL_INSPECTION_RECORDS;
  }
}

export function saveRecord(record: ProductInspectionRecord): ProductInspectionRecord[] {
  const current = getStoredRecords();
  const existingIdx = current.findIndex((r) => r.id === record.id);
  let updated: ProductInspectionRecord[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = record;
  } else {
    updated = [record, ...current];
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
  return updated;
}

export function deleteRecord(id: string): ProductInspectionRecord[] {
  const current = getStoredRecords();
  const updated = current.filter((r) => r.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete from localStorage', e);
  }
  return updated;
}

export function resetToSeedData(): ProductInspectionRecord[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INSPECTION_RECORDS));
  } catch (e) {
    console.error('Failed to reset localStorage', e);
  }
  return INITIAL_INSPECTION_RECORDS;
}

export const resetToDefaults = resetToSeedData;
