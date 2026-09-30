import { defineStore } from 'pinia'
import db from '../db/index'
import { v4 as uuidv4 } from 'uuid'

export const useCheckGlobalStore = defineStore('checkGlobal', {
  state: () => ({
    checkItemList: [], // checkItemGlobal 全部打卡项
    checkRecordList: [] // checkRecordGlobal打卡记录
  }),
  actions: {
    async initLoad() {
      this.checkItemList = await db.checkItemGlobal.toArray()
      this.checkRecordList = await db.checkRecordGlobal.toArray()
    },
    // 创建打卡项
    async createCheckItem(name, themeColor) {
      const id = uuidv4()
      const now = new Date().toISOString()
      await db.checkItemGlobal.put({
        id, name, themeColor, createAt: now, isDeleted: false
      })
      await this.initLoad()
      return id
    },
    // 今日打卡
    async doCheckToday(checkItemId) {
      const today = new Date().toISOString().slice(0,10)
      const exist = this.checkRecordList.find(r=>r.checkItemId === checkItemId && r.checkDate === today)
      if(exist) return
      const rid = uuidv4()
      await db.checkRecordGlobal.put({
        id: rid, checkItemId, checkDate: today, createAt: new Date().toISOString()
      })
      await this.initLoad()
    },
    // 取消今日打卡
    async cancelCheckToday(checkItemId) {
      const today = new Date().toISOString().slice(0,10)
      const rec = this.checkRecordList.find(r=>r.checkItemId === checkItemId && r.checkDate === today)
      if(rec) {
        await db.checkRecordGlobal.delete(rec.id)
        await this.initLoad()
      }
    },
    // 全局重置打卡记录（清空所有打卡完成记录，保留打卡项）
    async globalResetCheck() {
      await db.checkRecordGlobal.clear()
      await this.initLoad()
    },
    // 软删除打卡项
    async softDeleteCheckItem(itemId) {
      await db.checkItemGlobal.update(itemId, {isDeleted:true})
      await this.initLoad()
    }
  },
  getters: {
    validCheckItems(state) {
      return state.checkItemList.filter(i=>!i.isDeleted)
    }
  }
})
