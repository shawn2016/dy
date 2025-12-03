/**
 * 封面列表组合式函数
 */
import { ref, computed } from 'vue'
import { getCovers, deleteCover } from '@/api/cover'
import { ElMessage, ElMessageBox } from 'element-plus'

export function useCoverList() {
  const loading = ref(false)
  const coverList = ref([])
  const total = ref(0)
  const pagination = ref({
    page: 1,
    pageSize: 10
  })
  const queryParams = ref({
    name: '',
    start_time: '',
    end_time: '',
    status: null
  })
  const dateRange = ref([])

  // 加载封面列表
  const loadCovers = async () => {
    loading.value = true
    try {
      const params = {
        page: pagination.value.page,
        page_size: pagination.value.pageSize,
        ...queryParams.value
      }
      
      if (dateRange.value && dateRange.value.length === 2) {
        params.start_time = dateRange.value[0]
        params.end_time = dateRange.value[1]
      }
      
      const response = await getCovers(params)
      if (response.data) {
        coverList.value = response.data.list || []
        total.value = response.data.total || 0
      }
    } catch (error) {
      ElMessage.error('加载封面列表失败')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  // 查询
  const handleQuery = () => {
    pagination.value.page = 1
    loadCovers()
  }

  // 重置查询
  const handleReset = () => {
    queryParams.value = {
      name: '',
      start_time: '',
      end_time: '',
      status: null
    }
    dateRange.value = []
    handleQuery()
  }

  // 分页变化
  const handlePageChange = (page) => {
    pagination.value.page = page
    loadCovers()
  }

  const handleSizeChange = (size) => {
    pagination.value.pageSize = size
    pagination.value.page = 1
    loadCovers()
  }

  // 删除封面
  const handleDelete = async (cover) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除封面"${cover.name}"吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      
      await deleteCover(cover.id)
      ElMessage.success('删除成功')
      loadCovers()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
        console.error(error)
      }
    }
  }

  return {
    loading,
    coverList,
    total,
    pagination,
    queryParams,
    dateRange,
    loadCovers,
    handleQuery,
    handleReset,
    handlePageChange,
    handleSizeChange,
    handleDelete
  }
}


