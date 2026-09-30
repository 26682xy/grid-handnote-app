import db from '../db/index.js'

/**
 * 导出全部数据库备份为JSON，触发浏览器下载
 */
export async function exportAllDataBackup() {
  const checkItemGlobal = await db.checkItemGlobal.toArray()
  const checkRecordGlobal = await db.checkRecordGlobal.toArray()
  const accountGlobal = await db.accountGlobal.toArray()
  const notebookStore = await db.notebookStore.toArray()

  const backupData = {
    exportTime: new Date().toISOString(),
    appName: "grid‑handnote‑app",
    version: "V4",
    tables: {
      checkItemGlobal,
      checkRecordGlobal,
      accountGlobal,
      notebookStore
    }
  }

  const jsonStr = JSON.stringify(backupData, null, 2)
  const blob = new Blob([jsonStr], {type:'application/json'})
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  const filename = `grid‑handnote‑backup‑${new Date().toISOString().slice(0,10)}.json`
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
