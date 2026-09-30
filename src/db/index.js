import Dexie from 'dexie'

const db = new Dexie('GridHandnoteDB')

db.version(1).stores({
  // 全局打卡项主表
  checkItemGlobal: 'id,name,isDeleted',
  // 打卡完成记录表
  checkRecordGlobal: 'id,checkItemId,checkDate',
  // 全局记账流水表
  accountGlobal: 'id,occurDate,sourceCanvasId',
  // 手账本正式保存表
  notebookStore: 'id,title,createAt,updateAt'
})

export default db
