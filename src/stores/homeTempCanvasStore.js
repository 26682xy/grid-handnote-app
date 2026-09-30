import { defineStore } from 'pinia'
import db from '../db/index'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'homeTempCanvasStore'

export const useHomeTempCanvasStore = defineStore('homeTempCanvasStore', {
  state: () => ({
    canvasList: [
      {
        canvasId: uuidv4(),
        title: '草稿1',
        items: [],
        canvasHeight: window.innerHeight // 画布高度，最少一屏
      }
    ],
    activeCanvasId: '',
    isEditMode: false
  }),
  actions: {
    initFromLocalStorage() {
      const str = localStorage.getItem(STORAGE_KEY)
      if(str) {
        try {
          const data = JSON.parse(str)
          this.canvasList = data.canvasList || this.canvasList
          this.activeCanvasId = data.activeCanvasId || this.canvasList[0].canvasId
        } catch(e) {
          console.error('本地草稿解析失败',e)
        }
      } else {
        this.activeCanvasId = this.canvasList[0].canvasId
      }
    },
    saveToLocalStorage() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        canvasList: this.canvasList,
        activeCanvasId: this.activeCanvasId
      }))
    },
    getActiveCanvas() {
      return this.canvasList.find(c=>c.canvasId === this.activeCanvasId)
    },
    // 新增一块临时画布
    addCanvas(title='新草稿') {
      const newC = {
        canvasId: uuidv4(),
        title,
        items: [],
        canvasHeight: window.innerHeight
      }
      this.canvasList.push(newC)
      this.activeCanvasId = newC.canvasId
      this.saveToLocalStorage()
    },
    // 删除临时画布；禁止删除最后一块
    async removeCanvas(canvasId) {
      if(this.canvasList.length <=1) return
      const idx = this.canvasList.findIndex(c=>c.canvasId === canvasId)
      if(idx === -1) return
      const canvas = this.canvasList[idx]
      // 删除画布内记账条目，同步删除全局accountGlobal流水
      const accountItemIds = canvas.items
        .filter(it=>it.itemType === 'accountItem')
        .map(it=>it.globalAccountId)
      for(const aid of accountItemIds) {
        await db.accountGlobal.delete(aid)
      }
      this.canvasList.splice(idx,1)
      // 切换active
      if(this.activeCanvasId === canvasId) {
        this.activeCanvasId = this.canvasList[0].canvasId
      }
      this.saveToLocalStorage()
    },
    setEditMode(flag) {
      this.isEditMode = flag
    },
    updateActiveCanvasItems(newItems) {
      const c = this.getActiveCanvas()
      if(c) {
        c.items = newItems
        this.saveToLocalStorage()
      }
    },
    updateCanvasHeight(h) {
      const c = this.getActiveCanvas()
      if(c) {
        const minH = window.innerHeight
        c.canvasHeight = Math.max(minH, h)
        this.saveToLocalStorage()
      }
    }
  }
})
