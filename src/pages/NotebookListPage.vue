<template>
    <div class="notebook-list-page">
      <header class="header">
        <button @click="$router.push('/')">←返回首页</button>
        <h3>手账本列表</h3>
        <button @click="exportBackup">导出全部备份</button>
        <button @click="dialogImportVisible = true">导入恢复</button>
      </header>
      <div class="list-wrap">
        <div v-for="nb in notebookList" :key="nb.id" class="list-item">
          <div class="title">{{nb.title}}</div>
          <div class="time">{{nb.updateAt}}</div>
          <div class="btn-group">
            <button @click="$router.push({name:'notebookView',params:{id:nb.id}})">查看</button>
            <button @click="deleteNotebook(nb.id)">删除</button>
          </div>
        </div>
      </div>
      <!--弹窗 -->
<DialogImportRestore v‑model="dialogImportVisible" @restore‑done="onRestoreDone"/>
    </div>
    </template>
    
    <script setup>
    import {ref,onMounted} from 'vue'
    import {useRouter} from 'vue-router'
    import db from '../db/index'
    import {exportAllDataBackup} from '../utils/exportBackupUtil'
    import DialogImportRestore from '../components/dialog/DialogImportRestore.vue'
    
    const router = useRouter()
    const notebookList = ref([])
    const dialogImportVisible = ref(false)
    
    async function loadList(){
      notebookList.value = await db.notebookStore.toArray()
    }
    
    async function deleteNotebook(id){
      if(!window.confirm("确定删除这条手账？删除后不可恢复")) return
      await db.notebookStore.delete(id)
      await loadList()
    }

    async function exportBackup(){
  try{
    await exportAllDataBackup()
    alert("备份导出成功，已下载json文件")
  }catch(e){
    console.error(e)
    alert("导出失败："+e.message)
  }
}

async function onRestoreDone() {
  //导入完成，重新加载手账本列表
  await loadList()
}
    
    onMounted(()=>{
      loadList()
    })
    </script>
    
    <style scoped>
    .notebook-list-page{
      height:100vh;
    }
    .header{
      display:flex;
      align-items:center;
      gap:12px;
      padding:10px;
      border-bottom:1px solid #ccc;
    }
    .list-wrap{
      padding:12px;
    }
    .list-item{
      border:1px solid #bbb;
      padding:10px;
      margin-bottom:8px;
      border-radius:6px;
    }
    .title{
      font-weight:bold;
    }
    .time{
      font-size:12px;color:#666;
      margin:4px 0;
    }
    .btn-group{
      display:flex;
      gap:8px;
    }
    </style>
    