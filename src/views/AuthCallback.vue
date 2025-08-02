<template>
  <div class="auth-callback">
    <div class="callback-container">
      <div class="callback-content">
        <div class="loading-spinner-large"></div>
        <h2 class="callback-title">로그인 처리 중...</h2>
        <p class="callback-message">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'AuthCallback',
  data() {
    return {
      message: '잠시만 기다려주세요.'
    }
  },
  async mounted() {
    await this.handleAuthCallback()
  },
  methods: {
    ...mapActions('auth', ['loginWithToken']),
    
    async handleAuthCallback() {
      try {
        console.log('🔄 OAuth 콜백 처리 시작')
        console.log('📍 현재 URL:', window.location.href)
        console.log('🔍 쿼리 파라미터:', this.$route.query)
        
        const token = this.$route.query.token
        const provider = this.$route.query.provider
        const name = this.$route.query.name
        
        if (!token) {
          throw new Error('토큰이 없습니다.')
        }
        
        console.log('🎫 받은 토큰:', token.substring(0, 30) + '...')
        console.log('🔐 OAuth 제공자:', provider)
        console.log('👤 사용자 이름:', decodeURIComponent(name || ''))
        
        this.message = '토큰을 처리하고 있습니다...'
        
        // 토큰으로 로그인 처리
        const success = await this.loginWithToken(token)
        
        if (success) {
          console.log('✅ 로그인 성공! 홈으로 이동')
          this.message = '로그인 완료! 홈으로 이동합니다...'
          
          // 1초 후 홈으로 이동
          setTimeout(() => {
            this.$router.replace('/')
          }, 1000)
        } else {
          throw new Error('로그인 처리에 실패했습니다.')
        }
      } catch (error) {
        console.error('❌ Auth callback 오류:', error)
        this.message = '로그인 처리 중 오류가 발생했습니다.'
        
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          this.$router.replace({
            name: 'Login',
            query: { error: 'auth_failed' }
          })
        }, 3000)
      }
    }
  }
}
</script>

<style scoped>
.auth-callback {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.callback-container {
  text-align: center;
  color: white;
}

.callback-content {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 48px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 400px;
}

.loading-spinner-large {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin: 0 auto 24px;
}

.callback-title {
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 16px;
}

.callback-message {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  line-height: 1.5;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>