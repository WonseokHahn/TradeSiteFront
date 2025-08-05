import apiClient from '@/utils/api'
import { useToast } from 'vue-toastification'

const state = {
  strategies: [],
  bestStrategy: null,
  currentStrategy: null,
  isTrading: false,
  loading: false
}

const mutations = {
  SET_STRATEGIES(state, strategies) {
    state.strategies = strategies
  },
  
  SET_BEST_STRATEGY(state, strategy) {
    state.bestStrategy = strategy
  },
  
  SET_CURRENT_STRATEGY(state, strategy) {
    state.currentStrategy = strategy
  },
  
  SET_TRADING_STATUS(state, status) {
    state.isTrading = status.isActive
    state.currentStrategy = status.strategy
  },
  
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  
  ADD_STRATEGY(state, strategy) {
    state.strategies.unshift(strategy)
  }
}

const actions = {
  async loadStrategies({ commit }) {
    commit('SET_LOADING', true)
    
    try {
      const response = await apiClient.get('/trading/strategies')
      
      if (response.data.success) {
        commit('SET_STRATEGIES', response.data.data)
      }
    } catch (error) {
      console.error('전략 로드 실패:', error)
      
      const toast = useToast()
      toast.error('전략을 불러오는데 실패했습니다.')
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async loadBestStrategy({ commit }) {
    try {
      const response = await apiClient.get('/trading/strategies/best')
      
      if (response.data.success) {
        commit('SET_BEST_STRATEGY', response.data.data)
      }
    } catch (error) {
      console.error('최적 전략 로드 실패:', error)
    }
  },
  
  async loadTradingStatus({ commit }) {
    try {
      const response = await apiClient.get('/trading/status')
      
      if (response.data.success) {
        commit('SET_TRADING_STATUS', response.data.data)
      }
    } catch (error) {
      console.error('트레이딩 상태 로드 실패:', error)
    }
  },
  
  async createStrategy({ commit }, strategyData) {
    commit('SET_LOADING', true)
    
    try {
      console.log('전략 생성 데이터:', strategyData)
      
      const response = await apiClient.post('/trading/strategies', strategyData)
      
      if (response.data.success) {
        commit('ADD_STRATEGY', response.data.data)
        commit('SET_CURRENT_STRATEGY', response.data.data)
        
        const toast = useToast()
        toast.success('전략이 생성되었습니다.')
        
        return true
      }
    } catch (error) {
      console.error('전략 생성 실패:', error)
      
      const toast = useToast()
      toast.error(error.response?.data?.message || '전략 생성에 실패했습니다.')
      
      return false
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async startTrading({ commit, dispatch }, strategyId) {
    commit('SET_LOADING', true)
    
    try {
      console.log('자동매매 시작 요청:', strategyId)
      
      const response = await apiClient.post('/trading/start', {
        strategyId
      })
      
      if (response.data.success) {
        await dispatch('loadTradingStatus')
        
        const toast = useToast()
        toast.success('자동매매가 시작되었습니다.')
        
        return true
      }
    } catch (error) {
      console.error('자동매매 시작 실패:', error)
      
      const toast = useToast()
      toast.error(error.response?.data?.message || '자동매매 시작에 실패했습니다.')
      
      return false
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async stopTrading({ commit, dispatch }) {
    commit('SET_LOADING', true)
    
    try {
      console.log('자동매매 중단 요청')
      
      const response = await apiClient.post('/trading/stop')
      
      if (response.data.success) {
        await dispatch('loadTradingStatus')
        
        const toast = useToast()
        toast.success('자동매매가 중단되었습니다.')
        
        return true
      }
    } catch (error) {
      console.error('자동매매 중단 실패:', error)
      
      const toast = useToast()
      toast.error(error.response?.data?.message || '자동매매 중단에 실패했습니다.')
      
      return false
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

const getters = {
  strategies: state => state.strategies,
  bestStrategy: state => state.bestStrategy,
  currentStrategy: state => state.currentStrategy,
  isTrading: state => state.isTrading,
  isLoading: state => state.loading,
  hasStrategies: state => state.strategies.length > 0
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}