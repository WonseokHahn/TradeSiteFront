<template>
  <div id="app">
    <Header />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import Header from './components/Header.vue'
import { mapActions } from 'vuex'

export default {
  name: 'App',
  components: {
    Header
  },
  async created() {
    // 앱 시작시 토큰이 있으면 사용자 정보 로드
    const token = localStorage.getItem('token')
    if (token) {
      await this.loadUserProfile()
    }
  },
  methods: {
    ...mapActions('auth', ['loadUserProfile'])
  }
}
</script>