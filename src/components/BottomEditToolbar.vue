<template>
    <div class="bottom-toolbar">
      <div class="toolbar-top">
        <button v-for="menu in mainMenus" :key="menu.key" @click="activeMenuKey = activeMenuKey===menu.key ? '' : menu.key">
          {{menu.label}}
        </button>
      </div>
      <div v-if="activeMenuKey" class="sub-menu">
        <template v-if="activeMenuKey === 'component'">
          <button v-for="b in compBtns" :key="b.key" @click="$emit('add-component',b.key)">
            {{b.label}}
          </button>
        </template>
        <template v-if="activeMenuKey === 'text'">
          <button v-for="b in textBtns" :key="b.key" @click="$emit('text-action',b.key)">
            {{b.label}}
          </button>
        </template>
        <template v-if="activeMenuKey === 'image'">
          <button @click="$emit('upload-image')">上传图片</button>
        </template>
        <template v-if="activeMenuKey === 'sticker'">
          <div class="sticker-panel">
            <button v-for="s in stickerList" :key="s.id" @click="$emit('add-sticker',s)">
              {{s.name}}
            </button>
          </div>
        </template>
      </div>
    </div>
    </template>
    
    <script setup>
    import { ref } from 'vue'
    defineEmits(['add-component','text-action','upload-image','add-sticker'])
    
    const activeMenuKey = ref('')
    const mainMenus = [
      {key:'component', label:'组件'},
      {key:'text', label:'文字'},
      {key:'image', label:'图片'},
      {key:'sticker', label:'贴纸'}
    ]
    const compBtns = [
      {key:'checkIcon', label:'打卡'},
      {key:'monthCheckStat', label:'月度打卡统计'},
      {key:'monthFinancePie', label:'月度财务报表饼图'},
      {key:'accountItem', label:'记账'},
      {key:'dayCostTotal', label:'今日开销'}
    ]
    const textBtns = [
      {key:'bold', label:'加粗'},
      {key:'lineAdd', label:'增加行距'},
      {key:'lineSub', label:'减少行距'},
      {key:'fontAdd', label:'加大字号'},
      {key:'fontSub', label:'减少字号'}
    ]
    // 内置贴纸示例
    const stickerList = ref([
      {id:'s1', name:'贴纸A'},
      {id:'s2', name:'贴纸B'}
    ])
    </script>
    
    <style scoped>
    .bottom-toolbar{
      background:#fff;
      border-top:1px solid #ccc;
      padding:8px;
    }
    .toolbar-top{
      display:flex; gap:6px; flex-wrap:wrap;
    }
    .sub-menu{
      margin-top:8px;
      display:flex; gap:6px; flex-wrap:wrap;
    }
    button{
      padding:6px 10px;
    }
    </style>
    