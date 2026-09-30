import db from '../db/index'
import { useCheckGlobalStore } from '../stores/checkGlobalStore'

/**
 * 读取本地json文件，返回解析后的对象
 * @param {File} file
 * @returns {Promise<Object>}
 */
export function readBackupJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result)
        resolve(json)
      } catch (err) {
        reject(new Error('JSON解析失败，文件损坏'))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}

/**
 * 导入备份
 * @param {Object} backupJson 导出的备份对象
 * @param {'overwrite'|'merge'} mode overwrite=覆盖全部; merge=合并(upsert)
 */
export async function restoreFromBackup(backupJson, mode = 'merge') {
  // 简单校验备份文件标识
  if (!backupJson?.appName || backupJson.appName !== 'grid‑handnote‑app' || !backupJson.tables) {
    throw new Error('不是网格手账合法备份文件')
  }

  const { checkItemGlobal, checkRecordGlobal, accountGlobal, notebookStore } = backupJson.tables

  if (mode === 'overwrite') {
    // 覆盖模式：清空全部四张业务表
    await db.checkItemGlobal.clear()
    await db.checkRecordGlobal.clear()
    await db.accountGlobal.clear()
    await db.notebookStore.clear()
  }

  // bulkPut：存在id就更新，不存在就新增（merge模式自动upsert；overwrite模式已经清空，等价于insert）
  if (Array.isArray(checkItemGlobal) && checkItemGlobal.length > 0) {
    await db.checkItemGlobal.bulkPut(checkItemGlobal)
  }
  if (Array.isArray(checkRecordGlobal) && checkRecordGlobal.length > 0) {
    await db.checkRecordGlobal.bulkPut(checkRecordGlobal)
  }
  if (Array.isArray(accountGlobal) && accountGlobal.length > 0) {
    await db.accountGlobal.bulkPut(accountGlobal)
  }
  if (Array.isArray(notebookStore) && notebookStore.length > 0) {
    await db.notebookStore.bulkPut(notebookStore)
  }

  // 导入完成，刷新pinia全局打卡store内存数据
  const checkStore = useCheckGlobalStore()
  await checkStore.initLoad()
}
