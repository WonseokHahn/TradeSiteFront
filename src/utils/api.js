import axios from 'axios'

// API 베이스 URL 설정
const API_BASE_URL = process.env.VUE_APP_API_URL || 'https://tradesiteback.onrender.com/api'

console.log('🌐 API Base URL:', API_BASE_URL)

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 요청 인터셉터 (토큰 자동 추가)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    
    console.log('🔍 API 요청 시작:', config.method?.toUpperCase(), config.url)
    console.log('🔑 토큰 상태:', token ? `토큰 있음 (${token.substring(0, 20)}...)` : '토큰 없음')
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
      console.log('✅ Authorization 헤더 추가됨')
    } else {
      console.log('⚠️ 토큰이 없어서 Authorization 헤더 추가 안됨')
    }
    
    return config
  },
  (error) => {
    console.error('❌ API 요청 에러:', error)
    return Promise.reject(error)
  }
)

// 응답 인터셉터 (에러 처리)
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API 응답 성공: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('❌ API 응답 에러:', error)
    console.error('❌ 응답 상태:', error.response?.status)
    console.error('❌ 응답 데이터:', error.response?.data)
    
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그아웃
      console.log('🔑 토큰 만료 - 로그아웃 처리')
      localStorage.removeItem('token')
      
      // 현재 페이지가 로그인 페이지가 아닌 경우에만 리다이렉트
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
export { API_BASE_URL }