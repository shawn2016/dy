import { ref, computed } from 'vue'
import { getCovers, deleteCover } from '@/api/cover'
import { ElMessage, ElMessageBox } from 'element-plus'

export interface Cover {
  id: number
  name: string
  image_url?: string
  cropped_image_path?: string
  video_path?: string
  status: number
  created_at: string
  [key: string]: any
}

export interface QueryParams {
  name?: string
  start_time?: string
  end_time?: string
  status?: number
  page: number
  page_size: number
}

/**
 * 封面列表相关的组合式函数
 */
export function useCoverList() {
  const loading = ref(false)
  const coverList = ref<Cover[]>([])
  const total = ref(0)
  const dateRange = ref<string[]>([])
  const queryParams = ref<QueryParams>({
    name: '',
    start_time: '',
    end_time: '',
    status: undefined,
    page: 1,
    page_size: 10,
  })

  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    total: 0,
  })

  /**
   * 加载封面列表
   */
  const loadCovers = async () => {
    loading.value = true
    try {
      const params: any = {
        ...queryParams.value,
        page: pagination.value.currentPage,
        page_size: pagination.value.pageSize,
      }
      
      // 处理日期范围
      if (dateRange.value && dateRange.value.length === 2) {
        params.start_time = dateRange.value[0]
        params.end_time = dateRange.value[1]
      }
      
      const response = await getCovers(params)
      coverList.value = response.data.list || []
      total.value = response.data.total || 0
      pagination.value.total = total.value
    } catch (error: any) {
      ElMessage.error(error.message || '加载封面列表失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 查询
   */
  const handleQuery = () => {
    pagination.value.currentPage = 1
    loadCovers()
  }

  /**
   * 重置
   */
  const handleReset = () => {
    queryParams.value = {
      name: '',
      start_time: '',
      end_time: '',
      status: undefined,
      page: 1,
      page_size: 10,
    }
    dateRange.value = []
    pagination.value.currentPage = 1
    loadCovers()
  }

  /**
   * 分页改变
   */
  const handlePageChange = (page: number) => {
    pagination.value.currentPage = page
    loadCovers()
  }

  /**
   * 每页条数改变
   */
  const handleSizeChange = (size: number) => {
    pagination.value.pageSize = size
    pagination.value.currentPage = 1
    loadCovers()
  }

  /**
   * 删除封面
   */
  const handleDelete = async (cover: Cover) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除封面"${cover.name}"吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      await deleteCover(cover.id)
      ElMessage.success('删除成功')
      loadCovers()
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || '删除失败')
      }
    }
  }

  return {
    loading,
    coverList,
    total,
    queryParams,
    pagination,
    dateRange,
    loadCovers,
    handleQuery,
    handleReset,
    handlePageChange,
    handleSizeChange,
    handleDelete,
  }
}

