<template>
    <el-dialog v-model="visible" title="配置月度打卡统计" @close="reset">
      <el-form :model="form">
        <el-form-item label="关联打卡项">
          <el-select v-model="form.checkItemId" style="width:100%">
            <el-option v-for="item in checkItemList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="统计年月">
          <el-date-picker v-model="form.yearMonth" type="month" value-format="yyyy-MM" style="width:100%"></el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible=false">取消</el-button>
        <el-button type="primary" @click="onConfirm">确定</el-button>
      </template>
    </el-dialog>
    </template>
    
    <script setup>
    import {ref,watch} from 'vue'
    const props = defineProps({
      modelValue:{type:Boolean,default:false},
      checkItemList:{type:Array,default:()=>[]},
      initCheckId:{type:String,default:''},
      initYm:{type:String,default:''}
    })
    const emit = defineEmits(['update:model-value','confirm'])
    const visible = ref(false)
    watch(()=>props.modelValue, v=>visible.value=v)
    watch(visible, v=>emit('update:model-value',v))
    
    const form = ref({
      checkItemId:'',
      yearMonth:''
    })
    
    watch(()=>[props.initCheckId,props.initYm], ()=>{
      form.value.checkItemId = props.initCheckId
      form.value.yearMonth = props.initYm
    })
    
    function onConfirm(){
      emit('confirm', {...form.value})
      visible.value = false
    }
    function reset(){
      form.value.checkItemId = props.initCheckId
      form.value.yearMonth = props.initYm
    }
    </script>
    