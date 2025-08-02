import apiClient from '@/utils/api'
import { useToast } from 'vue-toastification'

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
      // apiClient는 이미 인터셉터에서 토큰을 자동으로 추가함
    } else {
      localStorage.removeItem('token')
    }
  },
  
  LOGOUT(state) {
    state.user = null
    state.token = null
    state.isAuthenticated = false
    localStorage.removeItem('token')
  }
}

const actions = {
  async loadUserProfile({ commit, state }) {
    try {
      if (!state.token) return
      
      console.log('👤 사용자 프로필 로딩 중...')
      const response = await apiClient.get('/auth/profile')
      
      if (response.data.success) {
        commit('SET_USER', response.data.user)
        console.log('✅ 사용자 프로필 로드 성공:', response.data.user.email)
      } else {
        // 토큰이 유효하지 않은 경우
        console.log('⚠️ 유효하지 않은 토큰 - 로그아웃 처리')
        commit('LOGOUT')
      }
    } catch (error) {
      console.error('❌ 프로필 로드 실패:', error)
      commit('LOGOUT')
    }
  },
  
  async loginWithToken({ commit, dispatch }, token) {
    try {
      console.log('🔑 토큰으로 로그인 처리 중...')
      commit('SET_TOKEN', token)
      await dispatch('loadUserProfile')
      
      const toast = useToast()
      toast.success('로그인되었습니다!')
      
      return true
    } catch (error) {
      console.error('❌ 토큰 로그인 실패:', error)
      commit('LOGOUT')
      
      const toast = useToast()
      toast.error('로그인에 실패했습니다.')
      
      return false
    }
  },
  
  async logout({ commit }) {
    try {
      console.log('👋 로그아웃 처리 중...')
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('❌ 로그아웃 API 호출 실패:', error)
    } finally {
      commit('LOGOUT')
      
      const toast = useToast()
      toast.success('로그아웃되었습니다.')
    }
  },
  
  // OAuth 로그인 URL 생성
  getGoogleLoginUrl() {
    const baseUrl = process.env.VUE_APP_API_URL?.replace('/api', '') || ''
    return `${baseUrl}/api/auth/google`
  },
  
  getKakaoLoginUrl() {
    const baseUrl = process.env.VUE_APP_API_URL?.replace('/api', '') || ''
    return `${baseUrl}/api/auth/kakao`
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