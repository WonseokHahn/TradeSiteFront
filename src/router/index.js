import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

// 컴포넌트 정적 import (GitHub Pages 호환)
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import AuthCallback from '../views/AuthCallback.vue'
import Trading from '../views/Trading.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { 
      title: '홈 - AI 기반 자동매매',
      description: '실시간 뉴스 분석과 AI 요약으로 스마트한 투자를 시작하세요',
      requiresAuth: false 
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { 
      title: '로그인 - AI 기반 자동매매',
      description: 'Google 또는 Kakao 계정으로 간편하게 로그인하세요',
      requiresAuth: false 
    }
  },
  {
    path: '/trading',
    name: 'Trading',
    component: Trading,
    meta: { 
      title: '자동매매 - 한국투자증권 연동',
      description: 'AI 분석과 전문 매매 전략으로 자동화된 주식 투자',
      requiresAuth: true 
    }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: AuthCallback,
    meta: { 
      title: '로그인 처리 중...',
      description: '소셜 로그인을 처리하고 있습니다',
      requiresAuth: false 
    }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: NotFound,
    meta: { 
      title: '페이지를 찾을 수 없습니다 - AI 기반 자동매매',
      description: '요청하신 페이지가 존재하지 않습니다',
      requiresAuth: false 
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 저장된 스크롤 위치가 있으면 복원
    if (savedPosition) {
      return savedPosition
    }
    // 앵커 링크가 있으면 해당 위치로 스크롤
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    // 기본적으로 페이지 상단으로 스크롤
    return { top: 0 }
  }
})

// 라우터 가드
router.beforeEach(async (to, from, next) => {
  console.log('🔄 라우터 이동:', from.path, '→', to.path)
  
  // 로딩 상태 시작
  store.dispatch('setLoading', true)
  
  // 페이지 메타 정보 설정
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  if (to.meta.description) {
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    metaDescription.setAttribute('content', to.meta.description)
  }
  
  // 인증이 필요한 페이지 체크
  if (to.meta.requiresAuth) {
    console.log('🔒 인증 필요한 페이지 접근 시도')
    
    const isAuthenticated = store.getters['auth/isAuthenticated']
    
    if (!isAuthenticated) {
      console.log('❌ 인증되지 않음 - 로그인 페이지로 이동')
      
      store.dispatch('setLoading', false)
      
      next({
        name: 'Login',
        query: { 
          redirect: to.fullPath,
          message: 'login_required'
        }
      })
      return
    }
    
    // 토큰이 있지만 사용자 정보가 없는 경우 프로필 로드 시도
    if (!store.getters['auth/user']) {
      console.log('🔄 사용자 정보 로딩 중...')
      
      try {
        await store.dispatch('auth/loadUserProfile')
        console.log('✅ 사용자 정보 로드 완료')
      } catch (error) {
        console.error('❌ 사용자 정보 로드 실패:', error)
        
        // 토큰이 유효하지 않은 경우 로그아웃 처리
        await store.dispatch('auth/logout')
        
        store.dispatch('setLoading', false)
        
        next({
          name: 'Login',
          query: { 
            redirect: to.fullPath,
            message: 'session_expired'
          }
        })
        return
      }
    }
  }
  
  // 이미 로그인한 사용자가 로그인/콜백 페이지에 접근하는 경우
  if ((to.name === 'Login' || to.name === 'AuthCallback') && store.getters['auth/isAuthenticated']) {
    console.log('✅ 이미 로그인됨 - 적절한 페이지로 이동')
    
    store.dispatch('setLoading', false)
    
    // 리다이렉트 경로가 있으면 해당 경로로, 없으면 홈으로
    const redirectPath = to.query.redirect || '/'
    
    if (redirectPath === to.path) {
      next({ name: 'Home' })
    } else {
      next(redirectPath)
    }
    return
  }
  
  // 특정 경로에서 특정 경로로의 이동 제한 (무한 루프 방지)
  if (from.name === 'Login' && to.name === 'Login') {
    console.log('⚠️ 로그인 페이지 무한 루프 방지')
    store.dispatch('setLoading', false)
    next({ name: 'Home' })
    return
  }
  
  store.dispatch('setLoading', false)
  next()
})

// 라우터 에러 처리
router.afterEach((to, from, failure) => {
  // 로딩 상태 종료
  store.dispatch('setLoading', false)
  
  if (failure) {
    console.error('❌ 라우터 이동 실패:', failure)
    
    // 특정 오류에 대한 처리
    if (failure.type === 'aborted') {
      console.log('⚠️ 라우터 이동이 중단됨')
    } else if (failure.type === 'cancelled') {
      console.log('⚠️ 라우터 이동이 취소됨')
    } else if (failure.type === 'duplicated') {
      console.log('⚠️ 동일한 라우트로 이동 시도')
    }
  } else {
    console.log('✅ 라우터 이동 완료:', to.path)
    
    // 페이지 방문 추적 (Google Analytics 등)
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_TRACKING_ID', {
        page_path: to.path,
        page_title: to.meta.title
      })
    }
  }
})

// 라우터 오류 글로벌 핸들러
router.onError((error) => {
  console.error('💥 라우터 글로벌 오류:', error)
  
  // 오류 정보를 스토어에 저장
  store.dispatch('setError', {
    message: '페이지 로딩 중 오류가 발생했습니다.',
    details: error.message
  })
  
  // 로딩 상태 종료
  store.dispatch('setLoading', false)
})

export default router