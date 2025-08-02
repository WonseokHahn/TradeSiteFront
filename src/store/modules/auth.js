import axios from 'axios'
import apiClient from '@/utils/api'
import { useToast } from 'vue-toastification'

const API_BASE_URL = process.env.VUE_APP_API_URL || '/api'

const state = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false
}

const mutations = {
  SET_USER(state, user) {
    state.user = user
    state.isAuthenticated = !!user
  },
  
  SET_TOKEN(state, token) {
    state.token = token
    if (token) {
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    }
  },
  
  LOGOUT(state) {
    state.user = null
    state.token = null
    state.isAuthenticated = false
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
  }
}

const actions = {
  async loadUserProfile({ commit, state }) {
    try {
      if (!state.token) return
      
      // 토큰이 있으면 Authorization 헤더 설정
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
      
      // const response = await axios.get(`${API_BASE_URL}/auth/profile`)
      const response = await apiClient.get('/auth/profile')

      if (response.data.success) {
        commit('SET_USER', response.data.user)
      } else {
        // 토큰이 유효하지 않은 경우
        commit('LOGOUT')
      }
    } catch (error) {
      console.error('프로필 로드 실패:', error)
      commit('LOGOUT')
    }
  },
  
  async loginWithToken({ commit, dispatch }, token) {
    try {
      commit('SET_TOKEN', token)
      await dispatch('loadUserProfile')
      
      const toast = useToast()
      toast.success('로그인되었습니다!')
      
      return true
    } catch (error) {
      console.error('토큰 로그인 실패:', error)
      commit('LOGOUT')
      
      const toast = useToast()
      toast.error('로그인에 실패했습니다.')
      
      return false
    }
  },
  
  async logout({ commit }) {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`)
    } catch (error) {
      console.error('로그아웃 API 호출 실패:', error)
    } finally {
      commit('LOGOUT')
      
      const toast = useToast()
      toast.success('로그아웃되었습니다.')
    }
  },
  
  // OAuth 로그인 URL 생성
  getGoogleLoginUrl() {
    return `${API_BASE_URL}/auth/google`
  },
  
  getKakaoLoginUrl() {
    return `${API_BASE_URL}/auth/kakao`
  }
}

const getters = {
  isAuthenticated: state => state.isAuthenticated,
  user: state => state.user,
  token: state => state.token,
  userName: state => state.user?.name || '',
  userAvatar: state => state.user?.avatar || ''
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}