<template>
  <div class="trading">
    <div class="container">
      <!-- 페이지 헤더 -->
      <div class="page-header">
        <h1 class="page-title">자동매매 관리</h1>
        <p class="page-subtitle">
          AI 기반 투자 전략을 설정하고 자동매매를 실행하세요
        </p>
      </div>

      <!-- 현재 상태 대시보드 -->
      <div class="status-dashboard">
        <div class="status-cards">
          <div class="status-card">
            <div class="status-icon trading">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
              </svg>
            </div>
            <div class="status-content">
              <h3 class="status-title">매매 상태</h3>
              <p class="status-value" :class="{ active: isTrading, inactive: !isTrading }">
                {{ isTrading ? '실행 중' : '대기 중' }}
              </p>
            </div>
          </div>

          <div class="status-card">
            <div class="status-icon strategy">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div class="status-content">
              <h3 class="status-title">활성 전략</h3>
              <p class="status-value">
                {{ currentStrategy ? currentStrategy.strategy_name : '없음' }}
              </p>
            </div>
          </div>

          <div class="status-card">
            <div class="status-icon region">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <div class="status-content">
              <h3 class="status-title">투자 지역</h3>
              <p class="status-value">
                {{ currentStrategy ? (currentStrategy.region === 'domestic' ? '국내' : '해외') : '-' }}
              </p>
            </div>
          </div>

          <div class="status-card">
            <div class="status-icon orders">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>
            </div>
            <div class="status-content">
              <h3 class="status-title">총 매매 건수</h3>
              <p class="status-value">
                {{ tradingHistory.length }}건
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 전략 설정 섹션 -->
      <div class="strategy-section">
        <TradingStrategy />
      </div>

      <!-- 매매 이력 섹션 -->
      <div class="history-section">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">최근 매매 이력</h2>
            <div class="header-actions">
              <button @click="refreshHistory" class="btn btn-sm btn-outline" :disabled="historyLoading">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
                새로고침
              </button>
            </div>
          </div>
          
          <div class="card-body">
            <div v-if="historyLoading" class="loading-state">
              <div class="loading-spinner-large"></div>
              <p>매매 이력을 불러오는 중...</p>
            </div>

            <div v-else-if="!hasOrders" class="empty-state">
              <div class="empty-icon">📊</div>
              <h3>매매 이력이 없습니다</h3>
              <p>자동매매를 시작하면 매매 이력이 여기에 표시됩니다.</p>
            </div>
            
            <div v-else class="orders-container">
              <!-- 데스크톱 테이블 -->
              <div class="orders-table desktop-only">
                <div class="table-header">
                  <div class="table-cell">시간</div>
                  <div class="table-cell">종목</div>
                  <div class="table-cell">지역</div>
                  <div class="table-cell">구분</div>
                  <div class="table-cell">수량</div>
                  <div class="table-cell">가격</div>
                  <div class="table-cell">총액</div>
                  <div class="table-cell">상태</div>
                </div>
                
                <div 
                  v-for="order in displayedOrders" 
                  :key="order.id"
                  class="table-row"
                >
                  <div class="table-cell">
                    {{ formatDateTime(order.executed_at || order.created_at) }}
                  </div>
                  <div class="table-cell">
                    <div class="stock-info">
                      <strong>{{ order.stock_code }}</strong>
                      <span class="stock-name">{{ order.stock_name || '종목명' }}</span>
                    </div>
                  </div>
                  <div class="table-cell">
                    <span class="region-badge" :class="order.region">
                      {{ order.region === 'domestic' ? '🇰🇷 국내' : '🌍 해외' }}
                    </span>
                  </div>
                  <div class="table-cell">
                    <span 
                      class="order-type" 
                      :class="order.order_type ? order.order_type.toLowerCase() : ''"
                    >
                      {{ order.order_type === 'BUY' ? '매수' : '매도' }}
                    </span>
                  </div>
                  <div class="table-cell">
                    {{ formatNumber(order.quantity) }}주
                  </div>
                  <div class="table-cell">
                    {{ formatPrice(order.executed_price || order.order_price, order.region) }}
                  </div>
                  <div class="table-cell">
                    {{ formatPrice(order.total_amount, order.region) }}
                  </div>
                  <div class="table-cell">
                    <span 
                      class="order-status" 
                      :class="order.status ? order.status.toLowerCase() : ''"
                    >
                      {{ getStatusText(order.status) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 모바일 카드 -->
              <div class="orders-cards mobile-only">
                <div 
                  v-for="order in displayedOrders" 
                  :key="order.id"
                  class="order-card"
                >
                  <div class="order-header">
                    <div class="stock-info">
                      <strong>{{ order.stock_code }}</strong>
                      <span class="stock-name">{{ order.stock_name || '종목명' }}</span>
                    </div>
                    <span class="region-badge" :class="order.region">
                      {{ order.region === 'domestic' ? '🇰🇷' : '🌍' }}
                    </span>
                  </div>
                  
                  <div class="order-details">
                    <div class="detail-row">
                      <span class="label">구분:</span>
                      <span 
                        class="order-type" 
                        :class="order.order_type ? order.order_type.toLowerCase() : ''"
                      >
                        {{ order.order_type === 'BUY' ? '매수' : '매도' }}
                      </span>
                    </div>
                    <div class="detail-row">
                      <span class="label">수량:</span>
                      <span>{{ formatNumber(order.quantity) }}주</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">가격:</span>
                      <span>{{ formatPrice(order.executed_price || order.order_price, order.region) }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">총액:</span>
                      <span class="total-amount">{{ formatPrice(order.total_amount, order.region) }}</span>
                    </div>
                  </div>
                  
                  <div class="order-footer">
                    <span class="order-time">
                      {{ formatDateTime(order.executed_at || order.created_at) }}
                    </span>
                    <span 
                      class="order-status" 
                      :class="order.status ? order.status.toLowerCase() : ''"
                    >
                      {{ getStatusText(order.status) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 더보기 버튼 -->
              <div v-if="tradingHistory.length > displayLimit" class="show-more">
                <button 
                  @click="showMore"
                  class="btn btn-outline"
                >
                  더보기 ({{ Math.min(10, tradingHistory.length - displayLimit) }}건 더)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 도움말 섹션 -->
      <div class="help-section">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">자동매매 가이드</h2>
          </div>
          
          <div class="card-body">
            <div class="help-grid">
              <div class="help-item">
                <div class="help-icon">⚙️</div>
                <h3 class="help-title">전략 설정</h3>
                <p class="help-description">
                  시장 상태와 투자 지역을 선택하고, 
                  투자할 종목들과 각각의 투자 비율을 설정하세요.
                </p>
              </div>
              
              <div class="help-item">
                <div class="help-icon">🚀</div>
                <h3 class="help-title">매매 시작</h3>
                <p class="help-description">
                  전략 설정 후 "자동매매 시작" 버튼을 클릭하면 
                  설정된 조건에 따라 5분마다 자동으로 매매가 실행됩니다.
                </p>
              </div>
              
              <div class="help-item">
                <div class="help-icon">📊</div>
                <h3 class="help-title">모니터링</h3>
                <p class="help-description">
                  실시간으로 매매 상태를 확인하고, 
                  매매 이력을 통해 성과를 분석할 수 있습니다.
                </p>
              </div>
              
              <div class="help-item">
                <div class="help-icon">⛔</div>
                <h3 class="help-title">매매 중단</h3>
                <p class="help-description">
                  언제든지 "자동매매 종료" 버튼을 클릭하여 
                  자동매매를 안전하게 중단할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import TradingStrategy from '@/components/TradingStrategy.vue'
import apiClient from '@/utils/api'

export default {
  name: 'TradingPage',
  components: {
    TradingStrategy
  },
  data() {
    return {
      tradingHistory: [],
      historyLoading: false,
      displayLimit: 10
    }
  },
  computed: {
    ...mapGetters('trading', ['isTrading', 'currentStrategy', 'isLoading']),
    
    hasOrders() {
      return this.tradingHistory.length > 0
    },
    
    displayedOrders() {
      return this.tradingHistory.slice(0, this.displayLimit)
    }
  },
  async created() {
    try {
      await this.loadTradingStatus()
      await this.loadTradingHistory()
    } catch (error) {
      console.error('페이지 초기화 오류:', error)
    }
  },
  methods: {
    ...mapActions('trading', ['loadTradingStatus']),
    
    async loadTradingHistory() {
      this.historyLoading = true
      try {
        const response = await apiClient.get('/trading/history')
        if (response.data.success) {
          this.tradingHistory = response.data.data || []
        }
      } catch (error) {
        console.error('매매 이력 로드 실패:', error)
        this.tradingHistory = []
        
        // Toast가 없을 경우를 대비한 조건부 실행
        if (this.$toast) {
          this.$toast.error('매매 이력을 불러오는데 실패했습니다.')
        } else {
          console.warn('매매 이력을 불러오는데 실패했습니다.')
        }
      } finally {
        this.historyLoading = false
      }
    },
    
    async refreshHistory() {
      await this.loadTradingHistory()
      
      if (this.$toast) {
        this.$toast.success('매매 이력이 새로고침되었습니다.')
      }
    },
    
    showMore() {
      this.displayLimit += 10
    },
    
    formatDateTime(dateString) {
      if (!dateString) return '-'
      
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return '-'
        
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)
        
        if (diffMins < 1) return '방금 전'
        if (diffMins < 60) return `${diffMins}분 전`
        if (diffHours < 24) return `${diffHours}시간 전`
        if (diffDays < 7) return `${diffDays}일 전`
        
        return date.toLocaleDateString('ko-KR', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        console.error('날짜 포맷 오류:', error)
        return dateString
      }
    },
    
    formatPrice(price, region) {
      if (!price || price === null || price === undefined) return '-'
      
      try {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price
        if (isNaN(numPrice)) return '-'
        
        if (region === 'domestic') {
          return numPrice.toLocaleString() + '원'
        } else {
          return '$' + numPrice.toFixed(2)
        }
      } catch (error) {
        console.error('가격 포맷 오류:', error)
        return '-'
      }
    },
    
    formatNumber(number) {
      if (!number || number === null || number === undefined) return '0'
      
      try {
        const num = typeof number === 'string' ? parseInt(number) : number
        if (isNaN(num)) return '0'
        return num.toLocaleString()
      } catch (error) {
        console.error('숫자 포맷 오류:', error)
        return '0'
      }
    },
    
    getStatusText(status) {
      if (!status) return '알 수 없음'
      
      const statusMap = {
        'PENDING': '대기',
        'FILLED': '체결',
        'PARTIALLY_FILLED': '부분체결',
        'CANCELLED': '취소',
        'REJECTED': '거부'
      }
      return statusMap[status] || status
    }
  }
}
</script>

<style scoped>
.trading {
  padding: var(--spacing-xl) 0;
  background-color: var(--bg-secondary);
  min-height: calc(100vh - 70px);
}

.page-header {
  text-align: center;
  margin-bottom: var(--spacing-xxl);
}

.page-title {
  font-size: 2.5rem;
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.page-subtitle {
  font-size: var(--font-lg);
  color: var(--text-secondary);
  margin: 0;
}

.status-dashboard {
  margin-bottom: var(--spacing-xxl);
}

.status-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.status-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.status-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.status-icon.trading {
  background-color: rgba(34, 197, 94, 0.1);
  color: #22C55E;
}

.status-icon.strategy {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
}

.status-icon.region {
  background-color: rgba(168, 85, 247, 0.1);
  color: #A855F7;
}

.status-icon.orders {
  background-color: rgba(249, 115, 22, 0.1);
  color: #F97316;
}

.status-content {
  flex: 1;
}

.status-title {
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
  margin: 0 0 4px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-value {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #111827;
}

.status-value.active {
  color: #22C55E;
}

.status-value.inactive {
  color: #9CA3AF;
}

.strategy-section,
.history-section,
.help-section {
  margin-bottom: var(--spacing-xxl);
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.loading-state {
  text-align: center;
  padding: var(--spacing-xxl) 0;
}

.loading-spinner-large {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-light);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin: 0 auto var(--spacing-md);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xxl) 0;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
}

.orders-container {
  position: relative;
}

/* 데스크톱 테이블 스타일 */
.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

.orders-table {
  overflow-x: auto;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 120px 150px 80px 80px 100px 120px 120px 100px;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) 0;
  align-items: center;
  min-width: 850px;
}

.table-header {
  border-bottom: 2px solid var(--border-light);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  font-size: var(--font-sm);
  background-color: var(--bg-secondary);
  position: sticky;
  top: 0;
  z-index: 1;
}

.table-row {
  border-bottom: 1px solid var(--border-light);
  transition: background-color var(--transition-fast);
}

.table-row:hover {
  background-color: var(--bg-secondary);
}

.table-cell {
  font-size: var(--font-sm);
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
}

.stock-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stock-name {
  font-size: var(--font-xs);
  color: var(--text-secondary);
}

.region-badge {
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-xs);
  font-weight: var(--font-medium);
}

.region-badge.domestic {
  background-color: rgba(34, 197, 94, 0.1);
  color: #22C55E;
}

.region-badge.global {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
}

.order-type {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-xs);
  font-weight: var(--font-medium);
  text-transform: uppercase;
}

.order-type.buy {
  background-color: rgba(244, 67, 54, 0.1);
  color: var(--error-color);
}

.order-type.sell {
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--success-color);
}

.order-status {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-xs);
  font-weight: var(--font-medium);
}

