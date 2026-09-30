<template>
    <el-dialog v-model="visible" title="新增记账条目" @close="resetForm">
      <el-form :model="form">
        <el-form-item label="账目描述">
          <el-input v-model="form.description"></el-input>
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="form.category"></el-input>
        </el-form-item>
        <el-form-item label="金额">
          <el-input-number v-model="form.amount" :min="0" style="width:100%"></el-input-number>
        </el-form-item>
        <el-form-item label="发生日期">
          <el-date-picker v-model="form.occurDate" type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" style="width:100%"></el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible=false">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </template>
    </el-dialog>
    </template>
    
    <script setup>
    import {ref,watch} from 'vue'
    const props = defineProps({modelValue:{type:Boolean,default:false}})
    const emit = defineEmits(['update:model-value','confirm'])
    const visible = ref(false)
    watch(()=>props.modelValue, v=>visible.value=v)
    watch(visible, v=>emit('update:model-value',v))
    
    const form = ref({
      description:'',
      category:'',
      amount:0,
      occurDate:''
    })
    
    function confirm(){
      emit('confirm', {...form.value})
      visible.value = false
    }
    function resetForm(){
      form.value = {description:'',category:'',amount:0,occurDate:''}
    }
    </script>
    