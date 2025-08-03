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
                {{ currentStrategy ? currentStrategy.stockCode : '없음' }}
              </p>
            </div>
          </div>

          <div class="status-card">
            <div class="status-icon allocation">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03 0v8.99H22c-.47-4.74-4.24-8.52-8.97-8.99zm0 11.01V22c4.74-.47 8.5-4.25 8.97-8.99h-8.97z"/>
              </svg>
            </div>
            <div class="status-content">
              <h3 class="status-title">투자 비율</h3>
              <p class="status-value">
                {{ currentStrategy ? currentStrategy.allocation + '%' : '0%' }}
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
            <button class="btn btn-sm btn-outline">
              전체 보기
            </button>
          </div>
          
          <div class="card-body">
            <div v-if="!hasOrders" class="empty-state">
              <div class="empty-icon">📊</div>
              <h3>매매 이력이 없습니다</h3>
              <p>자동매매를 시작하면 매매 이력이 여기에 표시됩니다.</p>
            </div>
            
            <div v-else class="orders-table">
              <div class="table-header">
                <div class="table-cell">시간</div>
                <div class="table-cell">종목</div>
                <div class="table-cell">구분</div>
                <div class="table-cell">수량</div>
                <div class="table-cell">가격</div>
                <div class="table-cell">상태</div>
              </div>
              
              <div 
                v-for="order in recentOrders" 
                :key="order.id"
                class="table-row"
              >
                <div class="table-cell">
                  {{ formatDateTime(order.executedAt) }}
                </div>
                <div class="table-cell">
                  {{ order.stockCode }}
                </div>
                <div class="table-cell">
                  <span 
                    class="order-type" 
                    :class="order.orderType.toLowerCase()"
                  >
                    {{ order.orderType === 'BUY' ? '매수' : '매도' }}
                  </span>
                </div>
                <div class="table-cell">
                  {{ order.quantity.toLocaleString() }}주
                </div>
                <div class="table-cell">
                  {{ order.price.toLocaleString() }}원
                </div>
                <div class="table-cell">
                  <span 
                    class="order-status" 
                    :class="order.status.toLowerCase()"
                  >
                    {{ getStatusText(order.status) }}
                  </span>
                </div>
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
                  시장 상태에 따라 상승장 또는 하락장 전략을 선택하고, 
                  투자할 종목과 비율을 설정하세요.
                </p>
              </div>
              
              <div class="help-item">
                <div class="help-icon">🚀</div>
                <h3 class="help-title">매매 시작</h3>
                <p class="help-description">
                  전략 설정 후 "자동매매 시작" 버튼을 클릭하면 
                  설정된 조건에 따라 자동으로 매매가 실행됩니다.
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
                  자동매매를 중단할 수 있습니다.
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

export default {
  name: 'TradingPage',
  components: {
    TradingStrategy
  },
  data() {
    return {
      recentOrders: [], // 실제로는 API에서 가져온 데이터
      hasOrders: false
    }
  },
  computed: {
    ...mapGetters('trading', ['isTrading', 'currentStrategy', 'isLoading'])
  },
  async created() {
    await this.loadTradingStatus()
    // 매매 이력 로드 (추후 구현)
    // await this.loadTradingHistory()
  },
  methods: {
    ...mapActions('trading', ['loadTradingStatus']),
    
    formatDateTime(dateString) {
      if (!dateString) return '-'
      
      try {
        const date = new Date(dateString)
        return date.toLocaleString('ko-KR', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return dateString
      }
    },
    
    getStatusText(status) {
      const statusMap = {
        'SUCCESS': '성공',
        'FAILED': '실패',
        'PENDING': '대기',
        'CANCELLED': '취소'
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
  background-color: var(--white);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-sm) var(--spacing-lg); /* 상하 패딩을 더 많이 줄임 */
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm); /* 간격을 더 줄임 */
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  min-height: 60px; /* 최소 높이를 더 줄임 */
}

.status-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.status-icon {
  width: 36px; /* 아이콘 크기를 더 많이 줄임 */
  height: 36px;
  border-radius: var(--border-radius-sm); /* 더 작은 둥근 정도 */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.status-icon.trading {
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--success-color);
}

.status-icon.strategy {
  background-color: rgba(25, 118, 210, 0.1);
  color: var(--primary-color);
}

.status-icon.allocation {
  background-color: rgba(255, 152, 0, 0.1);
  color: var(--warning-color);
}

.status-content {
  flex: 1;
}

.status-title {
  font-size: var(--font-xs); /* 제목 폰트 크기 줄임 */
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  margin: 0 0 2px 0; /* 마진을 더 줄임 */
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-value {
  font-size: var(--font-md); /* 값 폰트 크기를 더 줄임 */
  font-weight: var(--font-bold);
  margin: 0;
  color: var(--text-primary);
}

.status-value.active {
  color: var(--success-color);
}

.status-value.inactive {
  color: var(--gray);
}

.strategy-section {
  margin-bottom: var(--spacing-xxl);
}

.history-section,
.help-section {
  margin-bottom: var(--spacing-xxl);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xxl) 0;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
}

.empty-state h3 {
  font-size: var(--font-lg);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.empty-state p {
  color: var(--text-secondary);
  margin: 0;
}

.orders-table {
  overflow-x: auto;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 0.8fr 1fr 1fr 0.8fr;
  gap: var(--spacing-md);
  padding: var(--spacing-md) 0;
  align-items: center;
}

.table-header {
  border-bottom: 2px solid var(--border-light);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  font-size: var(--font-sm);
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

.order-status.success {
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--success-color);
}

.order-status.failed {
  background-color: rgba(244, 67, 54, 0.1);
  color: var(--error-color);
}

.order-status.pending {
  background-color: rgba(255, 152, 0, 0.1);
  color: var(--warning-color);
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
    padding: var(--spacing-xs) var(--spacing-md); /* 모바일에서 더욱 작은 패딩 */
    min-height: 50px; /* 모바일에서 더 작은 최소 높이 */
  }
  
  .status-icon {
    width: 32px; /* 모바일에서 더 작은 아이콘 */
    height: 32px;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: var(--spacing-xs);
    text-align: left;
  }
  
  .table-header {
    display: none;
  }
  
  .table-row {
    background-color: var(--white);
    border-radius: var(--border-radius-md);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-sm);
    box-shadow: var(--shadow-sm);
  }
  
  .table-cell::before {
    content: attr(data-label) ': ';
    font-weight: var(--font-medium);
    color: var(--text-secondary);
  }
  
  .help-grid {
    grid-template-columns: 1fr;
  }
}
</style>