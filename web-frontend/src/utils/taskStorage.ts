import { InspectionTask } from '../types';

const TASKS_STORAGE_KEY = 'labellens_inspection_tasks_v1';

export const INITIAL_TASKS: InspectionTask[] = [
  {
    id: 'task-001',
    taskNumber: 'TASK-DL-2025-081',
    title: 'City Supermart Market Audit',
    storeName: 'City Retail Supermart',
    location: 'Sector 18, Commercial Complex',
    category: 'Spices & Packaged Grocery',
    dueDate: 'Today, 5:00 PM',
    targetCount: 6,
    completedCount: 2,
    status: 'In Progress',
    priority: 'High',
    assignedTo: 'Insp. R. Sharma (DL-4092)',
    notes: 'Verify Rule 6(1)(k) MRP declarations and Net Quantity font size specifications.',
  },
  {
    id: 'task-002',
    taskNumber: 'TASK-DL-2025-082',
    title: 'FMCG Packaged Goods Surveillance',
    storeName: 'Fresh Basket Daily',
    location: 'Plot 42, Block B Market',
    category: 'Dairy & Edible Oils',
    dueDate: 'Today, 7:30 PM',
    targetCount: 8,
    completedCount: 0,
    status: 'Pending',
    priority: 'High',
    assignedTo: 'Insp. R. Sharma (DL-4092)',
    notes: 'Check for dual MRP stickers and missing manufacturer customer care email address.',
  },
  {
    id: 'task-003',
    taskNumber: 'TASK-DL-2025-083',
    title: 'Imported Confectionery Verification',
    storeName: 'Grand Gourmet Food Store',
    location: 'Connaught Circle, Gate 2',
    category: 'Imported Snacks & Chocolates',
    dueDate: 'Tomorrow, 11:00 AM',
    targetCount: 10,
    completedCount: 0,
    status: 'Pending',
    priority: 'Medium',
    assignedTo: 'Insp. R. Sharma (DL-4092)',
    notes: 'Audit mandatory Country of Origin and Importer registration details.',
  },
  {
    id: 'task-004',
    taskNumber: 'TASK-DL-2025-084',
    title: 'Wholesale Depot Pre-Packed Grains',
    storeName: 'Central Grain Warehouse #4',
    location: 'Industrial Area Phase-I',
    category: 'Staples & Pulses',
    dueDate: 'Completed Yesterday',
    targetCount: 5,
    completedCount: 5,
    status: 'Completed',
    priority: 'Low',
    assignedTo: 'Insp. R. Sharma (DL-4092)',
    notes: 'Audit completed. 1 notice issued for obscured date of packing.',
  },
];

export function getStoredTasks(): InspectionTask[] {
  if (typeof window === 'undefined') return INITIAL_TASKS;
  try {
    const data = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TASKS;
  } catch (e) {
    console.error('Error reading tasks', e);
    return INITIAL_TASKS;
  }
}

export function saveTask(task: InspectionTask): InspectionTask[] {
  const current = getStoredTasks();
  const existingIdx = current.findIndex((t) => t.id === task.id);
  let updated: InspectionTask[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = task;
  } else {
    updated = [task, ...current];
  }
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save task', e);
  }
  return updated;
}

export function updateTaskProgress(taskId: string, increment: number = 1): InspectionTask[] {
  const current = getStoredTasks();
  const updated = current.map((t) => {
    if (t.id === taskId) {
      const nextCount = Math.min(t.targetCount, t.completedCount + increment);
      return {
        ...t,
        completedCount: nextCount,
        status: nextCount >= t.targetCount ? ('Completed' as const) : ('In Progress' as const),
      };
    }
    return t;
  });
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update task progress', e);
  }
  return updated;
}

export function deleteTask(id: string): InspectionTask[] {
  const current = getStoredTasks();
  const updated = current.filter((t) => t.id !== id);
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete task', e);
  }
  return updated;
}
