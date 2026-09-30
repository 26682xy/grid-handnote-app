import { defineStore } from 'pinia'
import db from '../db/index'

export const useNotebookEditStore = defineStore('notebookEditStore', {
  state: () => ({
    notebookId: null,
    title: '',
    items: [],
    canvasHeight: window.innerHeight,
    isEditMode: false
  }),
  actions: {
    async loadNotebookById(id) {
      const row = await db.notebookStore.get(id)
      if(!row) throw new Error('手账不存在')
      this.notebookId = row.id
      this.title = row.title
      this.items = row.items || []
      this.canvasHeight = row.canvasHeight || window.innerHeight
      this.isEditMode = false
    },
    setEditMode(flag) {
      this.isEditMode = flag
    },
    updateItems(arr) {
      this.items = arr
    },
    updateHeight(h) {
      const minH = window.innerHeight
      this.canvasHeight = Math.max(minH, h)
    },
    // 更新保存已存在手账本
    async saveNotebook(title, snapshotItems) {
      const now = new Date().toISOString()
      await db.notebookStore.update(this.notebookId, {
        title,
        items: snapshotItems,
        canvasHeight: this.canvasHeight,
        updateAt: now
      })
      this.title = title
      this.items = snapshotItems
    },
    // 创建全新手账本（从首页草稿保存过来）
    async createNewNotebook(title, snapshotItems, canvasHeight) {
      const uuid = crypto.randomUUID()
      const now = new Date().toISOString()
      await db.notebookStore.put({
        id: uuid,
        title,
        items: snapshotItems,
        canvasHeight,
        createAt: now,
        updateAt: now
      })
      return uuid
    },
    async deleteNotebook(id) {
      await db.notebookStore.delete(id)
      this.$reset()
    },
    resetStore() {
      this.$reset()
    }
  }
})
