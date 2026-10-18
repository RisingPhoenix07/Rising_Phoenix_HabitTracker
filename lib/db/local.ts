import Dexie, { Table } from "dexie"

export interface LocalHabitLog {
  id?: number
  taskId: string
  date: string
  completed: boolean
  synced: number // 0 = unsynced, 1 = synced
  updatedAt: number
}

export class RisingPhoenixLocalDB extends Dexie {
  habitLogs!: Table<LocalHabitLog, number>

  constructor() {
    super("RisingPhoenixLocalDB")
    this.version(1).stores({
      habitLogs: "++id, taskId, date, synced, updatedAt"
    })
  }
}

export const localDb = new RisingPhoenixLocalDB()
