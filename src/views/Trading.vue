<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="trading-page">
    <div class="container">
      <!-- 페이지 헤더 -->
      <div class="page-header">
        <h1 class="page-title">한국투자증권 자동매매</h1>
        <div class="account-summary">
          <div class="account-item">
            <span class="label">계좌번호</span>
            <span class="value">{{ accountInfo.accountNo }}</span>
          </div>
          <div class="account-item">
            <span class="label">현재 잔고</span>
            <span class="value balance">{{ formatMoney(accountInfo.balance) }}원</span>
          </div>
          <button @click="refreshAccount" class="refresh-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            새로고침
          </button>
        </div>
      </div>

      <!-- 탭 메뉴 -->
      <div class="tab-menu">
        <button 
          @click="activeTab = 'domestic'"
          :class="['tab-btn', { active: activeTab === 'domestic' }]"
        >
          국내투자
        </button>
        <button 
          @click="activeTab = 'overseas'"
          :class="['tab-btn', { active: activeTab === 'overseas' }]"
        >
          해외투자
        </button>
      </div>

      <!-- 국내투자 탭 내용 -->
      <div v-if="activeTab === 'domestic'" class="tab-content">
        
        <!-- 전략 선택 섹션 -->
        <section class="strategy-section">
          <div class="section-header">
            <h2 class="section-title">매매 전략 선택</h2>
          </div>
          <div class="strategy-cards">
            <div 
              v-for="strategy in tradingStrategies" 
              :key="strategy.id"
              @click="selectStrategy(strategy)"
              :class="['strategy-card', { selected: selectedStrategy?.id === strategy.id }]"
            >
              <div class="strategy-icon">{{ strategy.icon }}</div>
              <h3 class="strategy-name">{{ strategy.name }}</h3>
              <p class="strategy-desc">{{ strategy.description }}</p>
              <div class="strategy-stats">
                <span class="stat">수익률: {{ strategy.expectedReturn }}</span>
                <span class="stat">위험도: {{ strategy.riskLevel }}</span>
              </div>
            </div>
          </div>

          <!-- 선택된 전략 설정 -->
          <div v-if="selectedStrategy" class="strategy-config">
            <h3>{{ selectedStrategy.name }} 상세 설정</h3>
            <div class="config-grid">
              <div v-for="param in selectedStrategy.parameters" :key="param.key" class="config-item">
                <label :for="param.key">{{ param.label }}</label>
                <input 
                  :id="param.key"
                  v-model="strategyParams[param.key]"
                  :type="param.type"
                  :min="param.min"
                  :max="param.max"
                  :step="param.step"
                  :placeholder="param.placeholder"
                  class="config-input"
                >
                <small class="config-help">{{ param.description }}</small>
              </div>
            </div>
          </div>
        </section>

        <!-- AI 추천 종목 섹션 -->
        <section class="stocks-section">
          <div class="section-header">
            <h2 class="section-title">AI 추천 종목</h2>
            <button @click="getRecommendations" class="recommend-btn">
              AI 재추천
            </button>
          </div>

          <div v-if="loadingStocks" class="loading-stocks">
            <div class="spinner"></div>
            <p>AI가 최적의 종목을 분석하고 있습니다...</p>
          </div>

          <div v-else class="stocks-grid">
            <div 
              v-for="stock in recommendedStocks" 
              :key="stock.code"
              @click="toggleStock(stock.code)"
              :class="['stock-card', { selected: selectedStocks.includes(stock.code) }]"
            >
              <div class="stock-info">
                <h3 class="stock-name">{{ stock.name }}</h3>
                <span class="stock-code">{{ stock.code }}</span>
              </div>
              <div class="stock-price">
                <span class="current-price">{{ formatMoney(stock.currentPrice) }}원</span>
                <span :class="['price-change', stock.changeRate >= 0 ? 'up' : 'down']">
                  {{ stock.changeRate >= 0 ? '+' : '' }}{{ stock.changeRate }}%
                </span>
              </div>
              <div class="ai-reason">
                <small>{{ stock.aiReason }}</small>
              </div>
              <div class="stock-checkbox">
                <input 
                  type="checkbox" 
                  :checked="selectedStocks.includes(stock.code)"
                  @click.stop="toggleStock(stock.code)"
                >
              </div>
            </div>
          </div>

          <!-- 직접 종목 추가 -->
          <div class="add-stock">
            <h3>직접 종목 추가</h3>
            <div class="search-stock">
              <input 
                v-model="stockKeyword"
                @keypress.enter="searchStocks"
                placeholder="종목명 또는 코드 입력 (예: 삼성전자, 005930)"
                class="search-input"
              >
              <button @click="searchStocks" class="search-btn">검색</button>
            </div>
            <div v-if="searchResults.length" class="search-results">
              <div 
                v-for="stock in searchResults" 
                :key="stock.code"
                @click="addStock(stock)"
                class="search-result"
              >
                <span class="result-name">{{ stock.name }}</span>
                <span class="result-code">{{ stock.code }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 자동매매 제어 섹션 -->
        <section class="control-section">
          <div class="section-header">
            <h2 class="section-title">자동매매 제어</h2>
            <div class="trading-status">
              <div :class="['status-dot', tradingStatus]"></div>
              <span class="status-text">{{ getStatusText() }}</span>
            </div>
          </div>

          <div class="control-grid">
            <div class="control-group">
              <label>투자 금액</label>
              <input 
                v-model="investAmount"
                type="number"
                min="10000"
                :max="accountInfo.balance"
                step="10000"
                placeholder="최소 10,000원"
                class="control-input"
              >
              <small>사용 가능: {{ formatMoney(accountInfo.balance) }}원</small>
            </div>

            <div class="control-group">
              <label>배분 방식</label>
              <select v-model="allocationMethod" class="control-select">
                <option value="equal">균등 배분</option>
                <option value="weighted">AI 가중 배분</option>
                <option value="custom">사용자 정의</option>
              </select>
            </div>

            <div class="control-group">
              <label>손절 기준 (%)</label>
              <input 
                v-model="stopLoss"
                type="number"
                min="1"
                max="30"
                step="0.1"
                placeholder="5"
                class="control-input"
              >
              <small>하락 시 자동 매도</small>
            </div>

            <div class="control-group">
              <label>익절 기준 (%)</label>
              <input 
                v-model="takeProfit"
                type="number"
                min="1"
                max="100"
                step="0.1"
                placeholder="10"
                class="control-input"
              >
              <small>상승 시 자동 매도</small>
            </div>
          </div>

          <div class="control-buttons">
            <button 
              @click="startTrading"
              :disabled="!canStart"
              class="control-btn start-btn"
            >
              자동매매 시작
            </button>
            <button 
              @click="stopTrading"
              :disabled="tradingStatus !== 'running'"
              class="control-btn stop-btn"
            >
              자동매매 중지
            </button>
            <button 
              @click="pauseTrading"
              :disabled="tradingStatus !== 'running'"
              class="control-btn pause-btn"
            >
              일시정지
            </button>
          </div>
        </section>

        <!-- 현재 포지션 섹션 -->
        <section class="positions-section">
          <div class="section-header">
            <h2 class="section-title">현재 포지션</h2>
            <button @click="refreshPositions" class="refresh-btn">새로고침</button>
          </div>

          <div v-if="positions.length === 0" class="empty-positions">
            <p>현재 보유 중인 종목이 없습니다.</p>
          </div>

          <div v-else class="positions-grid">
            <div v-for="position in positions" :key="position.code" class="position-card">
              <div class="position-header">
                <h3 class="position-name">{{ position.name }}</h3>
                <span class="position-code">{{ position.code }}</span>
              </div>
              <div class="position-details">
                <div class="detail-row">
                  <span>보유 수량</span>
                  <span>{{ position.quantity }}주</span>
                </div>
                <div class="detail-row">
                  <span>평균 매입가</span>
                  <span>{{ formatMoney(position.avgPrice) }}원</span>
                </div>
                <div class="detail-row">
                  <span>현재가</span>
                  <span>{{ formatMoney(position.currentPrice) }}원</span>
                </div>
                <div class="detail-row">
                  <span>평가손익</span>
                  <span :class="['pnl', position.pnl >= 0 ? 'profit' : 'loss']">
                    {{ position.pnl >= 0 ? '+' : '' }}{{ formatMoney(position.pnl) }}원
                    ({{ position.pnlPercent >= 0 ? '+' : '' }}{{ position.pnlPercent }}%)
                  </span>
                </div>
              </div>
              <button @click="sellAll(position)" class="sell-btn">전량 매도</button>
            </div>
          </div>
        </section>

        <!-- 거래 기록 섹션 -->
        <section class="history-section">
          <div class="section-header">
            <h2 class="section-title">거래 기록</h2>
            <select v-model="historyPeriod" @change="loadHistory" class="period-select">
              <option value="today">오늘</option>
              <option value="week">최근 1주</option>
              <option value="month">최근 1개월</option>
            </select>
          </div>

          <div class="history-table">
            <table>
              <thead>
                <tr>
                  <th>시간</th>
                  <th>종목</th>
                  <th>구분</th>
                  <th>수량</th>
                  <th>가격</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="record in tradingHistory" :key="record.id">
                  <td>{{ formatTime(record.timestamp) }}</td>
                  <td>{{ record.stockName }}</td>
                  <td :class="['trade-type', record.type]">
                    {{ record.type === 'buy' ? '매수' : '매도' }}
                  </td>
                  <td>{{ record.quantity }}주</td>
                  <td>{{ formatMoney(record.price) }}원</td>
                  <td :class="['trade-status', record.status]">
                    {{ getTradeStatus(record.status) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </div>

      <!-- 해외투자 탭 내용 -->
      <div v-if="activeTab === 'overseas'" class="tab-content">
        <div class="coming-soon">
          <div class="coming-icon">🚧</div>
          <h2>해외투자 기능 준비 중</h2>
          <p>미국 주식 자동매매 기능을 준비하고 있습니다.<br>곧 만나보실 수 있습니다!</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import apiClient from '@/utils/api'

export default {
  name: 'TradingView',
  data() {
    return {
      activeTab: 'domestic',
      
      // 계좌 정보
      accountInfo: {
        accountNo: '430-699-3101',
        balance: 0
      },
      
      // 전략 데이터
      tradingStrategies: [
        {
          id: 'moving_average',
          name: '이동평균선 돌파',
          icon: '📈',
          description: '단기 이동평균이 장기 이동평균을 상향 돌파할 때 매수하는 전략',
          expectedReturn: '8-12%',
          riskLevel: '중간',
          parameters: [
            {
              key: 'short_period',
              label: '단기 이동평균',
              type: 'number',
              min: 5,
              max: 30,
              step: 1,
              placeholder: '5',
              description: '단기 이동평균 기간 (일)'
            },
            {
              key: 'long_period',
              label: '장기 이동평균',
              type: 'number',
              min: 20,
              max: 120,
              step: 1,
              placeholder: '20',
              description: '장기 이동평균 기간 (일)'
            },
            {
              key: 'volume_ratio',
              label: '거래량 배수',
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
          id: 'rsi_strategy',
          name: 'RSI 역추세',
          icon: '🔄',
          description: 'RSI 과매도/과매수 구간에서 역추세를 노리는 전략',
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
              key: 'oversold',
              label: '과매도 기준',
              type: 'number',
              min: 20,
              max: 35,
              step: 1,
              placeholder: '30',
              description: 'RSI 과매도 기준값'
            },
            {
              key: 'overbought',
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
          id: 'bollinger_strategy',
          name: '볼린저 밴드',
          icon: '🎯',
          description: '볼린저 밴드 수축 후 확장 시점을 포착하는 전략',
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
              key: 'bb_deviation',
              label: '표준편차',
              type: 'number',
              min: 1.5,
              max: 2.5,
              step: 0.1,
              placeholder: '2.0',
              description: '표준편차 배수'
            },
            {
              key: 'squeeze_threshold',
              label: '수축 기준',
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
      
      // 종목 데이터
      recommendedStocks: [],
      selectedStocks: [],
      loadingStocks: false,
      stockKeyword: '',
      searchResults: [],
      
      // 매매 제어
      tradingStatus: 'stopped', // stopped, running, paused
      investAmount: 1000000,
      allocationMethod: 'equal',
      stopLoss: 5,
      takeProfit: 10,
      
      // 포지션과 기록
      positions: [],
      tradingHistory: [],
      historyPeriod: 'today',
      
      // 업데이트 인터벌
      updateTimer: null
    }
  },
  
  computed: {
    ...mapGetters('auth', ['isAuthenticated']),
    
    canStart() {
      return this.selectedStrategy && 
             this.selectedStocks.length > 0 && 
             this.investAmount >= 10000 &&
             this.investAmount <= this.accountInfo.balance &&
             this.tradingStatus === 'stopped'
    }
  },
  
  async mounted() {
    if (!this.isAuthenticated) {
      this.$router.push('/login')
      return
    }
    
    await this.initialize()
  },
  
  beforeUnmount() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
    }
  },
  
  methods: {
    async initialize() {
      try {
        await Promise.all([
          this.refreshAccount(),
          this.getRecommendations(),
          this.refreshPositions(),
          this.loadHistory()
        ])
      } catch (error) {
        console.error('초기화 실패:', error)
        this.$toast.error('시스템 초기화에 실패했습니다.')
      }
    },
    
    async refreshAccount() {
      try {
        const response = await apiClient.get('/trading/account')
        this.accountInfo = response.data.data
      } catch (error) {
        console.error('계좌 조회 실패:', error)
        this.$toast.error('계좌 정보를 조회할 수 없습니다.')
      }
    },
    
    async getRecommendations() {
      this.loadingStocks = true
      try {
        const response = await apiClient.get('/trading/ai-recommendations')
        this.recommendedStocks = response.data.data
      } catch (error) {
        console.error('AI 추천 실패:', error)
        this.$toast.error('AI 종목 추천을 받을 수 없습니다.')
      } finally {
        this.loadingStocks = false
      }
    },
    
    selectStrategy(strategy) {
      this.selectedStrategy = strategy
      this.strategyParams = {}
      
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
    
    async searchStocks() {
      if (!this.stockKeyword.trim()) return
      
      try {
        const response = await apiClient.get('/trading/search-stock', {
          params: { keyword: this.stockKeyword }
        })
        this.searchResults = response.data.data
      } catch (error) {
        console.error('종목 검색 실패:', error)
        this.$toast.error('종목 검색에 실패했습니다.')
      }
    },
    
    addStock(stock) {
      if (!this.recommendedStocks.find(s => s.code === stock.code)) {
        this.recommendedStocks.push({
          ...stock,
          aiReason: '사용자 직접 추가',
          aiScore: 50
        })
      }
      this.toggleStock(stock.code)
      this.searchResults = []
      this.stockKeyword = ''
    },
    
    async startTrading() {
      if (!this.canStart) return
      
      try {
        const config = {
          strategy: this.selectedStrategy.id,
          strategyParams: this.strategyParams,
          stocks: this.selectedStocks,
          investmentAmount: this.investAmount,
          allocationMethod: this.allocationMethod,
          stopLoss: this.stopLoss,
          takeProfit: this.takeProfit
        }
        
        await apiClient.post('/trading/start', config)
        this.tradingStatus = 'running'
        this.$toast.success('자동매매가 시작되었습니다!')
        
        this.startAutoUpdate()
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
        
        this.stopAutoUpdate()
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
        console.error('일시정지 실패:', error)
        this.$toast.error('일시정지에 실패했습니다.')
      }
    },
    
    async refreshPositions() {
      try {
        const response = await apiClient.get('/trading/positions')
        this.positions = response.data.data
      } catch (error) {
        console.error('포지션 조회 실패:', error)
      }
    },
    
    async loadHistory() {
      try {
        const response = await apiClient.get('/trading/history', {
          params: { filter: this.historyPeriod }
        })
        this.tradingHistory = response.data.data
      } catch (error) {
        console.error('기록 조회 실패:', error)
      }
    },
    
    async sellAll(position) {
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
    
    startAutoUpdate() {
      this.updateTimer = setInterval(() => {
        this.refreshPositions()
        this.refreshAccount()
      }, 30000)
    },
    
    stopAutoUpdate() {
      if (this.updateTimer) {
        clearInterval(this.updateTimer)
        this.updateTimer = null
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
    
    getTradeStatus(status) {
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
    
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.trading-page {
  min-height: calc(100vh - 70px);
  background-color: #f8f9fa;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 페이지 헤더 */
.page-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.account-summary {
  display: flex;
  align-items: center;
  gap: 24px;
}

.account-item {
  display: flex;
  flex-direction: column;
  text-align: right;
}

.account-item .label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.account-item .value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.account-item .balance {
  color: #1976d2;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: #e0e0e0;
}

/* 탭 메뉴 */
.tab-menu {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.tab-btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  background: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
}

.tab-btn.active {
  background: #1976d2;
  color: white;
}

/* 섹션 공통 */
.tab-content section {
  background: white;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 전략 선택 */
.strategy-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.strategy-card {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.strategy-card:hover {
  border-color: #1976d2;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.strategy-card.selected {
  border-color: #1976d2;
  background: rgba(25, 118, 210, 0.05);
}

.strategy-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.strategy-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.strategy-desc {
  color: #666;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 12px;
}

.strategy-stats {
  display: flex;
  gap: 12px;
}

.stat {
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

/* 전략 설정 */
.strategy-config {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.strategy-config h3 {
  margin-bottom: 16px;
  color: #333;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.config-item {
  display: flex;
  flex-direction: column;
}

.config-item label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #333;
}

.config-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.config-help {
  margin-top: 4px;
  font-size: 12px;
  color: #666;
}

/* 종목 섹션 */
.recommend-btn {
  padding: 8px 16px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.recommend-btn:hover {
  background: #1565c0;
}

.loading-stocks {
  text-align: center;
  padding: 40px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.stocks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stock-card {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.stock-card:hover {
  border-color: #1976d2;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.stock-card.selected {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.05);
}

.stock-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stock-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.stock-code {
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.stock-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.current-price {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.price-change {
  font-size: 14px;
  font-weight: 500;
}

.price-change.up {
  color: #f44336;
}

.price-change.down {
  color: #2196f3;
}

.ai-reason {
  color: #666;
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 12px;
}

.stock-checkbox {
  position: absolute;
  top: 12px;
  right: 12px;
}

.stock-checkbox input {
  width: 16px;
  height: 16px;
}

/* 종목 추가 */
.add-stock {
  border-top: 1px solid #eee;
  padding-top: 20px;
  margin-top: 20px;
}

.add-stock h3 {
  margin-bottom: 16px;
  color: #333;
}

.search-stock {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.search-btn {
  padding: 10px 20px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.search-results {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.search-result {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: background 0.2s;
}

.search-result:hover {
  background: #f5f5f5;
}

.search-result:last-child {
  border-bottom: none;
}

/* 제어 섹션 */
.trading-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-dot.stopped {
  background: #9e9e9e;
}

.status-dot.running {
  background: #4caf50;
  animation: pulse 2s infinite;
}

.status-dot.paused {
  background: #ff9800;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.status-text {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.control-group {
  display: flex;
  flex-direction: column;
}

.control-group label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #333;
}

.control-input, .control-select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.control-group small {
  margin-top: 4px;
  font-size: 12px;
  color: #666;
}

.control-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.control-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
}

.start-btn {
  background: #4caf50;
  color: white;
}

.start-btn:hover:not(:disabled) {
  background: #45a049;
}

.stop-btn {
  background: #f44336;
  color: white;
}

.stop-btn:hover:not(:disabled) {
  background: #d32f2f;
}

.pause-btn {
  background: #ff9800;
  color: white;
}

.pause-btn:hover:not(:disabled) {
  background: #f57c00;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 포지션 섹션 */
.empty-positions {
  text-align: center;
  padding: 40px;
  color: #666;
}

.positions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.position-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
}

.position-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.position-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.position-code {
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.position-details {
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 14px;
}

.detail-row span:first-child {
  color: #666;
}

.detail-row span:last-child {
  font-weight: 500;
  color: #333;
}

.pnl.profit {
  color: #f44336;
}

.pnl.loss {
  color: #2196f3;
}

.sell-btn {
  width: 100%;
  padding: 8px 16px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.sell-btn:hover {
  background: #d32f2f;
}

/* 거래 기록 */
.period-select {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
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
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.history-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.trade-type.buy {
  color: #f44336;
  font-weight: 500;
}

.trade-type.sell {
  color: #2196f3;
  font-weight: 500;
}

.trade-status.pending {
  color: #ff9800;
}

.trade-status.executed {
  color: #4caf50;
}

.trade-status.cancelled,
.trade-status.failed {
  color: #9e9e9e;
}

/* 해외투자 준비중 */
.coming-soon {
  text-align: center;
  padding: 80px 20px;
}

.coming-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.coming-soon h2 {
  font-size: 24px;
  margin-bottom: 16px;
  color: #333;
}

.coming-soon p {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
}

/* 반응형 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .account-summary {
    justify-content: space-between;
  }
  
  .strategy-cards {
    grid-template-columns: 1fr;
  }
  
  .stocks-grid {
    grid-template-columns: 1fr;
  }
  
  .control-grid {
    grid-template-columns: 1fr;
  }
  
  .control-buttons {
    flex-direction: column;
  }
  
  .positions-grid {
    grid-template-columns: 1fr;
  }
  
  .search-stock {
    flex-direction: column;
  }
  
  .container {
    padding: 0 16px;
  }
}
</style>