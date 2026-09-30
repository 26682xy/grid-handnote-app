<template>
    <div class="month-check-stat-snap" :style="{left:x+'px',top:y+'px'}"
      @mousedown="onDragStart($event)" @touchstart="onTouchStart($event)"
      @click="$emit('click-item')">
      <button v-if="isEditMode" class="del-btn" @click.stop="$emit('delete-item')">×</button>
      <div class="title">{{statYearMonth}}</div>
      <div class="calendar-grid">
        <div v-for="d in dateStatusList" :key="d.date"
          class="day-cell" :class="{checked:d.checked}"
          :style="{background:d.checked ? '#42b983' : '#efefef'}">
          {{Number(d.date.split('-')[2])}}
        </div>
      </div>
    </div>
    </template>
    
    <script setup>
    import {ref,onUnmounted} from 'vue'
    const props = defineProps({
      x:Number,y:Number,
      statYearMonth:String,
      dateStatusList:Array,
      isEditMode:Boolean,
      isSelected:{type:Boolean,default:false}
    })
    const emit = defineEmits(['delete-item','move-item','click-item'])
    const dragState = ref({dragging:false,startX:0,startY:0})
    
    function onDragStart(e){
      if(!props.isEditMode) return
      e.preventDefault()
      dragState.value.dragging=true
      dragState.value.startX=e.clientX;dragState.value.startY=e.clientY
      window.addEventListener('mousemove',mouseMove)
      window.addEventListener('mouseup',mouseUp)
    }
    function mouseMove(e){
      if(!dragState.value.dragging) return
      emit('move-item',{dx:e.clientX-dragState.value.startX, dy:e.clientY-dragState.value.startY})
    }
    function mouseUp(){dragState.value.dragging=false;window.removeEventListener('mousemove',mouseMove);window.removeEventListener('mouseup',mouseUp)}
    
    function onTouchStart(e){
      if(!props.isEditMode) return
      const t = e.touches[0]
      dragState.value.dragging=true
      dragState.value.startX=t.clientX;dragState.value.startY=t.clientY
      window.addEventListener('touchmove',touchMove,{passive:false})
      window.addEventListener('touchend',touchEnd)
    }
    function touchMove(e){
      if(!dragState.value.dragging) return;e.preventDefault()
      const t = e.touches[0]
      emit('move-item',{dx:t.clientX-dragState.value.startX, dy:t.clientY-dragState.value.startY})
    }
    function touchEnd(){dragState.value.dragging=false;window.removeEventListener('touchmove',touchMove);window.removeEventListener('touchend',touchEnd)}
    
    onUnmounted(()=>{
      window.removeEventListener('mousemove',mouseMove)
      window.removeEventListener('mouseup',mouseUp)
      window.removeEventListener('touchmove',touchMove)
      window.removeEventListener('touchend',touchEnd)
    })
    </script>
    
    <style scoped>
    .month-check-stat-snap{
      position:absolute;width:240px;background:#fff;border:1px solid #ddd;padding:8px;
    }
    .del-btn{
      position:absolute;top:-8px;left:-8px;width:20px;height:20px;border-radius:50%;
      background:#f44336;color:white;border:none;z-index:10;
    }
    .title{text-align:center;margin-bottom:6px;font-weight:bold;}
    .calendar-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;}
    .day-cell{text-align:center;font-size:11px;padding:4px 0;}
    </style>
    