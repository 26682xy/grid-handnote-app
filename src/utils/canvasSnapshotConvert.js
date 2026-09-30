/**
 * 将实时画布元素数组转换为快照数组
 * @param {Array} items 画布实时item列表
 * @param {Object} globalStores {checkGlobal, accountList} 全局数据源
 * @returns {Array} snapshotItems 全部快照类型元素
 */
export function convertCanvasItemsToSnapshot(items, { checkGlobal, accountList }) {
    return items.map(item => {
      switch (item.itemType) {
        case 'checkIcon': {
          const gCheck = checkGlobal.find(c => c.id === item.globalCheckItemId)
          if (!gCheck) {
            return {
              itemType: 'checkIconSnapshot',
              x: item.x,
              y: item.y,
              _itemId: baseId,
              name: '[打卡项已删除]',
              themeColor: '#999999',
              todayChecked: false
            }
          }
          // 查询今日是否打卡
          const today = new Date().toISOString().slice(0,10)
          const todayChecked = !!checkGlobal.records?.find(r => r.checkItemId === gCheck.id && r.checkDate === today)
          return {
            itemType: 'checkIconSnapshot',
            x: item.x,
            y: item.y,
            _itemId: baseId,
            name: gCheck.name,
            themeColor: gCheck.themeColor,
            todayChecked
          }
        }
  
        case 'monthCheckStat': {
          // 生成日期状态快照
          const { globalCheckItemId, statYearMonth } = item
          const [y, m] = statYearMonth.split('-').map(Number)
          const dateStatusList = buildMonthStatusSnapshot(y, m, globalCheckItemId, checkGlobal)
          return {
            itemType: 'monthCheckStatSnapshot',
            x: item.x,
            y: item.y,
            _itemId: baseId,
            statYearMonth,
            dateStatusList
          }
        }
  
        case 'monthFinancePie': {
          const snapshotCategory = calcFinanceSnapshot(item.statYearMonth, accountList)
          return {
            itemType: 'monthFinancePieSnapshot',
            x: item.x,
            y: item.y,
            _itemId: baseId,
            statYearMonth: item.statYearMonth,
            categorySnapshot: snapshotCategory
          }
        }
  
        case 'accountItem': {
          const acc = accountList.find(a => a.id === item.globalAccountId)
          if (!acc) return null
          return {
            itemType: 'accountItemSnapshot',
            x: item.x,
            y: item.y,
            _itemId: baseId,
            description: acc.description,
            category: acc.category,
            amount: acc.amount,
            occurDate: acc.occurDate
          }
        }
  
        case 'dayCostTotal': {
          // 仅统计当前画布记账item金额求和
          const sumVal = items
            .filter(i=>i.itemType === 'accountItem')
            .reduce((s,cur)=>{
              const acc = accountList.find(a=>a.id === cur.globalAccountId)
              return s + (acc?.amount||0)
            },0)
          return {
            itemType: 'dayCostTotalSnapshot',
            x: item.x,
            y: item.y,
            _itemId: baseId,
            totalAmount: sumVal
          }
        }
  
        // 本身静态组件直接透传
        case 'textBox':
        case 'uploadImage':
        case 'sticker':
        case 'checkIconSnapshot':
        case 'monthCheckStatSnapshot':
        case 'monthFinancePieSnapshot':
        case 'accountItemSnapshot':
        case 'dayCostTotalSnapshot':
          return {...item}
  
        default:
          return item
      }
    }).filter(Boolean)
  }
  
  /** 构建某月打卡状态数组 */
  function buildMonthStatusSnapshot(year, month, checkItemId, checkGlobal) {
    const daysInMonth = new Date(year, month, 0).getDate()
    const records = checkGlobal.records.filter(r=>r.checkItemId === checkItemId)
    const arr = []
    for(let d=1;d<=daysInMonth;d++){
      const ds = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      arr.push({
        date: ds,
        checked: !!records.find(r=>r.checkDate === ds)
      })
    }
    return arr
  }
  
  /** 计算财务饼图快照分类金额 */
  function calcFinanceSnapshot(statYM, accountList) {
    const [y,m] = statYM.split('-')
    const list = accountList.filter(acc=>acc.occurDate.startsWith(`${y}-${m}`))
    const map = {}
    list.forEach(acc=>{
      if(!map[acc.category]) map[acc.category] = 0
      map[acc.category] += acc.amount
    })
    return Object.entries(map).map(([name,value])=>({name,value}))
  }
  