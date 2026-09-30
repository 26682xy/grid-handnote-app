<template>
    <div class="canvas-grid-wrap" :style="{height: canvasHeight + 'px'}" @click="onWrapClick">
      <!-- 8px网格背景 -->
      <div class="grid-bg"></div>
      <!-- 动态渲染画布元素 -->
      <component
        v-for="item in itemList"
        :key="item._itemId"
        :is="getComponentName(item.itemType)"
        v-bind="{...item}"
        :is-edit-mode="isEditMode"
        :is-selected="selectedItem === item"
        @delete-item="handleDeleteItem(item)"
        @move-item="handleMoveItem(item, $event)"
        @resize-item="handleResizeItem(item, $event)"
        @click-item.stop="handleClickItem(item)"
      />
  
      <!-- 编辑模式：画布高度控制按钮右下角 -->
      <div v-if="isEditMode" class="canvas-height-ctrl">
        <button @click="addHeight">+</button>
        <button @click="reduceHeight">-</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import CanvasItemCheckIcon from './CanvasItemCheckIcon.vue'
  import CanvasItemCheckIconSnapshot from './CanvasItemCheckIconSnapshot.vue'
  import CanvasItemMonthCheckStat from './CanvasItemMonthCheckStat.vue'
  import CanvasItemMonthCheckStatSnapshot from './CanvasItemMonthCheckStatSnapshot.vue'
  import CanvasItemMonthFinancePie from './CanvasItemMonthFinancePie.vue'
  import CanvasItemMonthFinancePieSnapshot from './CanvasItemMonthFinancePieSnapshot.vue'
  import CanvasItemAccount from './CanvasItemAccount.vue'
  import CanvasItemAccountSnapshot from './CanvasItemAccountSnapshot.vue'
  import CanvasItemDayTotal from './CanvasItemDayTotal.vue'
  import CanvasItemDayTotalSnapshot from './CanvasItemDayTotalSnapshot.vue'
  import CanvasItemTextbox from './CanvasItemTextbox.vue'
  import CanvasItemUploadImage from './CanvasItemUploadImage.vue'
  import CanvasItemSticker from './CanvasItemSticker.vue'
  
  const props = defineProps({
    itemList: {type:Array, required:true},
    canvasHeight: {type:Number, required:true},
    isEditMode: {type:Boolean, default:false},
    selectedItem: {type:Object, default:null}
  })
  const emit = defineEmits(['delete-item','move-item','resize-item','change-canvas-height','select-item'])
  
  const GRID_SIZE = 8
  
  // 获取对应组件
  const compMap = {
    checkIcon: CanvasItemCheckIcon,
    checkIconSnapshot: CanvasItemCheckIconSnapshot,
    monthCheckStat: CanvasItemMonthCheckStat,
    monthCheckStatSnapshot: CanvasItemMonthCheckStatSnapshot,
    monthFinancePie: CanvasItemMonthFinancePie,
    monthFinancePieSnapshot: CanvasItemMonthFinancePieSnapshot,
    accountItem: CanvasItemAccount,
    accountItemSnapshot: CanvasItemAccountSnapshot,
    dayCostTotal: CanvasItemDayTotal,
    dayCostTotalSnapshot: CanvasItemDayTotalSnapshot,
    textBox: CanvasItemTextbox,
    uploadImage: CanvasItemUploadImage,
    sticker: CanvasItemSticker
  }
  const getComponentName = (t)=> compMap[t]
  
  // 网格吸附工具：对齐8px
  const snapGrid = (val)=> Math.round(val / GRID_SIZE) * GRID_SIZE
  
  const handleDeleteItem = (item)=>{
    emit('delete-item', item)
  }
  const handleMoveItem = (item, {dx, dy})=>{
    let newX = snapGrid(item.x + dx)
    let newY = snapGrid(item.y + dy)
    // 边界约束：不能拖到画布左上外面，最小0
    newX = Math.max(0, newX)
    newY = Math.max(0, newY)
    emit('move-item', item, {x:newX, y:newY})
  }
  const handleResizeItem = (item, payload)=>{
    emit('resize-item', item, payload)
  }
  
  const handleClickItem = (item) => {
    emit('select-item', item)
  }
  const onWrapClick = () => {
    emit('select-item', null)
  }
  
  const addHeight = ()=>{
    const addVal = Math.floor(window.innerHeight /3)
    emit('change-canvas-height', props.canvasHeight + addVal)
  }
  const reduceHeight = ()=>{
    const subVal = Math.floor(window.innerHeight /3)
    const minH = window.innerHeight
    const nextH = Math.max(minH, props.canvasHeight - subVal)
    emit('change-canvas-height', nextH)
  }
  </script>
  
  <style scoped>
  .canvas-grid-wrap{
    position:relative;
    width:100%;
    overflow:auto;
  }
  .grid-bg{
    position:absolute;
    inset:0;
    background-image: linear-gradient(#eee 1px, transparent 1px),linear-gradient(90deg,#eee 1px,transparent 1px);
    background-size:8px 8px;
  }
  .canvas-height-ctrl{
    position:absolute;
    bottom:12px;
    right:12px;
    z-index:100;
    display:flex;
    gap:4px;
  }
  .canvas-height-ctrl button{
    width:32px;height:32px;
  }
  </style>
  