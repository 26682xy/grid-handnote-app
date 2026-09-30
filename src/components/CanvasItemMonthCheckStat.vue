<template>
    <div class="month-check-stat" :style="{left:x+'px',top:y+'px'}"
      @mousedown="onDragStart($event)" @touchstart="onTouchStart($event)"
      @click="$emit('click-item')">
      <button v-if="isEditMode" class="del-btn" @click.stop="$emit('delete-item')">×</button>
      <div class="real-tag">实时</div>
      <div v-if="itemDeleted" class="tip">关联打卡项已被删除，请重新配置</div>
      <div v-else @click.stop="openConfigDialog">
        <div class="title">{{statYearMonth}}</div>
        <div class="calendar-grid">
          <div v-for="d in dateList" :key="d.date"
            class="day-cell" :class="{checked:d.checked}"
            :style="{background:d.checked ? targetColor : '#efefef'}">
            {{Number(d.date.split('-')[2])}}
          </div>
        </div>
      </div>
    </div>
    </template>
    
    <script setup>
    import {ref,computed,onUnmounted} from 'vue'
    import { useCheckGlobalStore } from '../stores/checkGlobalStore'
    
    const props = defineProps({
      x:Number,y:Number,
      globalCheckItemId:String,
      statYearMonth:String,
      isEditMode:Boolean,
      isSelected:{type:Boolean,default:false}
    })
    const emit = defineEmits(['delete-item','move-item','reconfig', 'resize-item','click-item'])
    const checkStore = useCheckGlobalStore()
    
    const dragState = ref({dragging:false,startX:0,startY:0})
    
    const targetCheckItem = computed(()=> checkStore.checkItemList.find(i=>i.id === props.globalCheckItemId))
    const itemDeleted = computed(()=> !targetCheckItem.value || targetCheckItem.value.isDeleted)
    const targetColor = computed(()=> targetCheckItem.value?.themeColor || '#aaa')
    
    const dateList = computed(()=>{
      if(itemDeleted.value) return []
      const [y,m] = props.statYearMonth.split('-').map(Number)
      const totalDay = new Date(y,m,0).getDate()
      const records = checkStore.checkRecordList.filter(r=>r.checkItemId === props.globalCheckItemId)
      const arr=[]
      for(let i=1;i<=totalDay;i++){
        const ds = `${y}-${String(m).padStart(2,'0')}-${String(i).padStart(2,'0')}`
        arr.push({
          date:ds,
          checked: !!records.find(r=>r.checkDate===ds)
        })
      }
      return arr
    })
    
    function openConfigDialog(){
      emit('reconfig')
    }
    
    //拖拽
    function onDragStart(e){
      if(!props.isEditMode) return
      e.preventDefault()
      dragState.value.dragging=true
      dragState.value.startX=e.clientX
      dragState.value.startY=e.clientY
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
    .month-check-stat{
      position:absolute;
      width:240px;
      background:#fff;
      border:1px solid #ddd;
      padding:8px;
    }
    .del-btn{
      position:absolute;top:-8px;left:-8px;
      width:20px;height:20px;border-radius:50%;background:#f44336;color:white;border:none;z-index:10;
    }
    .real-tag{position:absolute;top:2px;right:4px;font-size:10px;color:#666;}
    .tip{color:red;font-size:12px;padding:10px;}
    .title{text-align:center;margin-bottom:6px;font-weight:bold;}
    .calendar-grid{
      display:grid;
      grid-template-columns: repeat(7,1fr);
      gap:2px;
    }
    .day-cell{
      text-align:center;font-size:11px;padding:4px 0;
    }
    </style>
    