"use client"

import { useEffect } from "react"
import { localDb } from "@/lib/db/local"

export default function SyncManager() {
  useEffect(() => {
    async function syncOfflineData() {
      if (!navigator.onLine) return

      try {
        const pendingLogs = await localDb.habitLogs.where("synced").equals(0).toArray()
        if (pendingLogs.length === 0) return

        const res = await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logs: pendingLogs })
        })

        if (res.ok) {
          const ids = pendingLogs.map((log) => log.id!).filter(Boolean)
          await localDb.habitLogs.where("id").anyOf(ids).modify({ synced: 1 })
          console.log(`⚡ Rising Phoenix: Successfully synced ${pendingLogs.length} offline entries to Neon DB.`)
        }
      } catch (err) {
        console.error("Sync error:", err)
      }
    }

    window.addEventListener("online", syncOfflineData)
    syncOfflineData() // Sync on mount if already online

    return () => window.removeEventListener("online", syncOfflineData)
  }, [])

  return null
}
