<template>
    <div
      class="check-icon-wrap"
      :style="{ left: x + 'px', top: y + 'px' }"
      @mousedown="onDragStart($event)"
      @touchstart="onTouchStart($event)"
      @click="$emit('click-item')"
    >
      <!--编辑模式删除按钮-->
      <button v-if="isEditMode" class="del-btn" @click.stop="$emit('delete-item')">×</button>
      <div class="real-tag" v-if="isRealMode">实时</div>
  
      <div
        class="circle-icon"
        :class="{checked:isChecked,deleted:isItemDeleted}"
        :style="{backgroundColor: isChecked ? targetThemeColor : '#cccccc'}"
        @click.stop="handleClickIcon"
      ></div>
      <div class="icon-name">{{displayName}}</div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useCheckGlobalStore } from '../stores/checkGlobalStore'
  
  const props = defineProps({
    x: Number,
    y: Number,
    globalCheckItemId: String,
    isEditMode: Boolean,
    isSelected:{type:Boolean,default:false}
  })
  const emit = defineEmits(['delete-item','move-item','click-item'])
  const checkStore = useCheckGlobalStore()
  
  const isRealMode = computed(()=>true)
  const dragState = ref({
    dragging:false,
    startX:0, startY:0,
    originX:0, originY:0
  })
  
  const targetItem = computed(()=>{
    return checkStore.checkItemList.find(i=>i.id === props.globalCheckItemId)
  })
  const isItemDeleted = computed(()=> !targetItem.value || targetItem.value.isDeleted)
  const targetThemeColor = computed(()=> targetItem.value?.themeColor || '#999999')
  const displayName = computed(()=>{
    if(isItemDeleted.value) return "该打卡项已被删除"
    return targetItem.value.name
  })
  
  const todayStr = new Date().toISOString().slice(0,10)
  const isChecked = computed(()=>{
    if(isItemDeleted.value) return false
    return !!checkStore.checkRecordList.find(r=>
      r.checkItemId === props.globalCheckItemId && r.checkDate === todayStr
    )
  })
  
  // 点击打卡/取消打卡
  async function handleClickIcon(){
    if(isItemDeleted.value) return
    if(isChecked.value){
      if(window.confirm("是否取消今日打卡？")){
        await checkStore.cancelCheckToday(props.globalCheckItemId)
      }
    }else{
      await checkStore.doCheckToday(props.globalCheckItemId)
    }
  }
  
  //拖拽逻辑 鼠标
  function onDragStart(e){
    if(!props.isEditMode) return
    e.preventDefault()
    dragState.value.dragging = true
    dragState.value.startX = e.clientX
    dragState.value.startY = e.clientY
    dragState.value.originX = props.x
    dragState.value.originY = props.y
    window.addEventListener('mousemove',onMouseMove)
    window.addEventListener('mouseup',onMouseUp)
  }
  function onMouseMove(e){
    if(!dragState.value.dragging) return
    const dx = e.clientX - dragState.value.startX
    const dy = e.clientY - dragState.value.startY
    emit('move-item', {dx,dy})
  }
  function onMouseUp(){
    dragState.value.dragging = false
    window.removeEventListener('mousemove',onMouseMove)
    window.removeEventListener('mouseup',onMouseUp)
  }
  
  //移动端touch
  function onTouchStart(e){
    if(!props.isEditMode) return
    const t = e.touches[0]
    dragState.value.dragging = true
    dragState.value.startX = t.clientX
    dragState.value.startY = t.clientY
    dragState.value.originX = props.x
    dragState.value.originY = props.y
    window.addEventListener('touchmove',onTouchMove,{passive:false})
    window.addEventListener('touchend',onTouchEnd)
  }
  function onTouchMove(e){
    if(!dragState.value.dragging) return
    e.preventDefault()
    const t = e.touches[0]
    const dx = t.clientX - dragState.value.startX
    const dy = t.clientY - dragState.value.startY
    emit('move-item',{dx,dy})
  }
  function onTouchEnd(){
    dragState.value.dragging = false
    window.removeEventListener('touchmove',onTouchMove)
    window.removeEventListener('touchend',onTouchEnd)
  }
  
  onUnmounted(()=>{
    window.removeEventListener('mousemove',onMouseMove)
    window.removeEventListener('mouseup',onMouseUp)
    window.removeEventListener('touchmove',onTouchMove)
    window.removeEventListener('touchend',onTouchEnd)
  })
  </script>
  
  <style scoped>
  .check-icon-wrap{
    position:absolute;
    width:80px;
  }
  .del-btn{
    position:absolute;
    top:-8px;
    left:-8px;
    width:20px;height:20px;
    border-radius:50%;
    background:#f44336;
    color:white;
    border:none;
    z-index:10;
    cursor:pointer;
  }
  .real-tag{
    position:absolute;
    top:-4px;
    right:0;
    font-size:10px;
    color:#666;
  }
  .circle-icon{
    width:44px;height:44px;
    border-radius:50%;
    margin:0 auto;
    cursor:pointer;
  }
  .circle-icon.deleted{
    background:#999 !important;
    cursor:not-allowed;
  }
  .icon-name{
    font-size:12px;
    text-align:center;
    margin-top:4px;
    word-break:break-all;
  }
  </style>
  