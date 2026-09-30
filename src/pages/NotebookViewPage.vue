<template>
    <div class="notebook-view-page">
      <header class="header">
        <button @click="$router.push('/notebook-list')">←列表</button>
        <h3>{{notebookTitle}}</h3>
        <div class="header-buttons">
          <button v-if="!isEditMode" @click="enterEdit">编辑</button>
          <button v-if="!isEditMode" @click="handleDelete">删除手账</button>
          <button v-if="isEditMode" @click="saveAndExit">💾保存并退出</button>
          <button v-if="isEditMode" @click="cancelEdit">取消</button>
        </div>
      </header>
    
      <div class="canvas-container" v-if="itemList">
        <CanvasGrid
          :item-list="itemList"
          :canvas-height="canvasHeight"
          :is-edit-mode="isEditMode"
          :selected-item="selectedItem"
          @delete-item="onDeleteItem"
          @move-item="onMoveItem"
          @resize-item="onResizeItem"
          @change-canvas-height="onChangeCanvasHeight"
          @select-item="onSelectItem"
        />
      </div>
    
      <div class="bottom-tool-wrap" v-if="isEditMode">
        <BottomEditToolbar
          @add-component="onAddComponent"
          @text-action="onTextAction"
          @upload-image="triggerUploadImage"
          @add-sticker="onAddSticker"
        />
      </div>
    
      <!--业务弹窗组件-->
      <DialogCreateCheck v-model="dialogCheckVisible" @confirm="onCreateCheckConfirm"/>
      <DialogAccountAdd v-model="dialogAccountVisible" @confirm="onAddAccountConfirm"/>
      <DialogMonthCheckStatConfig
        v-model="dialogMonthStatVisible"
        :check-item-list="checkStore.validCheckItems"
        :init-check-id="curEditCheckId"
        :init-ym="curEditYm"
        @confirm="onMonthStatConfigConfirm"
      />
      <DialogPieConfig
        v-model="dialogPieVisible"
        :init-ym="curEditPieYm"
        @confirm="onPieConfigConfirm"
      />
    
      <!--图片上传隐藏input-->
      <input ref="fileInputRef" type="file" accept="image/*" style="display:none" @change="onFileChange"/>
    </div>
    </template>
    
    <script setup>
    import {ref,computed,onMounted} from 'vue'
    import {useRoute, useRouter} from 'vue-router'
    import {v4 as uuidv4} from 'uuid'
    import {useNotebookEditStore} from '../stores/notebookEditStore'
    import {useCheckGlobalStore} from '../stores/checkGlobalStore'
    import db from '../db/index'
    import {convertCanvasItemsToSnapshot} from '../utils/canvasSnapshotConvert'
    import {handleUploadImageFile} from '../utils/imageFileUtil'
    import CanvasGrid from '../components/CanvasGrid.vue'
    import BottomEditToolbar from '../components/BottomEditToolbar.vue'
    import DialogCreateCheck from '../components/dialog/DialogCreateCheck.vue'
    import DialogAccountAdd from '../components/dialog/DialogAccountAdd.vue'
    import DialogMonthCheckStatConfig from '../components/dialog/DialogMonthCheckStatConfig.vue'
    import DialogPieConfig from '../components/dialog/DialogPieConfig.vue'
    
    const route = useRoute()
    const router = useRouter()
    const notebookStore = useNotebookEditStore()
    const checkStore = useCheckGlobalStore()
    const fileInputRef = ref(null)
    
    //选中管理
    const selectedItem = ref(null)
    function onSelectItem(item){
      selectedItem.value = item
    }
    
    //弹窗状态
    const dialogCheckVisible = ref(false)
    const dialogAccountVisible = ref(false)
    const dialogMonthStatVisible = ref(false)
    const dialogPieVisible = ref(false)
    const curEditCheckId = ref('')
    const curEditYm = ref('')
    const curEditPieYm = ref('')
    
    const notebookTitle = computed(()=> notebookStore.title)
    const itemList = computed(()=> notebookStore.items)
    const canvasHeight = computed(()=> notebookStore.canvasHeight)
    const isEditMode = computed(()=> notebookStore.isEditMode)
    
    onMounted(async ()=>{
      const id = route.params.id
      if(!id){
        router.push('/notebook-list')
        return
      }
      await notebookStore.loadNotebookById(id)
      await checkStore.initLoad()
    })
    
    function enterEdit(){
      notebookStore.setEditMode(true)
    }
    function cancelEdit(){
      notebookStore.setEditMode(false)
      selectedItem.value = null
      notebookStore.loadNotebookById(route.params.id)
    }
    
    //保存手账：新增实时组件转为快照，原有快照保留
    async function saveAndExit(){
      const allCheck = checkStore.checkItemList
      const allAccounts = await db.accountGlobal.toArray()
      const snapshotItems = convertCanvasItemsToSnapshot(notebookStore.items, {
        checkGlobal: allCheck,
        accountList: allAccounts
      })
      await notebookStore.saveNotebook(notebookStore.title, snapshotItems)
      notebookStore.setEditMode(false)
      selectedItem.value = null
    }
    
    async function handleDelete(){
      if(!window.confirm("确认删除整条手账记录？")) return
      await notebookStore.deleteNotebook(route.params.id)
      router.push("/notebook-list")
    }
    
    //画布事件
    function onDeleteItem(item){
      const arr = [...notebookStore.items]
      const idx = arr.indexOf(item)
      if(idx>-1) arr.splice(idx,1)
      if(selectedItem.value === item) selectedItem.value = null
      notebookStore.updateItems(arr)
    }
    function onMoveItem(item, {x,y}){
      const arr = [...notebookStore.items]
      const target = arr.find(i=>i===item)
      if(target){
        target.x = x
        target.y = y
        notebookStore.updateItems(arr)
      }
    }
    function onResizeItem(item, payload){
      const arr = [...notebookStore.items]
      const target = arr.find(i=>i===item)
      Object.assign(target, payload)
      notebookStore.updateItems(arr)
    }
    function onChangeCanvasHeight(h){
      notebookStore.updateHeight(h)
    }
    
    //手账编辑模式新增组件，新增的是实时组件，保存时转快照
    async function onAddComponent(typeKey){
      const pos = {x:16,y:16}
      let newItem = null
      switch(typeKey){
        case 'checkIcon':{
          dialogCheckVisible.value = true
          return
        }
        case 'monthCheckStat':{
          if(!checkStore.validCheckItems.length){alert("请先创建打卡项");return}
          curEditCheckId.value = checkStore.validCheckItems[0].id
          curEditYm.value = new Date().toISOString().slice(0,7)
          dialogMonthStatVisible.value = true
          return
        }
        case 'monthFinancePie':{
          curEditPieYm.value = new Date().toISOString().slice(0,7)
          dialogPieVisible.value = true
          return
        }
        case 'accountItem':{
          dialogAccountVisible.value = true
          return
        }
        case 'dayCostTotal':{
          const sum = notebookStore.items
            .filter(i=>i.itemType==='accountItem')
            .reduce((s,it)=>s+0,0)
          newItem = {itemType:'dayCostTotal',x:pos.x,y:pos.y,_itemId: uuidv4(),total:sum}
          break
        }
      }
      if(newItem){
        notebookStore.updateItems([...notebookStore.items, newItem])
      }
    }
    
    //弹窗回调
    async function onCreateCheckConfirm(form){
      const gid = await checkStore.createCheckItem(form.name, form.themeColor)
      const newItem = {itemType:'checkIcon', x:16,y:16,_itemId: uuidv4(), globalCheckItemId:gid}
      notebookStore.updateItems([...notebookStore.items, newItem])
    }
    
    async function onAddAccountConfirm(form){
      const aid = uuidv4()
      await db.accountGlobal.put({
        id:aid, description:form.description, category:form.category, amount:form.amount, occurDate:form.occurDate,
        sourceCanvasId: notebookStore.notebookId,
        createAt: new Date().toISOString()
      })
      const newItem = {itemType:'accountItem',x:16,y:16,_itemId: uuidv4(),globalAccountId:aid}
      notebookStore.updateItems([...notebookStore.items, newItem])
    }
    
    function onMonthStatConfigConfirm({checkItemId, yearMonth}){
      const newItem = {
        itemType:'monthCheckStat',
        x:16,y:16,
        _itemId: uuidv4(),
        globalCheckItemId: checkItemId,
        statYearMonth: yearMonth
      }
      notebookStore.updateItems([...notebookStore.items, newItem])
    }
    
    function onPieConfigConfirm({statYearMonth}){
      const newItem = {
        itemType:'monthFinancePie',
        x:16,y:16,
        _itemId: uuidv4(),
        statYearMonth
      }
      notebookStore.updateItems([...notebookStore.items, newItem])
    }
    
    /**文字操作，仅对textBox生效 */
    function onTextAction(action){
      if(!selectedItem.value || selectedItem.value.itemType !== 'textBox'){
        alert("请先选中一个文字框组件！")
        return
      }
      const item = selectedItem.value
      const arr = [...notebookStore.items]
      const target = arr.find(i => i === item)
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
      notebookStore.updateItems(arr)
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
      notebookStore.updateItems([...notebookStore.items, newItem])
      fileInputRef.value.value = ''
    }
    
    function onAddSticker(s){
      const newItem = {
        itemType:'sticker',
        x:16,y:16,
        _itemId: uuidv4(),
        stickerName:s.name
      }
      notebookStore.updateItems([...notebookStore.items, newItem])
    }
    </script>
    
    <style scoped>
    .notebook-view-page{
      height:100vh;
      display:flex;
      flex-direction:column;
    }
    .header{
      display:flex;
      align-items:center;
      gap:10px;
      padding:8px;
      border-bottom:1px solid #ccc;
    }
    .header-buttons{
      margin-left:auto;
      display:flex;
      gap:6px;
    }
    .canvas-container{
      flex:1;
      overflow:hidden;
    }
    .bottom-tool-wrap{
      flex-shrink:0;
    }
    </style>
    