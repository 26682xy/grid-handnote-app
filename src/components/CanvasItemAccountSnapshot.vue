<template>
    <div class="account-snap" :style="{left:x+'px',top:y+'px'}"
      @mousedown="onDragStart($event)" @touchstart="onTouchStart($event)"
      @click="$emit('click-item')">
      <button v-if="isEditMode" class="del-btn" @click.stop="$emit('delete-item')">×</button>
      <div class="desc">{{description}}</div>
      <div class="row">
        <span>{{category}}</span>
        <span>￥{{amount}}</span>
      </div>
      <div class="date">{{occurDate}}</div>
    </div>
    </template>
    
    <script setup>
    import {ref,onUnmounted} from 'vue'
    const props = defineProps({
      x:Number,y:Number,
      description:String,
      category:String,
      amount:Number,
      occurDate:String,
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
    .account-snap{
      position:absolute;min-width:160px;border:1px solid #bbb;background:#fff;padding:6px;
    }
    .del-btn{
      position:absolute;top:-8px;left:-8px;width:20px;height:20px;border-radius:50%;
      background:#f44336;color:white;border:none;z-index:10;
    }
    .desc{font-size:13px;margin-bottom:4px;}
    .row{display:flex;justify-content:space-between;font-size:12px;}
    .date{font-size:11px;color:#666;margin-top:4px;}
    </style>
    