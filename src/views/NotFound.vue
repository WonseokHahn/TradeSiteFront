<template>
  <div class="not-found">
    <div class="container">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1 class="error-title">페이지를 찾을 수 없습니다</h1>
        <p class="error-message">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        
        <div class="error-actions">
          <router-link to="/" class="btn btn-primary">
            홈으로 돌아가기
          </router-link>
          <button @click="goBack" class="btn btn-outline">
            이전 페이지
          </button>
        </div>
        
        <div class="helpful-links">
          <h3>도움이 될 만한 링크</h3>
          <ul class="links-list">
            <li><router-link to="/">홈페이지</router-link></li>
            <li><router-link to="/login">로그인</router-link></li>
            <li v-if="isAuthenticated">
              <router-link to="/trading">자동매매</router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'NotFound',
  computed: {
    ...mapGetters('auth', ['isAuthenticated'])
  },
  methods: {
    goBack() {
      if (window.history.length > 1) {
        this.$router.go(-1)
      } else {
        this.$router.push('/')
      }
    }
  }
}
</script>

<style scoped>
.not-found {
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-secondary);
  padding: var(--spacing-xl) 0;
}

.not-found-content {
  text-align: center;
  max-width: 600px;
  padding: 0 var(--spacing-md);
}

.error-code {
  font-size: 8rem;
  font-weight: var(--font-bold);
  color: var(--primary-color);
  line-height: 1;
  margin-bottom: var(--spacing-lg);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.error-title {
  font-size: var(--font-xxl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.error-message {
  font-size: var(--font-lg);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-xxl);
}

.error-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  margin-bottom: var(--spacing-xxl);
}

.helpful-links {
  background-color: var(--white);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.helpful-links h3 {
  font-size: var(--font-lg);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.links-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.links-list a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: var(--font-medium);
  transition: color var(--transition-fast);
}

.links-list a:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .error-code {
    font-size: 6rem;
  }
  
  .error-title {
    font-size: var(--font-xl);
  }
  
  .error-message {
    font-size: var(--font-md);
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .error-actions .btn {
    width: 200px;
  }
}
</style>