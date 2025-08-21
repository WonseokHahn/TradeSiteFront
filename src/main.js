import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Toast from "vue-toastification"
import "vue-toastification/dist/index.css"
import apiClient from './utils/api'

// CSS 파일들 import
import './assets/css/variables.css'
import './assets/css/main.css'
import './assets/css/components.css'

const app = createApp(App)

// API 클라이언트를 전역 프로퍼티로 추가
app.config.globalProperties.$api = apiClient

app.use(store)
app.use(router)
app.use(Toast, {
  position: "top-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false
})

app.mount('#app')