<template>
    <div class="home-page">
      <header class="page-header">
        <h2>网格手账</h2>
        <button @click="handleGlobalReset">全局重置打卡</button>
        <button style="margin-left:8px" @click="exportBackup">导出全部备份</button>
        <button style="margin-left:8px" @click="dialogImportVisible = true">导入恢复</button>
      </header>
  
      <!-- 多草稿Tab栏 -->
      <div class="canvas-tabs">
        <div
          v-for="c in canvasList"
          :key="c.canvasId"
          class="tab-item"
          :class="{active: c.canvasId === activeCanvasId}"
          @click="activeCanvasId = c.canvasId; saveLocal()"
        >
          {{c.title}}
          <span class="close-tab" @click.stop="closeCanvas(c.canvasId)">×</span>
        </div>
        <button class="add-tab-btn" @click="addNewCanvas">+新草稿</button>
      </div>
  
      <!--画布区域-->
      <div class="canvas-container" v-if="activeCanvas">
        <CanvasGrid
          :item-list="activeCanvas.items"
          :canvas-height="activeCanvas.canvasHeight"
          :is-edit-mode="isEditMode"
          :selected-item="selectedItem"
          @delete-item="onDeleteItem"
          @move-item="onMoveItem"
          @resize-item="onResizeItem"
          @change-canvas-height="onChangeCanvasHeight"
          @select-item="onSelectItem"
        />
      </div>
  
      <!--编辑模式右上角操作按钮-->
      <div v-if="isEditMode" class="edit-top-buttons">
        <button @click="saveToNotebook">保存手账</button>
        <button @click="exitEdit">✅退出编辑</button>
      </div>
  
      <!--底部Tab / 编辑工具栏二选一-->
      <div class="bottom-area">
        <div v-if="!isEditMode" class="main-tab-bar">
          <button class="tab-btn active">首页</button>
          <button class="tab-btn center-plus" @click="enterEdit">+</button>
          <button class="tab-btn" @click="$router.push('/notebook-list')">手账本</button>
        </div>
        <BottomEditToolbar
          v-else
          @add-component="onAddComponent"
          @text-action="onTextAction"
          @upload-image="triggerUploadImage"
          @add-sticker="onAddSticker"
        />
      </div>
  
      <!--弹窗组件-->
      <DialogCreateCheck v-model="dialogCheckVisible" @confirm="onCreateCheckConfirm"/>
      <DialogAccountAdd v-model="dialogAccountVisible" @confirm="onAddAccountConfirm"/>
      <DialogImportRestore v-model="dialogImportVisible" @restore-done="onRestoreDone"/>
  
      <!--图片上传隐藏input-->
      <input ref="fileInputRef" type="file" accept="image/*" style="display:none" @change="onFileChange"/>
    </div>
  </template>
  
  <script setup>
  import {ref,onMounted, computed} from 'vue'
  import {useRouter} from 'vue-router'
  import {v4 as uuidv4} from 'uuid'
  import {useHomeTempCanvasStore} from '../stores/homeTempCanvasStore'
  import {useCheckGlobalStore} from '../stores/checkGlobalStore'
  import db from '../db/index'
  import {convertCanvasItemsToSnapshot} from '../utils/canvasSnapshotConvert'
  import {handleUploadImageFile} from '../utils/imageFileUtil'
  import CanvasGrid from '../components/CanvasGrid.vue'
  import BottomEditToolbar from '../components/BottomEditToolbar.vue'
  import DialogCreateCheck from '../components/dialog/DialogCreateCheck.vue'
  import DialogAccountAdd from '../components/dialog/DialogAccountAdd.vue'
  import {exportAllDataBackup} from '../utils/exportBackupUtil'
  import DialogImportRestore from '../components/dialog/DialogImportRestore.vue'
  
  const router = useRouter()
  const homeStore = useHomeTempCanvasStore()
  const checkStore = useCheckGlobalStore()
  const fileInputRef = ref(null)
  const dialogImportVisible = ref(false)
  
  //选中画布元素
  const selectedItem = ref(null)
  function onSelectItem(item){
    selectedItem.value = item
  }
  
  //弹窗状态
  const dialogCheckVisible = ref(false)
  const dialogAccountVisible = ref(false)
  
  const {canvasList, activeCanvasId, isEditMode} = homeStore
  const activeCanvas = computed(()=> homeStore.getActiveCanvas())
  
  onMounted(async ()=>{
    homeStore.initFromLocalStorage()
    await checkStore.initLoad()
  })
  
  function saveLocal(){
    homeStore.saveToLocalStorage()
  }
  
  //新增草稿画布
  function addNewCanvas(){
    homeStore.addCanvas()
  }
  //关闭/删除草稿画布
  async function closeCanvas(id){
    await homeStore.removeCanvas(id)
  }
  
  //进入编辑
  function enterEdit(){
    homeStore.setEditMode(true)
  }
  //退出编辑
  function exitEdit(){
    homeStore.setEditMode(false)
    selectedItem.value = null
  }

  async function exportBackup(){
  try{
    await exportAllDataBackup()
    alert("备份导出成功，已下载json文件")
  }catch(e){
    console.error(e)
    alert("导出失败："+e.message)
  }
}

