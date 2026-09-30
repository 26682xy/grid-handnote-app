# 完整项目目录结构
```
src/
├── App.vue                    # 仅保留router-view
├── main.js
├── router/index.js            # 路由定义：首页、手账本列表页、手账详情/:id
├── stores/
│   ├── homeTempCanvasStore.js
│   ├── notebookEditStore.js
│   └── checkGlobalStore.js
├── components/
│   ├── dialog/
│       ├── DialogAccountAdd.vue
│       ├── DialogCreateCheck.vue
│       ├── DialogMonthCheckStatConfig.vue
│       ├── DialogImportRestore.vue
│       └── DialogPieConfig.vue
│   ├── CanvasGrid.vue
│   ├── BottomEditToolbar.vue
│   ├── CanvasItemCheckIcon.vue
│   ├── CanvasItemCheckIconSnapshot.vue
│   ├── CanvasItemMonthCheckStat.vue
│   ├── CanvasItemMonthCheckStatSnapshot.vue
│   ├── CanvasItemMonthFinancePie.vue
│   ├── CanvasItemMonthFinancePieSnapshot.vue
│   ├── CanvasItemAccount.vue
│   ├── CanvasItemAccountSnapshot.vue
│   ├── CanvasItemDayTotal.vue
│   ├── CanvasItemDayTotalSnapshot.vue
│   ├── CanvasItemTextbox.vue
│   ├── CanvasItemUploadImage.vue
│   └── CanvasItemSticker.vue
├── pages/
│   ├── HomePage.vue           # 首页多临时草稿画布
│   ├── NotebookListPage.vue   # 手账本列表
│   └── NotebookViewPage.vue   # /notebook-view/:id 独立详情编辑页面
├── db/index.js                # Dexie数据库定义，包含checkItemGlobal、checkRecordGlobal、accountGlobal表
└── utils/
    └── canvasSnapshotConvert.js # 画布实时组件转快照工具函数
    └── imageFileUtil.js # 图片上传工具函数
    └── exportBackupUtil.js # 数据导出备份 JSON 工具函数
    └── importRestoreUtil.js # 备份 JSON 导入恢复工具函数
```