import apiClient from '@/utils/api'
import { useToast } from 'vue-toastification'

const API_BASE_URL = process.env.VUE_APP_API_URL || '/api'

const state = {
  articles: [],
  loading: false,
  searchKeyword: ''
}

const mutations = {
  SET_ARTICLES(state, articles) {
    state.articles = articles
  },
  
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  
  SET_SEARCH_KEYWORD(state, keyword) {
    state.searchKeyword = keyword
  },
  
  CLEAR_ARTICLES(state) {
    state.articles = []
    state.searchKeyword = ''
  }
}

const actions = {
  async searchNews({ commit }, keyword) {
    if (!keyword || keyword.trim() === '') {
      const toast = useToast()
      toast.warning('검색 키워드를 입력해주세요.')
      return
    }
    
    commit('SET_LOADING', true)
    commit('SET_SEARCH_KEYWORD', keyword)
    
    try {
      // const response = await axios.get(`${API_BASE_URL}/news/search`, {
      //   params: { keyword: keyword.trim() }
      // })
      const response = await apiClient.get('/news/search', {
        params: { keyword: keyword.trim() }
      })
      if (response.data.success) {
        commit('SET_ARTICLES', response.data.data)
        
        if (response.data.data.length === 0) {
          const toast = useToast()
          toast.info('검색 결과가 없습니다.')
        }
      } else {
        throw new Error(response.data.message || '뉴스 검색에 실패했습니다.')
      }
    } catch (error) {
      console.error('뉴스 검색 오류:', error)
      commit('SET_ARTICLES', [])
      
      const toast = useToast()
      toast.error(error.response?.data?.message || '뉴스 검색 중 오류가 발생했습니다.')
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  clearNews({ commit }) {
    commit('CLEAR_ARTICLES')
  }
}

const getters = {
  articles: state => state.articles,
  isLoading: state => state.loading,
  searchKeyword: state => state.searchKeyword,
  hasArticles: state => state.articles.length > 0
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}