<template>
    <el-dialog v-model="visible" title="配置财务饼图统计年月">
      <el-form :model="form">
        <el-form-item label="统计年月">
          <el-date-picker v-model="form.statYearMonth" type="month" value-format="yyyy-MM" style="width:100%"></el-date-picker>
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
    const props = defineProps({
      modelValue:{type:Boolean,default:false},
      initYm:{type:String,default:''}
    })
    const emit = defineEmits(['update:model-value','confirm'])
    const visible = ref(false)
    watch(()=>props.modelValue, v=>visible.value = v)
    watch(visible, v=>emit('update:model-value',v))
    
    const form = ref({statYearMonth:''})
    watch(()=>props.initYm, ()=> form.value.statYearMonth = props.initYm)
    
    function confirm(){
      emit('confirm', {...form.value})
      visible.value = false
    }
    </script>
    