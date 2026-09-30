<template>
    <el-dialog v-model="visible" title="新建打卡项" @close="handleClose">
      <el-form :model="form">
        <el-form-item label="打卡名称">
          <el-input v-model="form.name" placeholder="例如：喝水、运动"></el-input>
        </el-form-item>
        <el-form-item label="完成主题色">
          <el-color-picker v-model="form.themeColor"></el-color-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible=false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </template>
    </el-dialog>
    </template>
    
    <script setup>
    import {ref, watch} from 'vue'
    const props = defineProps({
      modelValue: {type:Boolean, default:false}
    })
    const emit = defineEmits(['update:model-value','confirm'])
    
    const visible = ref(false)
    watch(()=>props.modelValue, v=> visible.value = v)
    watch(visible, v=> emit('update:model-value',v))
    
    const form = ref({
      name:'',
      themeColor:'#42b983'
    })
    
    function handleConfirm(){
      if(!form.value.name.trim()) return
      emit('confirm', {...form.value})
      visible.value = false
    }
    function handleClose(){
      form.value.name = ''
      form.value.themeColor = '#42b983'
    }
    </script>
    