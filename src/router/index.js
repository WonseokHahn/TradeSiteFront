import { createRouter, createWebHashHistory } from 'vue-router'
import store from '../store'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Trading from '../views/Trading.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { 
      title: '홈 - 주식 자동매매 사이트',
      requiresAuth: false 
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { 
      title: '로그인 - 주식 자동매매 사이트',
      requiresAuth: false 
    }
  },
  {
    path: '/trading',
    name: 'Trading',
    component: Trading,
    meta: { 
      title: '자동매매 - 주식 자동매매 사이트',
      requiresAuth: true 
    }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('../views/AuthCallback.vue'),
    meta: { 
      title: '로그인 처리 중...',
      requiresAuth: false 
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { 
      title: '페이지를 찾을 수 없습니다',
      requiresAuth: false 
    }
  }
]

const router = createRouter({
  // history: createWebHistory(process.env.BASE_URL),
  history: createWebHashHistory(),  // ✅ 고친 부분

  routes
})

// 라우터 가드
router.beforeEach((to, from, next) => {
  // 페이지 타이틀 설정
  document.title = to.meta.title || '주식 자동매매 사이트'
  
  // 인증이 필요한 페이지 체크
  if (to.meta.requiresAuth) {
    const isAuthenticated = store.getters['auth/isAuthenticated']
    
    if (!isAuthenticated) {
      // 로그인 페이지로 리다이렉트하고 원래 가려던 페이지 정보 저장
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }
  
  // 이미 로그인한 사용자가 로그인 페이지에 접근하는 경우
  if (to.name === 'Login' && store.getters['auth/isAuthenticated']) {
    next({ name: 'Home' })
    return
  }
  
  next()
})

export default router