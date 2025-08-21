<template>
  <div class="trading-page">
    <div class="container">
      <!-- 페이지 헤더 -->
      <div class="page-header">
        <h1 class="page-title">AI 기반 자동매매</h1>
        <p class="page-subtitle">
          전문가 수준의 매매 전략으로 스마트한 투자를 시작하세요
        </p>
      </div>

      <!-- 계좌 현황 대시보드 -->
      <div class="account-dashboard">
        <div class="dashboard-grid">
          <div class="dashboard-card total-assets">
            <div class="card-icon">💰</div>
            <div class="card-content">
              <h3>총 자산</h3>
              <p class="amount">{{ formatCurrency(accountInfo.totalAssets) }}</p>
              <span class="change" :class="accountInfo.profitClass">
                {{ accountInfo.profitText }}
              </span>
            </div>
          </div>
          
          <div class="dashboard-card available-cash">
            <div class="card-icon">💳</div>
            <div class="card-content">
              <h3>투자 가능 금액</h3>
              <p class="amount">{{ formatCurrency(accountInfo.availableCash) }}</p>
              <span class="subtitle">즉시 투자 가능</span>
            </div>
          </div>
          
          <div class="dashboard-card active-sessions">
            <div class="card-icon">🤖</div>
            <div class="card-content">
              <h3>활성 자동매매</h3>
              <p class="amount">{{ activeSessions.length }}개</p>
              <span class="subtitle">실행 중인 전략</span>
            </div>
          </div>
          
          <div class="dashboard-card today-profit">
            <div class="card-icon">📈</div>
            <div class="card-content">
              <h3>오늘 수익</h3>
              <p class="amount" :class="todayProfitClass">
                {{ formatCurrency(todayProfit) }}
              </p>
              <span class="subtitle">자동매매 수익</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 자동매매 설정 -->
      <div class="trading-setup" v-if="!isAnySessionActive">
        <div class="setup-card">
          <div class="card-header">
            <h2>새 자동매매 시작</h2>
            <p>AI가 추천하는 종목과 전략으로 자동매매를 설정하세요</p>
          </div>
          
          <div class="card-body">
            <div class="setup-steps">
              <!-- Step 1: 시장 선택 -->
              <div class="step-section">
                <div class="step-header">
                  <span class="step-number">1</span>
                  <h3>투자 시장 선택</h3>
                </div>
                <div class="market-selection">
                  <div 
                    class="market-option"
                    :class="{ active: selectedMarket === 'domestic' }"
                    @click="selectedMarket = 'domestic'"
                  >
                    <div class="option-icon">🇰🇷</div>
                    <h4>국내 주식</h4>
                    <p>KOSPI, KOSDAQ</p>
                    <ul class="option-features">
                      <li>한국 대표 기업</li>
                      <li>낮은 환율 리스크</li>
                      <li>실시간 거래</li>
                    </ul>
                  </div>
                  
                  <div 
                    class="market-option"
                    :class="{ active: selectedMarket === 'overseas' }"
                    @click="selectedMarket = 'overseas'"
                  >
                    <div class="option-icon">🇺🇸</div>
                    <h4>해외 주식</h4>
                    <p>NYSE, NASDAQ</p>
                    <ul class="option-features">
                      <li>글로벌 대표 기업</li>
                      <li>높은 성장 잠재력</li>
                      <li>다양한 섹터</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Step 2: 전략 선택 -->
              <div class="step-section">
                <div class="step-header">
                  <span class="step-number">2</span>
                  <h3>매매 전략 선택</h3>
                </div>
                <div class="strategy-selection">
                  <div 
                    v-for="strategy in availableStrategies" 
                    :key="strategy.id"
                    class="strategy-option"
                    :class="{ active: selectedStrategy === strategy.id }"
                    @click="selectedStrategy = strategy.id"
                  >
                    <div class="strategy-header">
                      <div class="strategy-icon">{{ strategy.icon }}</div>
                      <h4>{{ strategy.name }}</h4>
                      <span class="risk-badge" :class="strategy.riskClass">
                        {{ strategy.riskLevel }}
                      </span>
                    </div>
                    <p class="strategy-description">{{ strategy.description }}</p>
                    <div class="strategy-features">
                      <div class="feature-item">
                        <span class="feature-label">수익률:</span>
                        <span class="feature-value">{{ strategy.expectedReturn }}</span>
                      </div>
                      <div class="feature-item">
                        <span class="feature-label">매매 빈도:</span>
                        <span class="feature-value">{{ strategy.tradingFrequency }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Step 3: AI 추천 종목 -->
              <div class="step-section">
                <div class="step-header">
                  <span class="step-number">3</span>
                  <h3>AI 추천 종목</h3>
                  <button 
                    @click="loadRecommendations" 
                    :disabled="isLoadingRecommendations"
                    class="btn btn-sm btn-outline"
                  >
                    <span v-if="isLoadingRecommendations" class="loading-spinner"></span>
                    {{ isLoadingRecommendations ? '분석 중...' : '새로 분석' }}
                  </button>
                </div>
                
                <div v-if="isLoadingRecommendations" class="loading-state">
                  <div class="loading-spinner-large"></div>
                  <p>AI가 최적의 종목을 분석하고 있습니다...</p>
                </div>
                
                <div v-else-if="recommendations.length > 0" class="recommendations-grid">
                  <div 
                    v-for="stock in recommendations" 
                    :key="stock.symbol"
                    class="stock-recommendation"
                    :class="{ selected: selectedStocks.some(s => s.symbol === stock.symbol) }"
                    @click="toggleStockSelection(stock)"
                  >
                    <div class="stock-header">
                      <div class="stock-info">
                        <h4>{{ stock.name }}</h4>
                        <span class="stock-symbol">{{ stock.symbol }}</span>
                        <span class="stock-sector">{{ stock.sector }}</span>
                      </div>
                      <div class="stock-price">
                        <span class="current-price">
                          {{ formatCurrency(stock.currentPrice, selectedMarket === 'overseas' ? 'USD' : 'KRW') }}
                        </span>
                        <span 
                          class="price-change" 
                          :class="{ 
                            positive: stock.changeRate > 0, 
                            negative: stock.changeRate < 0 
                          }"
                        >
                          {{ stock.changeRate > 0 ? '+' : '' }}{{ stock.changeRate?.toFixed(2) }}%
                        </span>
                      </div>
                    </div>
                    
                    <p class="stock-reason">{{ stock.reason }}</p>
                    
                    <div class="stock-metrics">
                      <div class="metric-item">
                        <span class="metric-label">목표가:</span>
                        <span class="metric-value">
                          {{ formatCurrency(stock.targetPrice, selectedMarket === 'overseas' ? 'USD' : 'KRW') }}
                        </span>
                      </div>
                      <div class="metric-item">
                        <span class="metric-label">위험도:</span>
                        <span class="metric-value risk-level" :class="getRiskClass(stock.riskLevel)">
                          {{ stock.riskLevel }}
                        </span>
                      </div>
                      <div class="metric-item">
                        <span class="metric-label">투자기간:</span>
                        <span class="metric-value">{{ stock.timeHorizon }}</span>
                      </div>
                    </div>
                    
                    <div class="selection-indicator">
                      <span v-if="selectedStocks.some(s => s.symbol === stock.symbol)" class="selected-badge">
                        ✓ 선택됨
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Step 4: 투자 설정 -->
              <div class="step-section">
                <div class="step-header">
                  <span class="step-number">4</span>
                  <h3>투자 금액 설정</h3>
                </div>
                
                <div class="investment-settings">
                  <div class="amount-input-group">
                    <label class="input-label">총 투자 금액</label>
                    <div class="amount-input-container">
                      <input 
                        type="number" 
                        v-model.number="investmentAmount"
                        :max="accountInfo.availableCash"
                        min="10000"
                        step="10000"
                        class="amount-input"
                        placeholder="투자할 금액을 입력하세요"
                      >
                      <span class="currency-suffix">{{ selectedMarket === 'overseas' ? 'USD' : '원' }}</span>
                    </div>
                    <div class="amount-suggestions">
                      <button 
                        v-for="ratio in [0.1, 0.25, 0.5, 0.75]" 
                        :key="ratio"
                        @click="setInvestmentRatio(ratio)"
                        class="ratio-btn"
                      >
                        {{ (ratio * 100) }}%
                      </button>
                    </div>
                    <p class="available-info">
                      투자 가능: {{ formatCurrency(accountInfo.availableCash) }}
                    </p>
                  </div>
                  
                  <div class="risk-level-selection">
                    <label class="input-label">위험 수준</label>
                    <div class="risk-options">
                      <div 
                        v-for="risk in riskLevels" 
                        :key="risk.id"
                        class="risk-option"
                        :class="{ active: selectedRiskLevel === risk.id }"
                        @click="selectedRiskLevel = risk.id"
                      >
                        <div class="risk-icon">{{ risk.icon }}</div>
                        <div class="risk-content">
                          <h5>{{ risk.name }}</h5>
                          <p>{{ risk.description }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 시작 버튼 -->
              <div class="start-section">
                <div class="start-summary">
                  <h3>설정 요약</h3>
                  <div class="summary-grid">
                    <div class="summary-item">
                      <span class="label">시장:</span>
                      <span class="value">{{ selectedMarket === 'domestic' ? '국내 주식' : '해외 주식' }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="label">전략:</span>
                      <span class="value">{{ getSelectedStrategyName() }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="label">선택 종목:</span>
                      <span class="value">{{ selectedStocks.length }}개</span>
                    </div>
                    <div class="summary-item">
                      <span class="label">투자 금액:</span>
                      <span class="value">{{ formatCurrency(investmentAmount) }}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  @click="startAutoTrading"
                  :disabled="!canStartTrading || isStartingTrading"
                  class="btn btn-primary btn-lg start-trading-btn"
                >
                  <span v-if="isStartingTrading" class="loading-spinner"></span>
                  {{ isStartingTrading ? '시작하는 중...' : '자동매매 시작' }}
                </button>
                
                <p class="start-warning">
                  ⚠️ 실제 계좌로 거래가 실행됩니다. 신중하게 검토 후 시작하세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 활성 자동매매 세션 -->
      <div v-if="activeSessions.length > 0" class="active-sessions">
        <div class="section-header">
          <h2>실행 중인 자동매매</h2>
          <span class="session-count">{{ activeSessions.length }}개 실행 중</span>
        </div>
        
        <div class="sessions-grid">
          <div 
            v-for="session in activeSessions" 
            :key="session.sessionId"
            class="session-card"
          >
            <div class="session-header">
              <div class="session-info">
                <h3>{{ getSessionTitle(session) }}</h3>
                <div class="session-meta">
                  <span class="session-status" :class="session.status.toLowerCase()">
                    {{ getStatusText(session.status) }}
                  </span>
                  <span class="session-duration">
                    {{ getSessionDuration(session.startTime) }}
                  </span>
                </div>
              </div>
              <button 
                @click="stopSession(session.sessionId)"
                class="btn btn-sm btn-danger"
                :disabled="session.status !== 'ACTIVE'"
              >
                중지
              </button>
            </div>
            
            <div class="session-stats">
              <div class="stat-item">
                <span class="stat-label">투자금액:</span>
                <span class="stat-value">{{ formatCurrency(session.investmentAmount) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">종목수:</span>
                <span class="stat-value">{{ session.stockCount }}개</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">실행횟수:</span>
                <span class="stat-value">{{ session.orderCount }}회</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">수익:</span>
                <span class="stat-value" :class="session.totalProfit >= 0 ? 'positive' : 'negative'">
                  {{ formatCurrency(session.totalProfit) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 거래 내역 -->
      <div class="trading-history">
        <div class="section-header">
          <h2>최근 거래 내역</h2>
          <button @click="loadTradingHistory" class="btn btn-sm btn-outline">
            새로고침
          </button>
        </div>
        
        <div v-if="tradingHistory.length === 0" class="empty-history">
          <div class="empty-icon">📊</div>
          <h3>거래 내역이 없습니다</h3>
          <p>자동매매를 시작하면 거래 내역이 여기에 표시됩니다</p>
        </div>
        
        <div v-else class="history-table">
          <div class="table-header">
            <div class="th">시간</div>
            <div class="th">종목</div>
            <div class="th">구분</div>
            <div class="th">수량</div>
            <div class="th">가격</div>
            <div class="th">수익</div>
          </div>
          <div class="table-body">
            <div 
              v-for="trade in tradingHistory.slice(0, 10)" 
              :key="trade.id"
              class="table-row"
            >
              <div class="td">{{ formatDateTime(trade.executed_at) }}</div>
              <div class="td">
                <div class="stock-info">
                  <span class="stock-name">{{ trade.stock_code }}</span>
                </div>
              </div>
              <div class="td">
                <span class="trade-type" :class="trade.trade_type.toLowerCase()">
                  {{ trade.trade_type === 'BUY' ? '매수' : '매도' }}
                </span>
              </div>
              <div class="td">{{ trade.quantity?.toLocaleString() }}</div>
              <div class="td">{{ formatCurrency(trade.price) }}</div>
              <div class="td">
                <span 
                  v-if="trade.profit_loss"
                  class="profit-amount" 
                  :class="trade.profit_loss >= 0 ? 'positive' : 'negative'"
                >
                  {{ formatCurrency(trade.profit_loss) }}
                </span>
                <span v-else>-</span>
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

export default {
  name: 'TradingPage',
  data() {
    return {
      // 계좌 정보
      accountInfo: {
        totalAssets: 0,
        availableCash: 0,
        stockValue: 0,
        profitLoss: 0,
        profitClass: '',
        profitText: ''
      },
      
      // 설정값들
      selectedMarket: 'domestic',
      selectedStrategy: 'comprehensive',
      selectedStocks: [],
      selectedRiskLevel: 'balanced',
      investmentAmount: 0,
      
      // 추천 종목
      recommendations: [],
      isLoadingRecommendations: false,
      
      // 자동매매 세션
      activeSessions: [],
      isStartingTrading: false,
      
      // 거래 내역
      tradingHistory: [],
      todayProfit: 0,
      
      // 전략 옵션들
      availableStrategies: [
        {
          id: 'comprehensive',
          name: '종합 분석',
          icon: '🎯',
          description: '이동평균선, RSI, 볼린저밴드를 종합 분석하여 최적의 매매 타이밍을 포착합니다.',
          expectedReturn: '연 8-12%',
          tradingFrequency: '주 2-3회',
          riskLevel: '보통',
          riskClass: 'medium'
        },
        {
          id: 'movingAverage',
          name: '이동평균선 전략',
          icon: '📈',
          description: '단기/장기 이동평균선의 골든크로스와 데드크로스를 활용한 안정적인 매매 전략입니다.',
          expectedReturn: '연 6-10%',
          tradingFrequency: '주 1-2회',
          riskLevel: '낮음',
          riskClass: 'low'
        },
        {
          id: 'rsi',
          name: 'RSI 모멘텀',
          icon: '⚡',
          description: 'RSI 지표를 활용해 과매수/과매도 구간에서 빠른 매매로 높은 수익을 추구합니다.',
          expectedReturn: '연 10-15%',
          tradingFrequency: '주 3-5회',
          riskLevel: '높음',
          riskClass: 'high'
        }
      ],
      
      riskLevels: [
        {
          id: 'conservative',
          name: '안전형',
          icon: '🛡️',
          description: '안정성을 최우선으로 하는 보수적 투자'
        },
        {
          id: 'balanced',
          name: '균형형',
          icon: '⚖️',
          description: '수익과 안정성의 적절한 균형'
        },
        {
          id: 'aggressive',
          name: '적극형',
          icon: '🚀',
          description: '높은 수익을 위한 공격적 투자'
        }
      ]
    }
  },
  
  computed: {
    ...mapGetters('auth', ['isAuthenticated']),
    
    isAnySessionActive() {
      return this.activeSessions.some(session => session.status === 'ACTIVE')
    },
    
    canStartTrading() {
      return this.selectedStocks.length > 0 && 
             this.investmentAmount > 0 && 
             this.investmentAmount <= this.accountInfo.availableCash
    },
    
    todayProfitClass() {
      return this.todayProfit >= 0 ? 'positive' : 'negative'
    }
  },
  
  async mounted() {
    if (!this.isAuthenticated) {
      this.$router.push('/login')
      return
    }
    
    await this.initializePage()
  },
  
  methods: {
    ...mapActions(['setLoading']),
    
    async initializePage() {
      this.setLoading(true)
      try {
        await Promise.all([
          this.loadAccountInfo(),
          this.loadActiveSessions(),
          this.loadTradingHistory(),
          this.loadRecommendations()
        ])
      } catch (error) {
        console.error('❌ 페이지 초기화 실패:', error)
        this.$toast.error('페이지 로딩 중 오류가 발생했습니다.')
      } finally {
        this.setLoading(false)
      }
    },
    
    async loadAccountInfo() {
      try {
        const response = await this.$api.get('/trading/account')
        if (response.data.success) {
          const data = response.data.data
          this.accountInfo = {
            totalAssets: (data.domestic?.totalAssets || 0) + (data.overseas?.totalAssets || 0),
            availableCash: data.domestic?.availableCash || 0,
            stockValue: data.domestic?.stockValue || 0,
            profitLoss: data.domestic?.profitLoss || 0
          }
          
          // 수익률 계산
          if (this.accountInfo.profitLoss >= 0) {
            this.accountInfo.profitClass = 'positive'
            this.accountInfo.profitText = `+${this.formatCurrency(this.accountInfo.profitLoss)}`
          } else {
            this.accountInfo.profitClass = 'negative'
            this.accountInfo.profitText = this.formatCurrency(this.accountInfo.profitLoss)
          }
        }
      } catch (error) {
        console.error('❌ 계좌 정보 로딩 실패:', error)
        this.$toast.error('계좌 정보를 불러올 수 없습니다.')
      }
    },
    
    async loadRecommendations() {
      this.isLoadingRecommendations = true
      try {
        const response = await this.$api.get('/trading/recommendations', {
          params: {
            marketType: this.selectedMarket,
            investmentStyle: this.selectedRiskLevel
          }
        })
        
        if (response.data.success) {
          this.recommendations = response.data.data.recommendations
        }
      } catch (error) {
        console.error('❌ AI 추천 로딩 실패:', error)
        this.$toast.error('AI 추천 종목을 불러올 수 없습니다.')
      } finally {
        this.isLoadingRecommendations = false
      }
    },
    
    async loadActiveSessions() {
      try {
        const response = await this.$api.get('/trading/status')
        if (response.data.success) {
          this.activeSessions = response.data.data.activeSessions
        }
      } catch (error) {
        console.error('❌ 활성 세션 로딩 실패:', error)
      }
    },
    
    async loadTradingHistory() {
      try {
        const response = await this.$api.get('/trading/history')
        if (response.data.success) {
          this.tradingHistory = response.data.data.trades
          
          // 오늘 수익 계산
          const today = new Date().toISOString().slice(0, 10)
          this.todayProfit = this.tradingHistory
            .filter(trade => trade.executed_at.slice(0, 10) === today)
            .reduce((sum, trade) => sum + (trade.profit_loss || 0), 0)
        }
      } catch (error) {
        console.error('❌ 거래 내역 로딩 실패:', error)
      }
    },
    
    toggleStockSelection(stock) {
      const existingIndex = this.selectedStocks.findIndex(s => s.symbol === stock.symbol)
      
      if (existingIndex >= 0) {
        this.selectedStocks.splice(existingIndex, 1)
      } else {
        if (this.selectedStocks.length < 5) {
          this.selectedStocks.push(stock)
        } else {
          this.$toast.warning('최대 5개 종목까지 선택할 수 있습니다.')
        }
      }
    },
    
    setInvestmentRatio(ratio) {
      this.investmentAmount = Math.floor(this.accountInfo.availableCash * ratio)
    },
    
    async startAutoTrading() {
      if (!this.canStartTrading) {
        this.$toast.error('모든 설정을 완료해주세요.')
        return
      }
      
      this.isStartingTrading = true
      try {
        const response = await this.$api.post('/trading/start', {
          stocks: this.selectedStocks,
          strategy: this.selectedStrategy,
          marketType: this.selectedMarket,
          investmentAmount: this.investmentAmount,
          riskLevel: this.selectedRiskLevel
        })
        
        if (response.data.success) {
          this.$toast.success('자동매매가 시작되었습니다!')
          await this.loadActiveSessions()
          
          // 설정 초기화
          this.selectedStocks = []
          this.investmentAmount = 0
        } else {
          throw new Error(response.data.message)
        }
      } catch (error) {
        console.error('❌ 자동매매 시작 실패:', error)
        this.$toast.error(error.response?.data?.message || '자동매매 시작에 실패했습니다.')
      } finally {
        this.isStartingTrading = false
      }
    },
    
    async stopSession(sessionId) {
      if (!confirm('정말로 자동매매를 중지하시겠습니까?')) {
        return
      }
      
      try {
        const response = await this.$api.post(`/trading/stop/${sessionId}`)
        if (response.data.success) {
          this.$toast.success('자동매매가 중지되었습니다.')
          await this.loadActiveSessions()
          await this.loadTradingHistory()
        }
      } catch (error) {
        console.error('❌ 자동매매 중지 실패:', error)
        this.$toast.error('자동매매 중지에 실패했습니다.')
      }
    },
    
    // 유틸리티 메서드들
    formatCurrency(amount, currency = 'KRW') {
      if (amount === undefined || amount === null) return '0원'
      
      if (currency === 'USD') {
        return `$${Math.abs(amount).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
      } else {
        return `${Math.abs(amount).toLocaleString()}원`
      }
    },
    
    formatDateTime(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    getSelectedStrategyName() {
      const strategy = this.availableStrategies.find(s => s.id === this.selectedStrategy)
      return strategy?.name || '선택된 전략 없음'
    },
    
    getSessionTitle(session) {
      const marketText = session.marketType === 'domestic' ? '국내' : '해외'
      const strategyText = this.getStrategyNameById(session.strategy)
      return `${marketText} ${strategyText}`
    },
    
    getStrategyNameById(strategyId) {
      const strategy = this.availableStrategies.find(s => s.id === strategyId)
      return strategy?.name || '알 수 없음'
    },
    
    getStatusText(status) {
      const statusMap = {
        'ACTIVE': '실행중',
        'STOPPED': '중지됨',
        'ERROR': '오류'
      }
      return statusMap[status] || status
    },
    
    getSessionDuration(startTime) {
      const start = new Date(startTime)
      const now = new Date()
      const diffMs = now - start
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      
      if (diffHours > 0) {
        return `${diffHours}시간 ${diffMins}분`
      } else {
        return `${diffMins}분`
      }
    },
    
    getRiskClass(riskLevel) {
      const riskMap = {
        '낮음': 'low',
        '보통': 'medium', 
        '높음': 'high'
      }
      return riskMap[riskLevel] || 'medium'
    }
  },
  
  watch: {
    selectedMarket() {
      this.selectedStocks = []
      this.loadRecommendations()
    },
    
    selectedRiskLevel() {
      this.loadRecommendations()
    }
  }
}
</script>

<style scoped>
.trading-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
  padding: var(--spacing-lg) 0;
}

.page-header {
  text-align: center;
  margin-bottom: var(--spacing-xxl);
}

.page-title {
  font-size: 2.5rem;
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.page-subtitle {
  font-size: var(--font-lg);
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

/* 계좌 대시보드 */
.account-dashboard {
  margin-bottom: var(--spacing-xxl);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.dashboard-card {
  background: var(--white);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.dashboard-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border-radius: 50%;
  color: white;
  font-weight: bold;
}

.card-content h3 {
  font-size: var(--font-md);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-xs) 0;
  font-weight: var(--font-medium);
}

.card-content .amount {
  font-size: var(--font-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.card-content .change {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
}

.change.positive { color: var(--success-color); }
.change.negative { color: var(--error-color); }

.card-content .subtitle {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

/* 자동매매 설정 */
.trading-setup {
  margin-bottom: var(--spacing-xxl);
}

.setup-card {
  background: var(--white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.card-header {
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(25, 118, 210, 0.05));
  border-bottom: 1px solid var(--border-light);
}

.card-header h2 {
  font-size: var(--font-xl);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.card-header p {
  color: var(--text-secondary);
  margin: 0;
}

.card-body {
  padding: var(--spacing-xl);
}

/* 단계별 설정 */
.step-section {
  margin-bottom: var(--spacing-xxl);
  padding-bottom: var(--spacing-xxl);
  border-bottom: 1px solid var(--border-light);
}

.step-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.step-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-bold);
  font-size: var(--font-lg);
}

.step-header h3 {
  font-size: var(--font-lg);
  color: var(--text-primary);
  margin: 0;
  flex: 1;
}

/* 시장 선택 */
.market-selection {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.market-option {
  border: 2px solid var(--border-light);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  cursor: pointer;
  transition: all var(--transition-normal);
  text-align: center;
}

.market-option:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.market-option.active {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(25, 118, 210, 0.05));
}

.option-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
}

.market-option h4 {
  font-size: var(--font-lg);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.market-option p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.option-features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.option-features li {
  padding: var(--spacing-xs) 0;
  color: var(--text-secondary);
  font-size: var(--font-sm);
  position: relative;
  padding-left: var(--spacing-md);
}

.option-features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--success-color);
}

/* 전략 선택 */
.strategy-selection {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--spacing-lg);
}

.strategy-option {
  border: 2px solid var(--border-light);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.strategy-option:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.strategy-option.active {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(25, 118, 210, 0.05));
}

.strategy-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.strategy-icon {
  font-size: var(--font-xl);
}

.strategy-header h4 {
  flex: 1;
  margin: 0;
  color: var(--text-primary);
}

.risk-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-xl);
  font-size: var(--font-xs);
  font-weight: var(--font-medium);
  text-transform: uppercase;
}

.risk-badge.low { background: var(--success-color); color: white; }
.risk-badge.medium { background: var(--warning-color); color: white; }
.risk-badge.high { background: var(--error-color); color: white; }

.strategy-description {
  color: var(--text-secondary);
  font-size: var(--font-sm);
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
}

.strategy-features {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.feature-item {
  text-align: center;
}

.feature-label {
  display: block;
  font-size: var(--font-xs);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.feature-value {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

/* 종목 추천 */
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

@keyframes spin {
  to { transform: rotate(360deg); }
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-lg);
}

.stock-recommendation {
  border: 2px solid var(--border-light);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
}

.stock-recommendation:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.stock-recommendation.selected {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(25, 118, 210, 0.05));
}

.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.stock-info h4 {
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--text-primary);
}

.stock-symbol {
  display: inline-block;
  background: var(--bg-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-xs);
  color: var(--text-secondary);
  margin-right: var(--spacing-sm);
}

.stock-sector {
  font-size: var(--font-xs);
  color: var(--text-secondary);
}

.stock-price {
  text-align: right;
}

.current-price {
  display: block;
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.price-change {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
}

.price-change.positive { color: var(--success-color); }
.price-change.negative { color: var(--error-color); }

.stock-reason {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: var(--spacing-md);
}

.stock-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.metric-item {
  text-align: center;
  padding: var(--spacing-sm);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-sm);
}

.metric-label {
  display: block;
  font-size: var(--font-xs);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.metric-value {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.metric-value.risk-level.low { color: var(--success-color); }
.metric-value.risk-level.medium { color: var(--warning-color); }
.metric-value.risk-level.high { color: var(--error-color); }

.selection-indicator {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
}

.selected-badge {
  background: var(--primary-color);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-xl);
  font-size: var(--font-xs);
  font-weight: var(--font-medium);
}

/* 투자 설정 */
.investment-settings {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xxl);
}

.amount-input-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.input-label {
  font-size: var(--font-md);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.amount-input-container {
  position: relative;
}

.amount-input {
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid var(--border-light);
  border-radius: var(--border-radius-md);
  font-size: var(--font-lg);
  font-weight: var(--font-medium);
  text-align: right;
  padding-right: 60px;
}

.amount-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.currency-suffix {
  position: absolute;
  right: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.amount-suggestions {
  display: flex;
  gap: var(--spacing-sm);
}

.ratio-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-medium);
  background: var(--white);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-sm);
}

.ratio-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.available-info {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin: 0;
}

.risk-level-selection {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.risk-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.risk-option {
  border: 2px solid var(--border-light);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.risk-option:hover {
  border-color: var(--primary-color);
}

.risk-option.active {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(25, 118, 210, 0.05));
}

.risk-icon {
  font-size: var(--font-xl);
}

.risk-content h5 {
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--text-primary);
}

.risk-content p {
  margin: 0;
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

/* 시작 섹션 */
.start-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xxl);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  text-align: center;
}

.start-summary h3 {
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm);
}

.summary-item .label {
  color: var(--text-secondary);
  font-size: var(--font-sm);
}

.summary-item .value {
  font-weight: var(--font-medium);
  color: var(--text-primary);
  font-size: var(--font-sm);
}

.start-trading-btn {
  min-width: 200px;
  font-size: var(--font-lg);
  padding: var(--spacing-md) var(--spacing-xxl);
}

.start-warning {
  color: var(--warning-color);
  font-size: var(--font-sm);
  margin: 0;
  max-width: 400px;
}

/* 활성 세션 */
.active-sessions {
  margin-bottom: var(--spacing-xxl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.section-header h2 {
  color: var(--text-primary);
  margin: 0;
}

.session-count {
  background: var(--primary-color);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-xl);
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
}

.sessions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-lg);
}

.session-card {
  background: var(--white);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);
}

.session-info h3 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-primary);
}

.session-meta {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.session-status {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-xl);
  font-size: var(--font-xs);
  font-weight: var(--font-medium);
  text-transform: uppercase;
}

.session-status.active { background: var(--success-color); color: white; }
.session-status.stopped { background: var(--gray); color: white; }
.session-status.error { background: var(--error-color); color: white; }

.session-duration {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.session-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-sm);
}

.stat-label {
  color: var(--text-secondary);
  font-size: var(--font-sm);
}

.stat-value {
  font-weight: var(--font-medium);
  color: var(--text-primary);
  font-size: var(--font-sm);
}

.stat-value.positive { color: var(--success-color); }
.stat-value.negative { color: var(--error-color); }

/* 거래 내역 */
.trading-history {
  background: var(--white);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.empty-history {
  text-align: center;
  padding: var(--spacing-xxl) 0;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
}

.empty-history h3 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.empty-history p {
  color: var(--text-secondary);
  margin: 0;
}

.history-table {
  width: 100%;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 120px 150px 80px 100px 120px 100px;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  align-items: center;
}

.table-header {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.table-row {
  border-bottom: 1px solid var(--border-light);
}

.table-row:last-child {
  border-bottom: none;
}

.th,
.td {
  font-size: var(--font-sm);
}

.th {
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.td {
  color: var(--text-secondary);
}

.trade-type {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-xs);
  font-weight: var(--font-medium);
  text-transform: uppercase;
}

.trade-type.buy { background: var(--success-color); color: white; }
.trade-type.sell { background: var(--error-color); color: white; }

.profit-amount.positive { color: var(--success-color); }
.profit-amount.negative { color: var(--error-color); }

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

/* 반응형 */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .market-selection,
  .strategy-selection,
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
  
  .investment-settings {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .sessions-grid {
    grid-template-columns: 1fr;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: repeat(3, 1fr);
    font-size: var(--font-xs);
  }
  
  .table-header .th:nth-child(n+4),
  .table-row .td:nth-child(n+4) {
    display: none;
  }
  
  .step-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .step-header .btn {
    align-self: flex-end;
  }
}
</style>