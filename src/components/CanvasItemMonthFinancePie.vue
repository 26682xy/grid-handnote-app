<template>
    <div class="pie-wrap" :style="{left:x+'px',top:y+'px',width:'260px',height:'240px'}"
      @mousedown="onDragStart($event)" @touchstart="onTouchStart($event)"
      @click="$emit('click-item')">
      <button v-if="isEditMode" class="del-btn" @click.stop="$emit('delete-item')">×</button>
      <div class="real-tag">实时</div>
      <div ref="pieDom" @click.stop="openConfig"></div>
    </div>
    </template>
    
    <script setup>
    import {ref,onMounted,onUnmounted,watch} from 'vue'
    import * as echarts from 'echarts'
    import db from '../db/index'
    
    const props = defineProps({
      x:Number,y:Number,
      statYearMonth:String,
      isEditMode:Boolean,
      isSelected:{type:Boolean,default:false}
    })
    const emit = defineEmits(['delete-item','move-item','reconfig','click-item'])
    
    const pieDom = ref(null)
    let chart = null
    const dragState = ref({dragging:false,startX:0,startY:0})
    
    async function renderChart(){
      if(!pieDom.value) return
      const [y,m] = props.statYearMonth.split('-').map(Number)
      const allAccounts = await db.accountGlobal.filter(a=>a.occurDate.startsWith(`${y}-${String(m).padStart(2,'0')}`)).toArray()
      const group = {}
      allAccounts.forEach(acc=>{
        if(!group[acc.category]) group[acc.category]=0
        group[acc.category] += acc.amount
      })
      const data = Object.entries(group).map(([name,value])=>({name,value}))
      if(!chart) chart = echarts.init(pieDom.value)
      chart.setOption({
        title:{text:props.statYearMonth,left:'center'},
        tooltip:{trigger:'item'},
        legend:{orient:'vertical',left:'left'},
        series:[{type:'pie',radius:'50%',data}]
      })
    }
    
    function openConfig(){
      emit('reconfig')
    }
    
    watch(()=>props.statYearMonth,()=>renderChart())
    onMounted(async ()=>{
      await renderChart()
    })
    onUnmounted(()=>{
      chart?.dispose()
    })
    
    //拖拽
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
    .pie-wrap{
      position:absolute;
      border:1px solid #ddd;
      background:#fff;
    }
    .del-btn{
      position:absolute;top:-8px;left:-8px;
      width:20px;height:20px;border-radius:50%;background:#f44336;color:white;border:none;z-index:10;
    }
    .real-tag{position:absolute;top:2px;right:4px;font-size:10px;color:#666;z-index:5;}
    </style>
    