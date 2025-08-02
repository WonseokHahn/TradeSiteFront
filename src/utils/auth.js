// 토큰 관련 유틸리티 함수들

export const getToken = () => {
  return localStorage.getItem('token')
}

export const setToken = (token) => {
  localStorage.setItem('token', token)
}

export const removeToken = () => {
  localStorage.removeItem('token')
}

export const isTokenExpired = (token) => {
  if (!token) return true
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    
    return payload.exp < currentTime
  } catch (error) {
    return true
  }
}

export const redirectToLogin = (provider) => {
  const baseUrl = process.env.VUE_APP_API_URL || '/api'
  
  if (provider === 'google') {
    window.location.href = `${baseUrl}/auth/google`
  } else if (provider === 'kakao') {
    window.location.href = `${baseUrl}/auth/kakao`
  }
}

export const formatUserName = (user) => {
  if (!user) return '사용자'
  
  return user.name || user.email || '사용자'
}