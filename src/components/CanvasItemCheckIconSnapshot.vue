<template>
    <div class="check-icon-snap-wrap" :style="{left:x+'px',top:y+'px'}"
      @mousedown="onDragStart($event)" @touchstart="onTouchStart($event)"
      @click="$emit('click-item')">
      <button v-if="isEditMode" class="del-btn" @click.stop="$emit('delete-item')">×</button>
      <div class="circle-icon" :style="{backgroundColor: todayChecked ? themeColor : '#cccccc'}"></div>
      <div class="icon-name">{{name}}</div>
    </div>
  </template>
  
  <script setup>
  import {ref,onUnmounted} from 'vue'
  const props = defineProps({
    x:Number,y:Number,
    name:String,
    themeColor:String,
    todayChecked:Boolean,
    isEditMode:Boolean,
    isSelected:{type:Boolean,default:false}
  })
  const emit = defineEmits(['delete-item','move-item','click-item'])
  
  const dragState = ref({dragging:false,startX:0,startY:0})
  
  function onDragStart(e){
    if(!props.isEditMode) return
    e.preventDefault()
    dragState.value.dragging=true
    dragState.value.startX = e.clientX
    dragState.value.startY = e.clientY
    window.addEventListener('mousemove',onMouseMove)
    window.addEventListener('mouseup',onMouseUp)
  }
  function onMouseMove(e){
    if(!dragState.value.dragging) return
    emit('move-item',{dx:e.clientX - dragState.value.startX, dy:e.clientY - dragState.value.startY})
  }
  function onMouseUp(){
    dragState.value.dragging=false
    window.removeEventListener('mousemove',onMouseMove)
    window.removeEventListener('mouseup',onMouseUp)
  }
  function onTouchStart(e){
    if(!props.isEditMode) return
    const t = e.touches[0]
    dragState.value.dragging=true
    dragState.value.startX=t.clientX
    dragState.value.startY=t.clientY
    window.addEventListener('touchmove',touchMove,{passive:false})
    window.addEventListener('touchend',touchEnd)
  }
  function touchMove(e){
    if(!dragState.value.dragging) return
    e.preventDefault()
    const t = e.touches[0]
    emit('move-item',{dx:t.clientX-dragState.value.startX, dy:t.clientY-dragState.value.startY})
  }
  function touchEnd(){
    dragState.value.dragging=false
    window.removeEventListener('touchmove',touchMove)
    window.removeEventListener('touchend',touchEnd)
  }
  onUnmounted(()=>{
    window.removeEventListener('mousemove',onMouseMove)
    window.removeEventListener('mouseup',onMouseUp)
    window.removeEventListener('touchmove',touchMove)
    window.removeEventListener('touchend',touchEnd)
  })
  </script>
  
  <style scoped>
  .check-icon-snap-wrap{
    position:absolute;
    width:80px;
  }
  .del-btn{
    position:absolute;top:-8px;left:-8px;
    width:20px;height:20px;border-radius:50%;
    background:#f44336;color:white;border:none;z-index:10;
  }
  .circle-icon{
    width:44px;height:44px;border-radius:50%;margin:0 auto;
  }
  .icon-name{
    font-size:12px;text-align:center;margin-top:4px;
  }
  </style>
  