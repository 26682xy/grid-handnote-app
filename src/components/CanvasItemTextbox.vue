<template>
    <div class="textbox" :class="{selected:isSelected}" :style="{left:x+'px',top:y+'px',width:w+'px',height:h+'px'}"
      @mousedown="onDragStart($event)" @touchstart="onTouchStart($event)"
      @click="$emit('click-item')">
      <button v-if="isEditMode" class="del-btn" @click.stop="$emit('delete-item')">×</button>
      <div class="text-content" :style="textStyle" contenteditable @input="onInput">{{text}}</div>
      <!--右下角缩放手柄，放大触摸热区-->
      <div v-if="isEditMode" class="resize-handle" @mousedown.stop="startResize($event)" @touchstart.stop="startResizeTouch($event)"></div>
    </div>
    </template>
    
    <script setup>
    import {ref,onUnmounted,watch} from 'vue'
    const props = defineProps({
      x:Number,y:Number,w:Number,h:Number,
      text:String,
      fontSize:{type:Number,default:14},
      lineHeight:{type:Number,default:1.5},
      bold:{type:Boolean,default:false},
      isEditMode:Boolean,
      isSelected:{type:Boolean,default:false}
    })
    const emit = defineEmits(['delete-item','move-item','resize-item','text-change','click-item'])
    
    const dragState = ref({dragging:false,resize:false,startX:0,startY:0,originW:0,originH:0})
    
    const textStyle = ref({
      fontSize: props.fontSize+'px',
      lineHeight: props.lineHeight,
      fontWeight: props.bold ? 'bold':'normal'
    })
    
    watch(()=>[props.fontSize,props.lineHeight,props.bold], ()=>{
      textStyle.value.fontSize = props.fontSize + 'px'
      textStyle.value.lineHeight = props.lineHeight
      textStyle.value.fontWeight = props.bold ? 'bold' : 'normal'
    })
    
    function onInput(e){
      emit('text-change',e.target.innerText)
    }
    
    //移动
    function onDragStart(e){
      if(!props.isEditMode || dragState.value.resize) return
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
    function mouseUp(){dragState.value.dragging=false;dragState.value.resize=false;window.removeEventListener('mousemove',mouseMove);window.removeEventListener('mouseup',mouseUp)}
    
    //缩放鼠标
    function startResize(e){
      dragState.value.resize=true
      dragState.value.startX=e.clientX
      dragState.value.startY=e.clientY
      dragState.value.originW=props.w
      dragState.value.originH=props.h
      window.addEventListener('mousemove',resizeMouseMove)
      window.addEventListener('mouseup',mouseUp)
    }
    function resizeMouseMove(e){
      if(!dragState.value.resize) return
      const nw = dragState.value.originW + (e.clientX - dragState.value.startX)
      const nh = dragState.value.originH + (e.clientY - dragState.value.startY)
      emit('resize-item',{w:Math.max(60,nw),h:Math.max(40,nh)})
    }
    
    //touch
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
    
    function startResizeTouch(e){
      dragState.value.resize=true
      const t = e.touches[0]
      dragState.value.startX=t.clientX
      dragState.value.startY=t.clientY
      dragState.value.originW=props.w
      dragState.value.originH=props.h
      window.addEventListener('touchmove',resizeTouchMove,{passive:false})
      window.addEventListener('touchend',touchResizeEnd)
    }
    function resizeTouchMove(e){
      if(!dragState.value.resize) return;e.preventDefault()
      const t = e.touches[0]
      const nw = dragState.value.originW + (t.clientX - dragState.value.startX)
      const nh = dragState.value.originH + (t.clientY - dragState.value.startY)
      emit('resize-item',{w:Math.max(60,nw),h:Math.max(40,nh)})
    }
    function touchResizeEnd(){dragState.value.resize=false;window.removeEventListener('touchmove',resizeTouchMove);window.removeEventListener('touchend',touchResizeEnd)}
    
    onUnmounted(()=>{
      window.removeEventListener('mousemove',mouseMove)
      window.removeEventListener('mouseup',mouseUp)
      window.removeEventListener('touchmove',touchMove)
      window.removeEventListener('touchend',touchEnd)
    })
    </script>
    
    <style scoped>
    .textbox{
      position:absolute;
      border:1px solid #999;
      background:#fff;
      overflow:hidden;
    }
    .textbox.selected{
      border:2px solid #409eff;
    }
    .del-btn{
      position:absolute;top:-8px;left:-8px;width:20px;height:20px;border-radius:50%;
      background:#f44336;color:white;border:none;z-index:10;
    }
    .text-content{
      width:100%;height:100%;
      padding:4px;
      overflow:auto;
      white-space:pre-wrap;
    }
    .resize-handle{
      position:absolute;
      right:0;bottom:0;
      width:24px;height:24px;
      background:#888;
      opacity:0.6;
      cursor:nw-se-resize;
    }
    </style>
    