<template>
  <div class="auth-callback">
    <div class="callback-container">
      <div class="callback-content">
        <div class="loading-spinner-large"></div>
        <h2 class="callback-title">{{ title }}</h2>
        <p class="callback-message">{{ message }}</p>
        <div v-if="showDebug" class="debug-info">
          <h4>디버그 정보:</h4>
          <pre>{{ debugInfo }}</pre>
        </div>
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
      title: '로그인 처리 중...',
      message: '잠시만 기다려주세요.',
      showDebug: false,
      debugInfo: {}
    }
  },
  async mounted() {
    console.log('🎬 AuthCallback 컴포넌트 마운트됨')
    console.log('🌐 현재 URL:', window.location.href)
    console.log('📍 라우트 정보:', this.$route)
    
    await this.handleAuthCallback()
  },
  methods: {
    ...mapActions('auth', ['loginWithToken']),
    
    async handleAuthCallback() {
      try {
        console.log('🔄 OAuth 콜백 처리 시작')
        
        const params = new URLSearchParams(window.location.search)
        const token = params.get('token') || this.$route.query.token
        const provider = params.get('provider') || this.$route.query.provider
        const name = params.get('name') || this.$route.query.name
        const error = params.get('error') || this.$route.query.error
        
        this.debugInfo = {
          url: window.location.href,
          queryParams: this.$route.query,
          urlParams: Object.fromEntries(params),
          token: token ? token.substring(0, 20) + '...' : 'null',
          provider,
          name: name ? decodeURIComponent(name) : 'null',
          error
        }
        
        console.log('🔍 추출된 파라미터:', this.debugInfo)
        
        // 에러가 있는 경우
        if (error) {
          throw new Error(`OAuth 오류: ${error}`)
        }
        
        // 토큰이 없는 경우
        if (!token) {
          this.showDebug = true
          throw new Error('토큰이 없습니다. URL 파라미터를 확인해주세요.')
        }
        
        console.log('🎫 토큰 발견:', token.substring(0, 30) + '...')
        console.log('🔐 OAuth 제공자:', provider)
        console.log('👤 사용자 이름:', decodeURIComponent(name || ''))
        
        this.message = '토큰을 처리하고 있습니다...'
        
        // 토큰으로 로그인 처리
        const success = await this.loginWithToken(token)
        
        if (success) {
          console.log('✅ 로그인 성공! 홈으로 이동')
          this.title = '로그인 완료!'
          this.message = '홈페이지로 이동합니다...'
          
          // 2초 후 홈으로 이동
          setTimeout(() => {
            this.$router.replace('/')
          }, 2000)
        } else {
          throw new Error('토큰 처리에 실패했습니다.')
        }
        
      } catch (error) {
        console.error('❌ Auth callback 오류:', error)
        
        this.title = '로그인 오류'
        this.message = `오류: ${error.message}`
        this.showDebug = true
        
        // 5초 후 로그인 페이지로 이동
        setTimeout(() => {
          this.$router.replace({
            name: 'Login',
            query: { error: 'callback_failed' }
          })
        }, 5000)
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
  padding: 20px;
}

.callback-container {
  text-align: center;
  color: white;
  width: 100%;
  max-width: 500px;
}

.callback-content {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 48px 32px;
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  margin-bottom: 24px;
  line-height: 1.5;
}

.debug-info {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
  text-align: left;
}

.debug-info h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
}

.debug-info pre {
  margin: 0;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 600px) {
  .callback-content {
    padding: 32px 20px;
  }
  
  .callback-title {
    font-size: 20px;
  }
  
  .callback-message {
    font-size: 14px;
  }
}
</style>