.order-status.filled {
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--success-color);
}

.order-status.rejected {
  background-color: rgba(244, 67, 54, 0.1);
  color: var(--error-color);
}

.order-status.pending {
  background-color: rgba(255, 152, 0, 0.1);
  color: var(--warning-color);
}

.order-status.cancelled {
  background-color: rgba(158, 158, 158, 0.1);
  color: var(--gray);
}

/* 모바일 카드 스타일 */
.orders-cards {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.order-card {
  background-color: var(--white);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-fast);
}

.order-card:hover {
  box-shadow: var(--shadow-md);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.total-amount {
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-light);
}

.order-time {
  font-size: var(--font-xs);
  color: var(--text-secondary);
}

.show-more {
  text-align: center;
  margin-top: var(--spacing-lg);
}

.help-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
}

.help-item {
  text-align: center;
}

.help-icon {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-md);
}

.help-title {
  font-size: var(--font-lg);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.help-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .page-subtitle {
    font-size: var(--font-md);
  }
  
  .status-cards {
    grid-template-columns: 1fr;
  }
  
  .status-card {
    padding: 16px;
  }
  
  .status-icon {
    width: 40px;
    height: 40px;
  }
  
  .desktop-only {
    display: none;
  }
  
  .mobile-only {
    display: block;
  }
  
  .help-grid {
    grid-template-columns: 1fr;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>