//导入完成回调：刷新首页草稿状态
async function onRestoreDone() {
  //重新加载首页草稿localStorage + 打卡store
  homeStore.initFromLocalStorage()
  await checkStore.initLoad()
}
  
  //画布事件
  function onDeleteItem(item){
    const items = [...activeCanvas.value.items]
    const idx = items.findIndex(i=>i === item)
    if(idx>-1) items.splice(idx,1)
    //删除选中引用
    if(selectedItem.value === item) selectedItem.value = null
    homeStore.updateActiveCanvasItems(items)
  }
  function onMoveItem(item, {x,y}){
    const items = [...activeCanvas.value.items]
    const target = items.find(i=>i === item)
    if(target){
      target.x = x
      target.y = y
      homeStore.updateActiveCanvasItems(items)
    }
  }
  function onResizeItem(item, payload){
    const items = [...activeCanvas.value.items]
    const target = items.find(i=>i === item)
    Object.assign(target, payload)
    homeStore.updateActiveCanvasItems(items)
  }
  function onChangeCanvasHeight(h){
    homeStore.updateCanvasHeight(h)
  }
  
  //底部工具栏：添加组件
  async function onAddComponent(typeKey){
    const pos = {x:16,y:16}
    let newItem = null
    switch(typeKey){
      case 'checkIcon':{
        dialogCheckVisible.value = true
        return
      }
      case 'monthCheckStat':{
        const valid = checkStore.validCheckItems
        if(!valid.length){alert("请先创建打卡项");return}
        //实际项目打开DialogMonthCheckStatConfig弹窗
        return
      }
      case 'monthFinancePie':{
        //打开DialogPieConfig弹窗
        return
      }
      case 'accountItem':{
        dialogAccountVisible.value = true
        return
      }
      case 'dayCostTotal':{
        const sum = activeCanvas.value.items
          .filter(i=>i.itemType==='accountItem')
          .reduce((s,it)=>s+0,0)
        newItem = {
          itemType:'dayCostTotal',
          x:pos.x,y:pos.y,
          _itemId: uuidv4(),
          total: sum
        }
        break
      }
    }
    if(newItem){
      const arr = [...activeCanvas.value.items, newItem]
      homeStore.updateActiveCanvasItems(arr)
    }
  }
  
  //弹窗回调
  async function onCreateCheckConfirm(form){
    const gid = await checkStore.createCheckItem(form.name, form.themeColor)
    const newItem = {
      itemType:'checkIcon',
      x:16,y:16,
      _itemId: uuidv4(),
      globalCheckItemId: gid
    }
    const arr = [...activeCanvas.value.items, newItem]
    homeStore.updateActiveCanvasItems(arr)
  }
  
  async function onAddAccountConfirm(form){
    const aid = uuidv4()
    await db.accountGlobal.put({
      id:aid,
      description: form.description,
      category: form.category,
      amount: form.amount,
      occurDate: form.occurDate,
      sourceCanvasId: activeCanvas.value.canvasId,
      createAt: new Date().toISOString()
    })
    const newItem = {
      itemType:'accountItem',
      x:16,y:16,
      _itemId: uuidv4(),
      globalAccountId: aid
    }
    const arr = [...activeCanvas.value.items, newItem]
    homeStore.updateActiveCanvasItems(arr)
  }
  
  /** 文字工具栏完整业务逻辑，仅对textBox生效 */
  function onTextAction(action){
    if(!selectedItem.value || selectedItem.value.itemType !== 'textBox'){
      alert("请先选中一个文字框组件！")
      return
    }
    const item = selectedItem.value
    const items = [...activeCanvas.value.items]
    const target = items.find(i => i === item)
    if(!target) return
    switch(action){
      case 'bold':
        target.bold = !target.bold
        break
      case 'lineAdd':
        target.lineHeight = Math.min(3, target.lineHeight + 0.1)
        break
      case 'lineSub':
        target.lineHeight = Math.max(1, target.lineHeight -0.1)
        break
      case 'fontAdd':
        target.fontSize +=2
        break
      case 'fontSub':
        target.fontSize = Math.max(10, target.fontSize -2)
        break
    }
    homeStore.updateActiveCanvasItems(items)
  }
  
  //图片上传
  function triggerUploadImage(){
    fileInputRef.value.click()
  }
  async function onFileChange(e){
    const file = e.target.files[0]
    if(!file) return
    const src = await handleUploadImageFile(file)
    const newItem = {
      itemType:'uploadImage',
      x:16,y:16,
      _itemId: uuidv4(),
      w:200,
      h:160,
      imgSrc: src
    }
    const arr = [...activeCanvas.value.items, newItem]
    homeStore.updateActiveCanvasItems(arr)
    fileInputRef.value.value = ''
  }
  
  function onAddSticker(s){
    const newItem = {
      itemType:'sticker',
      x:16,y:16,
      _itemId: uuidv4(),
      stickerName: s.name
    }
    const arr = [...activeCanvas.value.items, newItem]
    homeStore.updateActiveCanvasItems(arr)
  }
  
  //保存草稿画布为正式手账本
  async function saveToNotebook(){
    const title = window.prompt("手账本标题", activeCanvas.value.title)
    if(!title) return
    //读取全局打卡+全部记账流水，用于快照转换
    const allCheck = checkStore.checkItemList
    const allAccounts = await db.accountGlobal.toArray()
    const snapshotItems = convertCanvasItemsToSnapshot(activeCanvas.value.items, {
      checkGlobal: allCheck,
      accountList: allAccounts
    })
    const notebookStore = await import('../stores/notebookEditStore')
    const notebookEditStore = notebookStore.useNotebookEditStore()
    await notebookEditStore.createNewNotebook(title, snapshotItems, activeCanvas.value.canvasHeight)
    alert("保存成功，跳转手账本列表")
    await router.push("/notebook-list")
  }
  
  async function handleGlobalReset(){
    if(window.confirm("确认全局重置打卡记录？所有打卡状态清空")){
      await checkStore.globalResetCheck()
    }
  }
  </script>
  
  
  <style scoped>
  .home-page{
    height:100vh;
    display:flex;
    flex-direction:column;
  }
  .page-header{
    padding:8px;
    display:flex;
    justify-content:space-between;
    align-items:center;
    border-bottom:1px solid #ccc;
  }
  .canvas-tabs{
    display:flex;
    gap:4px;
    padding:6px;
    overflow-x:auto;
    border-bottom:1px solid #ddd;
  }
  .tab-item{
    padding:4px 8px;
    border:1px solid #aaa;
    border-radius:4px;
    display:flex;
    gap:4px;
    align-items:center;
  }
  .tab-item.active{
    background:#def;
  }
  .close-tab{
    color:red;
    cursor:pointer;
  }
  .add-tab-btn{
    white-space:nowrap;
  }
  .canvas-container{
    flex:1;
    overflow:hidden;
  }
  .edit-top-buttons{
    position:absolute;
    top:60px;
    right:12px;
    z-index:200;
    display:flex;
    gap:6px;
  }
  .bottom-area{
    flex-shrink:0;
  }
  .main-tab-bar{
    display:flex;
    height:48px;
    border-top:1px solid #ccc;
  }
  .tab-btn{
    flex:1;
    border:none;
    background:#fff;
    font-size:14px;
  }
  .tab-btn.center-plus{
    font-size:24px;
  }
  </style>
  