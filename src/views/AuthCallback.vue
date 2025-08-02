<template>
  <div class="auth-callback">
    <div class="callback-container">
      <div class="callback-content">
        <div class="loading-spinner-large"></div>
        <h2 class="callback-title">로그인 처리 중...</h2>
        <p class="callback-message">잠시만 기다려주세요.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'AuthCallback',
  async created() {
    await this.handleAuthCallback()
  },
  methods: {
    ...mapActions('auth', ['loginWithToken']),
    
    async handleAuthCallback() {
      try {
        const token = this.$route.query.token
        
        if (!token) {
          throw new Error('토큰이 없습니다.')
        }
        
        // 토큰으로 로그인 처리
        const success = await this.loginWithToken(token)
        
        if (success) {
          // 원래 가려던 페이지나 홈으로 리다이렉트
          const redirect = this.$route.query.redirect || '/'
          this.$router.replace(redirect)
        } else {
          throw new Error('로그인 처리에 실패했습니다.')
        }
      } catch (error) {
        console.error('Auth callback 오류:', error)
        
        // 에러 발생시 로그인 페이지로 리다이렉트
        this.$router.replace({
          name: 'Login',
          query: { error: 'auth_failed' }
        })
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
  color: var(--white);
}

.callback-content {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xxl);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.loading-spinner-large {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: var(--white);
  animation: spin 1s ease-in-out infinite;
  margin: 0 auto var(--spacing-xl);
}

.callback-title {
  font-size: var(--font-xl);
  font-weight: var(--font-medium);
  margin-bottom: var(--spacing-md);
}

.callback-message {
  font-size: var(--font-md);
  opacity: 0.9;
  margin: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>