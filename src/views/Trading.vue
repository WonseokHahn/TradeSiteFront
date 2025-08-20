<template>
  <div class="trading">
    <div class="container">
      <!-- 상단 헤더 -->
      <div class="trading-header">
        <h1 class="page-title">한국투자증권 자동매매</h1>
        <div class="account-info">
          <div class="account-card">
            <span class="account-label">계좌번호:</span>
            <span class="account-number">{{ accountInfo.accountNo }}</span>
          </div>
          <div class="balance-card">
            <span class="balance-label">현재 잔고:</span>
            <span class="balance-amount">{{ formatMoney(accountInfo.balance) }}원</span>
          </div>
          <button @click="refreshAccountInfo" class="btn btn-sm btn-outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            새로고침
          </button>
        </div>
      </div>

      <!-- 탭 네비게이션 -->
      <div class="tab-navigation">
        <button 
          @click="activeTab = 'domestic'"
          :class="['tab-button', { active: activeTab === 'domestic' }]"
        >
          국내투자
        </button>
        <button 
          @click="activeTab = 'overseas'"
          :class="['tab-button', { active: activeTab === 'overseas' }]"
        >
          해외투자
        </button>
      </div>

      <!-- 국내투자 탭 -->
      <div v-if="activeTab === 'domestic'" class="trading-content">
        <div class="trading-grid">
          <!-- 전략 선택 -->
          <div class="strategy-section card">
            <div class="card-header">
              <h3 class="card-title">매매 전략 선택</h3>
            </div>
            <div class="card-body">
              <div class="strategy-grid">
                <div 
                  v-for="strategy in strategies" 
                  :key="strategy.id"
                  @click="selectStrategy(strategy)"
                  :class="['strategy-card', { selected: selectedStrategy?.id === strategy.id }]"
                >
                  <div class="strategy-icon">{{ strategy.icon }}</div>
                  <h4 class="strategy-name">{{ strategy.name }}</h4>
                  <p class="strategy-description">{{ strategy.description }}</p>
                  <div class="strategy-stats">
                    <span class="stat-item">수익률: {{ strategy.expectedReturn }}</span>
                    <span class="stat-item">위험도: {{ strategy.riskLevel }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 선택된 전략 상세 정보 -->
              <div v-if="selectedStrategy" class="strategy-details">
                <h4>{{ selectedStrategy.name }} 상세 설정</h4>
                <div class="strategy-params">
                  <div v-for="param in selectedStrategy.parameters" :key="param.key" class="param-group">
                    <label :for="param.key" class="form-label">{{ param.label }}</label>
                    <input 
                      :id="param.key"
                      v-model="strategyParams[param.key]"
                      :type="param.type"
                      :min="param.min"
                      :max="param.max"
                      :step="param.step"
                      class="form-input"
                      :placeholder="param.placeholder"
                    >
                    <small class="param-description">{{ param.description }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 종목 선택 -->
          <div class="stocks-section card">
            <div class="card-header">
              <h3 class="card-title">AI 추천 종목</h3>
              <button @click="getAIRecommendations" class="btn btn-sm btn-primary">
                AI 재추천
              </button>
            </div>
            <div class="card-body">
              <div v-if="loadingRecommendations" class="loading-state">
                <div class="loading-spinner"></div>
                <p>AI가 종목을 분석하고 있습니다...</p>
              </div>
              
              <div v-else class="stocks-grid">
                <div 
                  v-for="stock in recommendedStocks" 
                  :key="stock.code"
                  :class="['stock-card', { selected: selectedStocks.includes(stock.code) }]"
                  @click="toggleStock(stock.code)"
                >
                  <div class="stock-header">
                    <h4 class="stock-name">{{ stock.name }}</h4>
                    <span class="stock-code">{{ stock.code }}</span>
                  </div>
                  <div class="stock-price">
                    <span class="current-price">{{ formatMoney(stock.currentPrice) }}원</span>
                    <span :class="['price-change', stock.changeRate >= 0 ? 'positive' : 'negative']">
                      {{ stock.changeRate >= 0 ? '+' : '' }}{{ stock.changeRate }}%
                    </span>
                  </div>
                  <div class="stock-reason">
                    <small>{{ stock.aiReason }}</small>
                  </div>
                  <div class="checkbox-wrapper">
                    <input 
                      type="checkbox" 
                      :checked="selectedStocks.includes(stock.code)"
                      @click.stop="toggleStock(stock.code)"
                    >
                  </div>
                </div>
              </div>
              
              <!-- 사용자 정의 종목 추가 -->
              <div class="custom-stock">
                <h4>직접 종목 추가</h4>
                <div class="stock-search">
                  <input 
                    v-model="searchKeyword"
                    @keypress.enter="searchStock"
                    placeholder="종목명 또는 종목코드 입력"
                    class="form-input"
                  >
                  <button @click="searchStock" class="btn btn-primary">검색</button>
                </div>
                <div v-if="searchResults.length" class="search-results">
                  <div 
                    v-for="stock in searchResults" 
                    :key="stock.code"
                    @click="addCustomStock(stock)"
                    class="search-result-item"
                  >
                    <span class="stock-name">{{ stock.name }}</span>
                    <span class="stock-code">{{ stock.code }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 자동매매 제어 -->
          <div class="control-section card">
            <div class="card-header">
              <h3 class="card-title">자동매매 제어</h3>
              <div class="trading-status">
                <span :class="['status-indicator', tradingStatus]"></span>
                <span class="status-text">{{ getStatusText() }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="control-settings">
                <div class="form-group">
                  <label class="form-label">투자 금액</label>
                  <input 
                    v-model="investmentAmount"
                    type="number"
                    min="10000"
                    :max="accountInfo.balance"
                    step="10000"
                    class="form-input"
                    placeholder="최소 10,000원"
                  >
                  <small>사용 가능 잔고: {{ formatMoney(accountInfo.balance) }}원</small>
                </div>
                
                <div class="form-group">
                  <label class="form-label">종목별 배분</label>
                  <select v-model="allocationMethod" class="form-select">
                    <option value="equal">균등 배분</option>
                    <option value="weighted">가중 배분 (AI 신뢰도 기반)</option>
                    <option value="custom">사용자 정의</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">손절 기준</label>
                  <input 
                    v-model="stopLossPercent"
                    type="number"
                    min="1"
                    max="30"
                    step="0.1"
                    class="form-input"
                    placeholder="예: 5 (-5% 하락 시 손절)"
                  >
                  <small>%</small>
                </div>

                <div class="form-group">
                  <label class="form-label">익절 기준</label>
                  <input 
                    v-model="takeProfitPercent"
                    type="number"
                    min="1"
                    max="100"
                    step="0.1"
                    class="form-input"
                    placeholder="예: 10 (+10% 상승 시 익절)"
                  >
                  <small>%</small>
                </div>
              </div>
              
              <div class="control-buttons">
                <button 
                  @click="startTrading"
                  :disabled="!canStartTrading"
                  class="btn btn-success btn-lg"
                >
                  자동매매 시작
                </button>
                <button 
                  @click="stopTrading"
                  :disabled="tradingStatus !== 'running'"
                  class="btn btn-danger btn-lg"
                >
                  자동매매 중지
                </button>
                <button 
                  @click="pauseTrading"
                  :disabled="tradingStatus !== 'running'"
                  class="btn btn-warning btn-lg"
                >
                  일시정지
                </button>
              </div>
            </div>
          </div>

          <!-- 현재 포지션 -->
          <div class="positions-section card">
            <div class="card-header">
              <h3 class="card-title">현재 포지션</h3>
              <button @click="refreshPositions" class="btn btn-sm btn-outline">새로고침</button>
            </div>
            <div class="card-body">
              <div v-if="currentPositions.length === 0" class="empty-state">
                <p>현재 보유 중인 종목이 없습니다.</p>
              </div>
              <div v-else class="positions-grid">
                <div v-for="position in currentPositions" :key="position.code" class="position-card">
                  <div class="position-header">
                    <h4 class="stock-name">{{ position.name }}</h4>
                    <span class="stock-code">{{ position.code }}</span>
                  </div>
                  <div class="position-details">
                    <div class="detail-row">
                      <span class="label">보유 수량:</span>
                      <span class="value">{{ position.quantity }}주</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">평균 매입가:</span>
                      <span class="value">{{ formatMoney(position.avgPrice) }}원</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">현재가:</span>
                      <span class="value">{{ formatMoney(position.currentPrice) }}원</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">평가손익:</span>
                      <span :class="['value', position.pnl >= 0 ? 'positive' : 'negative']">
                        {{ position.pnl >= 0 ? '+' : '' }}{{ formatMoney(position.pnl) }}원
                        ({{ position.pnlPercent >= 0 ? '+' : '' }}{{ position.pnlPercent }}%)
                      </span>
                    </div>
                  </div>
                  <button @click="sellPosition(position)" class="btn btn-sm btn-danger">
                    전량 매도
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 매매 기록 -->
          <div class="history-section card">
            <div class="card-header">
              <h3 class="card-title">최근 매매 기록</h3>
              <select v-model="historyFilter" class="form-select" style="width: auto;">
                <option value="today">오늘</option>
                <option value="week">최근 1주</option>
                <option value="month">최근 1개월</option>
              </select>
            </div>
            <div class="card-body">
              <div class="history-table">
                <table>
                  <thead>
                    <tr>
                      <th>시간</th>
                      <th>종목</th>
                      <th>구분</th>
                      <th>수량</th>
                      <th>가격</th>
                      <th>수수료</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="record in tradingHistory" :key="record.id">
                      <td>{{ formatDateTime(record.timestamp) }}</td>
                      <td>{{ record.stockName }}</td>
                      <td :class="['trade-type', record.type]">{{ record.type === 'buy' ? '매수' : '매도' }}</td>
                      <td>{{ record.quantity }}주</td>
                      <td>{{ formatMoney(record.price) }}원</td>
                      <td>{{ formatMoney(record.fee) }}원</td>
                      <td :class="['status', record.status]">{{ getTradeStatusText(record.status) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 해외투자 탭 -->
      <div v-if="activeTab === 'overseas'" class="trading-content">
        <div class="coming-soon">
          <div class="coming-soon-icon">🚧</div>
          <h2>해외투자 기능 준비 중</h2>
          <p>해외투자 자동매매 기능은 현재 개발 중입니다.<br>곧 출시될 예정이니 조금만 기다려주세요!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import apiClient from '@/utils/api'

export default {
  name: 'Trading',
  data() {
    return {
      activeTab: 'domestic',
      
      // 계좌 정보
      accountInfo: {
        accountNo: '430-699-3101',
        balance: 0
      },
      
      // 전략 정보
      strategies: [
        {
          id: 'moving_average',
          name: '이동평균선 돌파',
          icon: '📈',
          description: '단기 이동평균이 장기 이동평균을 상향 돌파할 때 매수',
          expectedReturn: '8-12%',
          riskLevel: '중간',
          parameters: [
            {
              key: 'short_ma',
              label: '단기 이동평균',
              type: 'number',
              min: 5,
              max: 30,
              step: 1,
              placeholder: '5',
              description: '단기 이동평균 기간 (일)'
            },
            {
              key: 'long_ma',
              label: '장기 이동평균',
              type: 'number',
              min: 20,
              max: 120,
              step: 1,
              placeholder: '20',
              description: '장기 이동평균 기간 (일)'
            },
            {
              key: 'volume_threshold',
              label: '거래량 임계값',
              type: 'number',
              min: 1.0,
              max: 5.0,
              step: 0.1,
              placeholder: '1.5',
              description: '평균 거래량 대비 배수'
            }
          ]
        },
        {
          id: 'rsi_reversal',
          name: 'RSI 역추세',
          icon: '🔄',
          description: 'RSI 과매도/과매수 구간에서의 역추세 매매',
          expectedReturn: '10-15%',
          riskLevel: '높음',
          parameters: [
            {
              key: 'rsi_period',
              label: 'RSI 기간',
              type: 'number',
              min: 7,
              max: 21,
              step: 1,
              placeholder: '14',
              description: 'RSI 계산 기간 (일)'
            },
            {
              key: 'oversold_level',
              label: '과매도 기준',
              type: 'number',
              min: 20,
              max: 35,
              step: 1,
              placeholder: '30',
              description: 'RSI 과매도 기준값'
            },
            {
              key: 'overbought_level',
              label: '과매수 기준',
              type: 'number',
              min: 65,
              max: 80,
              step: 1,
              placeholder: '70',
              description: 'RSI 과매수 기준값'
            }
          ]
        },
        {
          id: 'bollinger_squeeze',
          name: '볼린저 밴드 수축',
          icon: '🎯',
          description: '볼린저 밴드 수축 후 확장 시점을 노린 매매',
          expectedReturn: '12-18%',
          riskLevel: '중간',
          parameters: [
            {
              key: 'bb_period',
              label: '볼린저 기간',
              type: 'number',
              min: 10,
              max: 30,
              step: 1,
              placeholder: '20',
              description: '볼린저 밴드 계산 기간 (일)'
            },
            {
              key: 'bb_std',
              label: '표준편차 배수',
              type: 'number',
              min: 1.5,
              max: 2.5,
              step: 0.1,
              placeholder: '2.0',
              description: '볼린저 밴드 표준편차 배수'
            },
            {
              key: 'squeeze_threshold',
              label: '수축 임계값',
              type: 'number',
              min: 0.1,
              max: 0.5,
              step: 0.01,
              placeholder: '0.2',
              description: '밴드 수축 판단 기준'
            }
          ]
        }
      ],
      
      selectedStrategy: null,
      strategyParams: {},
      
      // 종목 정보
      recommendedStocks: [],
      selectedStocks: [],
      loadingRecommendations: false,
      searchKeyword: '',
      searchResults: [],
      
      // 매매 제어
      tradingStatus: 'stopped', // stopped, running, paused
      investmentAmount: 1000000,
      allocationMethod: 'equal',
      stopLossPercent: 5,
      takeProfitPercent: 10,
      
      // 포지션 및 기록
      currentPositions: [],
      tradingHistory: [],
      historyFilter: 'today'
    }
  },
  
  computed: {
    ...mapGetters('auth', ['isAuthenticated']),
    
    canStartTrading() {
      return this.selectedStrategy && 
             this.selectedStocks.length > 0 && 
             this.investmentAmount >= 10000 &&
             this.investmentAmount <= this.accountInfo.balance &&
             this.tradingStatus === 'stopped'
    }
  },
  
  async mounted() {
    if (!this.isAuthenticated) {
      this.$router.push('/login')
      return
    }
    
    await this.initializeTrading()
  },
  
  methods: {
    async initializeTrading() {
      try {
        await Promise.all([
          this.refreshAccountInfo(),
          this.getAIRecommendations(),
          this.refreshPositions(),
          this.loadTradingHistory()
        ])
      } catch (error) {
        console.error('매매 초기화 실패:', error)
        this.$toast.error('매매 시스템 초기화에 실패했습니다.')
      }
    },
    
    async refreshAccountInfo() {
      try {
        const response = await apiClient.get('/trading/account')
        this.accountInfo = response.data.data
      } catch (error) {
        console.error('계좌 정보 조회 실패:', error)
        this.$toast.error('계좌 정보를 조회할 수 없습니다.')
      }
    },
    
    async getAIRecommendations() {
      this.loadingRecommendations = true
      try {
        const response = await apiClient.get('/trading/ai-recommendations')
        this.recommendedStocks = response.data.data
      } catch (error) {
        console.error('AI 추천 실패:', error)
        this.$toast.error('AI 종목 추천을 받을 수 없습니다.')
      } finally {
        this.loadingRecommendations = false
      }
    },
    
    selectStrategy(strategy) {
      this.selectedStrategy = strategy
      this.strategyParams = {}
      
      // 기본값 설정
      strategy.parameters.forEach(param => {
        this.strategyParams[param.key] = param.placeholder
      })
    },
    
    toggleStock(stockCode) {
      const index = this.selectedStocks.indexOf(stockCode)
      if (index > -1) {
        this.selectedStocks.splice(index, 1)
      } else {
        this.selectedStocks.push(stockCode)
      }
    },
    
    async searchStock() {
      if (!this.searchKeyword.trim()) return
      
      try {
        const response = await apiClient.get('/trading/search-stock', {
          params: { keyword: this.searchKeyword }
        })
        this.searchResults = response.data.data
      } catch (error) {
        console.error('종목 검색 실패:', error)
        this.$toast.error('종목 검색에 실패했습니다.')
      }
    },
    
    addCustomStock(stock) {
      if (!this.recommendedStocks.find(s => s.code === stock.code)) {
        this.recommendedStocks.push({
          ...stock,
          aiReason: '사용자 직접 추가',
          aiScore: 50
        })
      }
      this.toggleStock(stock.code)
      this.searchResults = []
      this.searchKeyword = ''
    },
    
    async startTrading() {
      if (!this.canStartTrading) return
      
      try {
        const tradingConfig = {
          strategy: this.selectedStrategy.id,
          strategyParams: this.strategyParams,
          stocks: this.selectedStocks,
          investmentAmount: this.investmentAmount,
          allocationMethod: this.allocationMethod,
          stopLoss: this.stopLossPercent,
          takeProfit: this.takeProfitPercent
        }
        
        await apiClient.post('/trading/start', tradingConfig)
        this.tradingStatus = 'running'
        this.$toast.success('자동매매가 시작되었습니다!')
        
        // 실시간 업데이트 시작
        this.startRealTimeUpdates()
        
      } catch (error) {
        console.error('자동매매 시작 실패:', error)
        this.$toast.error('자동매매 시작에 실패했습니다.')
      }
    },
    
    async stopTrading() {
      try {
        await apiClient.post('/trading/stop')
        this.tradingStatus = 'stopped'
        this.$toast.success('자동매매가 중지되었습니다.')
        
        // 실시간 업데이트 중지
        this.stopRealTimeUpdates()
        
      } catch (error) {
        console.error('자동매매 중지 실패:', error)
        this.$toast.error('자동매매 중지에 실패했습니다.')
      }
    },
    
    async pauseTrading() {
      try {
        await apiClient.post('/trading/pause')
        this.tradingStatus = 'paused'
        this.$toast.info('자동매매가 일시정지되었습니다.')
      } catch (error) {
        console.error('자동매매 일시정지 실패:', error)
        this.$toast.error('자동매매 일시정지에 실패했습니다.')
      }
    },
    
    async refreshPositions() {
      try {
        const response = await apiClient.get('/trading/positions')
        this.currentPositions = response.data.data
      } catch (error) {
        console.error('포지션 조회 실패:', error)
      }
    },
    
    async loadTradingHistory() {
      try {
        const response = await apiClient.get('/trading/history', {
          params: { filter: this.historyFilter }
        })
        this.tradingHistory = response.data.data
      } catch (error) {
        console.error('거래 기록 조회 실패:', error)
      }
    },
    
    async sellPosition(position) {
      if (!confirm(`${position.name} 전량을 매도하시겠습니까?`)) return
      
      try {
        await apiClient.post('/trading/sell-position', {
          stockCode: position.code,
          quantity: position.quantity
        })
        this.$toast.success(`${position.name} 매도 주문이 접수되었습니다.`)
        await this.refreshPositions()
      } catch (error) {
        console.error('매도 실패:', error)
        this.$toast.error('매도 주문에 실패했습니다.')
      }
    },
    
    startRealTimeUpdates() {
      this.updateInterval = setInterval(() => {
        this.refreshPositions()
        this.refreshAccountInfo()
      }, 30000) // 30초마다 업데이트
    },
    
    stopRealTimeUpdates() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval)
        this.updateInterval = null
      }
    },
    
    getStatusText() {
      const statusMap = {
        stopped: '중지됨',
        running: '실행 중',
        paused: '일시정지'
      }
      return statusMap[this.tradingStatus] || '알 수 없음'
    },
    
    getTradeStatusText(status) {
      const statusMap = {
        pending: '대기',
        executed: '체결',
        cancelled: '취소',
        failed: '실패'
      }
      return statusMap[status] || status
    },
    
    formatMoney(amount) {
      if (typeof amount !== 'number') return '0'
      return amount.toLocaleString('ko-KR')
    },
    
    formatDateTime(timestamp) {
      return new Date(timestamp).toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  },
  
  beforeUnmount() {
    this.stopRealTimeUpdates()
  }
}
</script>

<style scoped>
.trading {
  padding: var(--spacing-lg) 0;
  background-color: var(--bg-secondary);
  min-height: calc(100vh - 70px);
}

.trading-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background-color: var(--white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}

.page-title {
  font-size: var(--font-xxl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0;
}

.account-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.account-card, .balance-card {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.account-label, .balance-label {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.account-number, .balance-amount {
  font-size: var(--font-lg);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.balance-amount {
  color: var(--primary-color);
}

.tab-navigation {
  display: flex;
  margin-bottom: var(--spacing-xl);
  background-color: var(--white);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xs);
  box-shadow: var(--shadow-sm);
}

.tab-button {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-lg);
  background: none;
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-secondary);
}

.tab-button.active {
  background-color: var(--primary-color);
  color: var(--white);
}

.trading-content {
  margin-top: var(--spacing-xl);
}

.trading-grid {
  display: grid;
  gap: var(--spacing-lg);
}

.strategy-section, .stocks-section {
  grid-column: 1 / -1;
}

.control-section {
  grid-column: 1 / -1;
}

.positions-section, .history-section {
  grid-column: 1 / -1;
}

.strategy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.strategy-card {
  border: 2px solid var(--border-light);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  background-color: var(--white);
}

.strategy-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.strategy-card.selected {
  border-color: var(--primary-color);
  background-color: rgba(25, 118, 210, 0.05);
}

.strategy-icon {
  font-size: 2rem;
  margin-bottom: var(--spacing-sm);
}

.strategy-name {
  font-size: var(--font-lg);
  font-weight: var(--font-medium);
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.strategy-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  line-height: 1.5;
}

.strategy-stats {
  display: flex;
  gap: var(--spacing-md);
}

.stat-item {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
}

.strategy-details {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-md);
}

.strategy-params {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.param-group {
  display: flex;
  flex-direction: column;
}

.param-description {
  margin-top: var(--spacing-xs);
  color: var(--text-secondary);
  font-size: var(--font-xs);
}

.stocks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.stock-card {
  border: 2px solid var(--border-light);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  background-color: var(--white);
  position: relative;
}

.stock-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stock-card.selected {
  border-color: var(--success-color);
  background-color: rgba(76, 175, 80, 0.05);
}

.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.stock-name {
  font-size: var(--font-md);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin: 0;
}

.stock-code {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
}

.stock-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.current-price {
  font-size: var(--font-lg);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.price-change {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
}

.price-change.positive {
  color: var(--error-color);
}

.price-change.negative {
  color: var(--primary-color);
}

.stock-reason {
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: var(--font-sm);
  line-height: 1.4;
}

.checkbox-wrapper {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
}

.checkbox-wrapper input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.custom-stock {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-md);
  background-color: var(--bg-secondary);
}

.stock-search {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.stock-search .form-input {
  flex: 1;
}

.search-results {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-sm);
  background-color: var(--white);
}

.search-result-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  border-bottom: 1px solid var(--border-light);
  transition: background-color var(--transition-fast);
}

.search-result-item:hover {
  background-color: var(--bg-secondary);
}

.search-result-item:last-child {
  border-bottom: none;
}

.control-section .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trading-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-indicator.stopped {
  background-color: var(--gray);
}

.status-indicator.running {
  background-color: var(--success-color);
  animation: pulse 2s infinite;
}

.status-indicator.paused {
  background-color: var(--warning-color);
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.status-text {
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.control-settings {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.control-buttons {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
}

.control-buttons .btn {
  min-width: 140px;
}

.positions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-md);
}

.position-card {
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  background-color: var(--white);
}

.position-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.position-details {
  margin-bottom: var(--spacing-md);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-xs);
}

.detail-row .label {
  color: var(--text-secondary);
  font-size: var(--font-sm);
}

.detail-row .value {
  font-weight: var(--font-medium);
  font-size: var(--font-sm);
}

.detail-row .value.positive {
  color: var(--error-color);
}

.detail-row .value.negative {
  color: var(--primary-color);
}

.history-table {
  overflow-x: auto;
}

.history-table table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th,
.history-table td {
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: left;
  border-bottom: 1px solid var(--border-light);
}

.history-table th {
  background-color: var(--bg-secondary);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.trade-type.buy {
  color: var(--error-color);
  font-weight: var(--font-medium);
}

.trade-type.sell {
  color: var(--primary-color);
  font-weight: var(--font-medium);
}

.status.pending {
  color: var(--warning-color);
}

.status.executed {
  color: var(--success-color);
}

.status.cancelled,
.status.failed {
  color: var(--gray);
}

.loading-state {
  text-align: center;
  padding: var(--spacing-xl);
}

.loading-state .loading-spinner {
  margin: 0 auto var(--spacing-md);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
}

.coming-soon {
  text-align: center;
  padding: var(--spacing-xxl);
}

.coming-soon-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
}

.coming-soon h2 {
  font-size: var(--font-xl);
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.coming-soon p {
  font-size: var(--font-md);
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .trading-header {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }
  
  .account-info {
    justify-content: space-between;
  }
  
  .strategy-grid {
    grid-template-columns: 1fr;
  }
  
  .stocks-grid {
    grid-template-columns: 1fr;
  }
  
  .control-settings {
    grid-template-columns: 1fr;
  }
  
  .control-buttons {
    flex-direction: column;
  }
  
  .positions-grid {
    grid-template-columns: 1fr;
  }
  
  .history-table {
    font-size: var(--font-sm);
  }
  
  .stock-search {
    flex-direction: column;
  }
}
</style>