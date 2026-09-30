<template>
    <el-dialog v-model="visible" title="从备份文件恢复数据" width="520px" @close="handleClose">
      <el-alert
        title="注意"
        type="warning"
        :closable="false"
        style="margin-bottom:12px"
      >
        <div>1. 备份JSON<strong>不包含图片</strong>，图片资源无法恢复</div>
        <div>2. 覆盖模式：清空当前所有数据，完全替换为备份内容，不可撤销</div>
        <div>3. 合并模式：按ID合并，不会删除现有记录，冲突id会被备份覆盖</div>
      </el-alert>
    
      <el-form :model="form">
        <el-form-item label="备份文件(.json)">
          <el-button @click="triggerFileSelect">选择json备份文件</el-button>
          <div v-if="selectedFileName" style="margin-top:4px">已选：{{selectedFileName}}</div>
          <input ref="fileInputRef" type="file" accept=".json" style="display:none" @change="onFileChange"/>
        </el-form-item>
        <el-form-item label="导入模式">
          <el-radio-group v-model="form.mode">
            <el-radio label="merge">合并模式（推荐）</el-radio>
            <el-radio label="overwrite">⚠️覆盖全部现有数据</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :disabled="!selectedFile" @click="runRestore">开始导入恢复</el-button>
      </template>
    </el-dialog>
    </template>
    
    <script setup>
    import { ref, watch } from 'vue'
    import { ElMessageBox } from 'element-plus'
    import { readBackupJsonFile, restoreFromBackup } from '../../utils/importRestoreUtil'
    
    const props = defineProps({
      modelValue: { type: Boolean, default: false }
    })
    const emit = defineEmits(['update:model-value', 'restore-done'])
    
    const visible = ref(false)
    watch(() => props.modelValue, v => visible.value = v)
    watch(visible, v => emit('update:model-value', v))
    
    const fileInputRef = ref(null)
    const selectedFile = ref(null)
    const selectedFileName = ref('')
    const form = ref({
      mode: 'merge'
    })
    
    function triggerFileSelect() {
      fileInputRef.value.click()
    }
    
    async function onFileChange(e) {
      const file = e.target.files[0]
      if (!file) {
        selectedFile.value = null
        selectedFileName.value = ''
        return
      }
      selectedFile.value = file
      selectedFileName.value = file.name
    }
    
    async function runRestore() {
      if (!selectedFile.value) return
      const mode = form.value.mode
    
      // 二次确认弹窗
      const confirmText = mode === 'overwrite'
        ? '确认【覆盖模式】：当前全部数据会被清空替换，操作不可撤销！确定继续吗？'
        : '确认执行合并导入？ID冲突记录将被备份数据覆盖。'
    
      await ElMessageBox.confirm(confirmText, '操作确认', {
        confirmButtonText: '确认执行',
        cancelButtonText: '取消',
        type: 'warning'
      })
    
      try {
        const backupJson = await readBackupJsonFile(selectedFile.value)
        await restoreFromBackup(backupJson, mode)
        ElMessageBox.alert('✅导入恢复成功！页面会刷新数据', '完成')
        visible.value = false
        emit('restore-done')
      } catch (err) {
        console.error(err)
        ElMessageBox.alert(`❌导入失败：${err.message}`, '错误', { type: 'error' })
      }
    }
    
    function handleClose() {
      selectedFile.value = null
      selectedFileName.value = ''
      form.value.mode = 'merge'
      if (fileInputRef.value) fileInputRef.value.value = ''
    }
    </script>
    