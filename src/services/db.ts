import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

export interface Student {
  student_id: string;
  name: string;
  rollNumber: string;
  parent_phone?: string; // Added for SMS notifications
  class: string;
  subjects: string[];
  face_descriptor: number[];
  created_at: number;
}

export interface AttendanceRecord {
  record_id: string;
  student_id: string;
  name: string;
  rollNumber: string;
  date: string;
  time: string;
  subject: string;
  status: 'present' | 'absent';
  synced: boolean;
}

export interface SyncQueueItem {
  queue_id: string;
  record_id: string;
  action: 'CREATE_ATTENDANCE' | 'UPDATE_STUDENT';
  timestamp: number;
  synced: boolean;
}

export interface SMSQueueItem {
  sms_id: string;
  student_id: string;
  student_name: string;
  parent_phone: string;
  message: string;
  created_at: number;
  sent: boolean;
  sent_at?: number;
}

interface ShikshaSetuDB extends DBSchema {
  students: {
    key: string;
    value: Student;
    indexes: { 'name': string; 'class': string; 'rollNumber': string };
  };
  attendance_records: {
    key: string;
    value: AttendanceRecord;
    indexes: { 'student_id': string; 'date': string; 'subject': string; 'synced': string };
  };
  sync_queue: {
    key: string;
    value: SyncQueueItem;
    indexes: { 'synced': string };
  };
  sms_queue: {
    key: string;
    value: SMSQueueItem;
    indexes: { 'sent': string; 'created_at': number };
  };
}

const DB_NAME = 'shikshasetu_db';
const DB_VERSION = 4;

export const initDB = async (): Promise<IDBPDatabase<ShikshaSetuDB>> => {
  return openDB<ShikshaSetuDB>(DB_NAME, DB_VERSION, {
    upgrade(db: any, _oldVersion: number, _newVersion: any, transaction: any) {
      if (!db.objectStoreNames.contains('students')) {
        const studentStore = db.createObjectStore('students', { keyPath: 'student_id' });
        studentStore.createIndex('name', 'name');
        studentStore.createIndex('class', 'class');
        studentStore.createIndex('rollNumber', 'rollNumber');
      } else {
        const studentStore = transaction.objectStore('students');
        if (!studentStore.indexNames.contains('rollNumber')) {
          studentStore.createIndex('rollNumber', 'rollNumber');
        }
      }

      if (!db.objectStoreNames.contains('attendance_records')) {
        const attendanceStore = db.createObjectStore('attendance_records', { keyPath: 'record_id' });
        attendanceStore.createIndex('student_id', 'student_id');
        attendanceStore.createIndex('date', 'date');
        attendanceStore.createIndex('subject', 'subject');
        attendanceStore.createIndex('synced', 'synced');
      }

      if (!db.objectStoreNames.contains('sync_queue')) {
        const queueStore = db.createObjectStore('sync_queue', { keyPath: 'queue_id' });
        queueStore.createIndex('synced', 'synced');
      }

      if (!db.objectStoreNames.contains('sms_queue')) {
        const smsStore = db.createObjectStore('sms_queue', { keyPath: 'sms_id' });
        smsStore.createIndex('sent', 'sent');
        smsStore.createIndex('created_at', 'created_at');
      }
    },
  });
};

export const dbService = {
  async addStudent(student: Student) {
    const db = await initDB();
    return db.put('students', student);
  },

  async getStudent(studentId: string) {
    const db = await initDB();
    return db.get('students', studentId);
  },

  async getAllStudents() {
    const db = await initDB();
    const students = await db.getAll('students');
    // Ensure rollNumber exists (migration fallback)
    return students.map(s => ({ ...s, rollNumber: s.rollNumber || 'N/A' }));
  },

  async markAttendance(record: AttendanceRecord) {
    const db = await initDB();
    const tx = db.transaction(['attendance_records', 'sync_queue'], 'readwrite');
    await tx.objectStore('attendance_records').add(record);
    await tx.objectStore('sync_queue').add({
      queue_id: crypto.randomUUID(),
      record_id: record.record_id,
      action: 'CREATE_ATTENDANCE',
      timestamp: Date.now(),
      synced: false
    });
    await tx.done;
    return record;
  },

  async getAttendanceRecords() {
    const db = await initDB();
    return db.getAll('attendance_records');
  },

  async getAttendanceByDate(date: string) {
    const db = await initDB();
    return db.getAllFromIndex('attendance_records', 'date', date);
  },

  async getUnsyncedRecords() {
    const db = await initDB();
    const all = await db.getAll('sync_queue');
    return all.filter((i: SyncQueueItem) => !i.synced);
  },

  async updateSyncStatus(queueId: string, status: boolean) {
    const db = await initDB();
    const item = await db.get('sync_queue', queueId);
    if (item) {
      item.synced = status;
      await db.put('sync_queue', item);
    }
  },

  async clearAllData() {
    const db = await initDB();
    const tx = db.transaction(['students', 'attendance_records', 'sync_queue', 'sms_queue'], 'readwrite');
    await tx.objectStore('students').clear();
    await tx.objectStore('attendance_records').clear();
    await tx.objectStore('sync_queue').clear();
    await tx.objectStore('sms_queue').clear();
    await tx.done;
    return true;
  }
};
