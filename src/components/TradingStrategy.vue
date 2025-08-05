<template>
  <div class="strategy-form">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">자동매매 전략 설정</h2>
      </div>
      
      <div class="card-body">
        <!-- 시장 상태 선택 -->
        <div class="form-group">
          <label class="form-label">시장 상태 선택</label>
          <div class="market-options">
            <label class="market-option">
              <input 
                type="radio" 
                v-model="strategy.marketType" 
                value="bull"
                class="market-radio"
              >
              <div class="market-card bull">
                <div class="market-icon">📈</div>
                <div class="market-label">상승장 전략</div>
                <div class="market-desc">모멘텀 + 성장주 중심</div>
              </div>
            </label>
            
            <label class="market-option">
              <input 
                type="radio" 
                v-model="strategy.marketType" 
                value="bear"
                class="market-radio"
              >
              <div class="market-card bear">
                <div class="market-icon">📉</div>
                <div class="market-label">하락장 전략</div>
                <div class="market-desc">가치주 + 배당주 중심</div>
              </div>
            </label>
          </div>
        </div>

        <!-- 투자 지역 선택 -->
        <div class="form-group">
          <label class="form-label">투자 지역</label>
          <div class="region-options">
            <label class="region-option">
              <input 
                type="radio" 
                v-model="strategy.region" 
                value="domestic"
                class="region-radio"
              >
              <div class="region-card">
                <span class="region-flag">🇰🇷</span>
                <span class="region-text">국내 투자</span>
              </div>
            </label>
            
            <label class="region-option">
              <input 
                type="radio" 
                v-model="strategy.region" 
                value="global"
                class="region-radio"
              >
              <div class="region-card">
                <span class="region-flag">🌍</span>
                <span class="region-text">해외 투자</span>
              </div>
            </label>
          </div>
        </div>

        <!-- 추천 전략 표시 -->
        <div v-if="bestStrategy" class="best-strategy">
          <div class="strategy-header">
            <span class="strategy-badge">AI 추천 전략</span>
            <span class="strategy-performance">
              예상 수익률: {{ bestStrategy.expectedReturn }}%
            </span>
          </div>
          <div class="strategy-info">
            <p><strong>{{ bestStrategy.name }}</strong></p>
            <p>{{ bestStrategy.description }}</p>
            <div class="recommended-stocks">
              <h4>추천 종목 구성</h4>
              <div class="stock-chips">
                <span 
                  v-for="stock in bestStrategy.stocks" 
                  :key="stock.code"
                  class="stock-chip"
                >
                  {{ stock.name }} ({{ stock.allocation }}%)
                </span>
              </div>
            </div>
          </div>
          <button 
            @click="applyBestStrategy"
            class="btn btn-sm btn-outline"
          >
            이 전략 적용
          </button>
        </div>

        <!-- 종목 구성 설정 -->
        <div class="form-group">
          <label class="form-label">종목 구성</label>
          <div class="stocks-container">
            <div 
              v-for="(stock, index) in strategy.stocks" 
              :key="index"
              class="stock-item"
            >
              <div class="stock-inputs">
                <input 
                  type="text" 
                  v-model="stock.code"
                  :placeholder="strategy.region === 'domestic' ? '종목코드 (예: 005930)' : '티커 (예: AAPL)'"
                  class="form-input stock-code"
                  @blur="validateStockCode(index)"
                >
                <input 
                  type="text" 
                  v-model="stock.name"
                  placeholder="종목명"
                  class="form-input stock-name"
                  readonly
                >
                <div class="allocation-input-group">
                  <input 
                    type="number" 
                    v-model="stock.allocation"
                    min="1"
                    max="100"
                    placeholder="비율"
                    class="form-input allocation-input"
                    @input="updateTotalAllocation"
                  >
                  <span class="allocation-unit">%</span>
                </div>
                <button 
                  v-if="strategy.stocks.length > 1"
                  @click="removeStock(index)"
                  class="btn-remove"
                  type="button"
                >
                  ×
                </button>
              </div>
              <div v-if="stock.error" class="form-error">
                {{ stock.error }}
              </div>
            </div>
            
            <button 
              @click="addStock"
              class="btn btn-outline btn-sm add-stock-btn"
              type="button"
            >
              + 종목 추가
            </button>
            
            <div class="allocation-summary">
              <span class="total-allocation" :class="{ 'invalid': totalAllocation !== 100 }">
                총 투자 비율: {{ totalAllocation }}%
              </span>
              <span v-if="totalAllocation !== 100" class="allocation-warning">
                (총 100%가 되어야 합니다)
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card-footer">
        <div class="strategy-actions">
          <div class="trading-status">
            <span v-if="isTrading" class="status-indicator active">
              <span class="status-dot"></span>
              자동매매 실행 중
            </span>
            <span v-else class="status-indicator inactive">
              <span class="status-dot"></span>
              자동매매 대기 중
            </span>
          </div>
          
          <div class="action-buttons">
            <button 
              v-if="!isTrading"
              @click="startTrading"
              :disabled="!isValidStrategy || loading"
              class="btn btn-success"
            >
              <span v-if="loading" class="loading-spinner"></span>
              자동매매 시작
            </button>
            
            <button 
              v-if="isTrading"
              @click="stopTrading"
              :disabled="loading"
              class="btn btn-danger"
            >
              <span v-if="loading" class="loading-spinner"></span>
              자동매매 종료
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'TradingStrategy',
  data() {
    return {
      strategy: {
        marketType: 'bull',
        region: 'domestic',
        stocks: [
          { code: '', name: '', allocation: 100, error: null }
        ]
      },
      totalAllocation: 100
    }
  },
  computed: {
    ...mapGetters('trading', ['bestStrategy', 'isTrading', 'isLoading', 'currentStrategy']),
    
    loading() {
      return this.isLoading
    },
    
    isValidStrategy() {
      return this.strategy.marketType && 
             this.strategy.region &&
             this.strategy.stocks.every(stock => stock.code && stock.allocation > 0) &&
             this.totalAllocation === 100 &&
             !this.strategy.stocks.some(stock => stock.error)
    }
  },
  async created() {
    await this.loadBestStrategy()
    await this.loadTradingStatus()
    
    // 현재 활성 전략이 있으면 폼에 로드
    if (this.currentStrategy) {
      this.loadCurrentStrategy()
    }
  },
  methods: {
    ...mapActions('trading', [
      'loadBestStrategy', 
      'loadTradingStatus', 
      'createStrategy',
      'startTrading as startTradingAction',
      'stopTrading as stopTradingAction'
    ]),
    
    loadCurrentStrategy() {
      if (this.currentStrategy) {
        this.strategy = {
          marketType: this.currentStrategy.marketType,
          region: this.currentStrategy.region,
          stocks: this.currentStrategy.stocks || [{ code: '', name: '', allocation: 100, error: null }]
        }
        this.updateTotalAllocation()
      }
    },
    
    applyBestStrategy() {
      if (this.bestStrategy) {
        this.strategy = {
          marketType: this.bestStrategy.marketType,
          region: this.bestStrategy.region,
          stocks: this.bestStrategy.stocks.map(stock => ({
            code: stock.code,
            name: stock.name,
            allocation: stock.allocation,
            error: null
          }))
        }
        this.updateTotalAllocation()
      }
    },
    
    addStock() {
      if (this.strategy.stocks.length < 10) { // 최대 10개 종목
        this.strategy.stocks.push({ 
          code: '', 
          name: '', 
          allocation: 0, 
          error: null 
        })
      }
    },
    
    removeStock(index) {
      this.strategy.stocks.splice(index, 1)
      this.updateTotalAllocation()
    },
    
    updateTotalAllocation() {
      this.totalAllocation = this.strategy.stocks.reduce((sum, stock) => {
        return sum + (parseInt(stock.allocation) || 0)
      }, 0)
    },
    
    async validateStockCode(index) {
      const stock = this.strategy.stocks[index]
      if (!stock.code) {
        stock.error = null
        stock.name = ''
        return
      }
      
      try {
        // 종목 코드 유효성 검사 및 종목명 조회
        if (this.strategy.region === 'domestic') {
          // 국내 주식 코드 검증 (6자리 숫자)
          if (!/^\d{6}$/.test(stock.code)) {
            stock.error = '올바른 종목 코드를 입력해주세요 (6자리 숫자)'
            stock.name = ''
            return
          }
          
          // 실제로는 API를 호출하여 종목명을 조회해야 함
          const stockNames = {
            '005930': '삼성전자',
            '000660': 'SK하이닉스',  
            '035420': 'NAVER',
            '051910': 'LG화학',
            '006400': '삼성SDI',
            '035720': '카카오',
            '207940': '삼성바이오로직스',
            '373220': 'LG에너지솔루션',
            '000270': '기아',
            '068270': '셀트리온'
          }
          
          stock.name = stockNames[stock.code] || '알 수 없는 종목'
          stock.error = null
        } else {
          // 해외 주식 티커 검증
          if (!/^[A-Z]{1,5}$/.test(stock.code.toUpperCase())) {
            stock.error = '올바른 티커를 입력해주세요'
            stock.name = ''
            return
          }
          
          // 해외 주식 예시
          const globalStockNames = {
            'AAPL': 'Apple Inc.',
            'MSFT': 'Microsoft Corp.',
            'GOOGL': 'Alphabet Inc.',
            'AMZN': 'Amazon.com Inc.',
            'TSLA': 'Tesla Inc.',
            'META': 'Meta Platforms Inc.',
            'NVDA': 'NVIDIA Corp.',
            'NFLX': 'Netflix Inc.'
          }
          
          stock.code = stock.code.toUpperCase()
          stock.name = globalStockNames[stock.code] || '알 수 없는 종목'
          stock.error = null
        }
      } catch (error) {
        stock.error = '종목 정보를 가져올 수 없습니다'
        stock.name = ''
      }
    },
    
    async startTrading() {
      try {
        const success = await this.createStrategy(this.strategy)
        
        if (success) {
          const latestStrategy = this.currentStrategy
          if (latestStrategy) {
            await this.startTradingAction(latestStrategy.id)
          }
        }
      } catch (error) {
        console.error('자동매매 시작 오류:', error)
      }
    },
    
    async stopTrading() {
      try {
        await this.stopTradingAction()
      } catch (error) {
        console.error('자동매매 중단 오류:', error)
      }
    }
  }
}
</script>

<style scoped>
.strategy-form {
  max-width: 900px;
  margin: 0 auto;
}

.market-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  margin-top: var(--spacing-sm);
}

.market-option {
  cursor: pointer;
}

.market-radio {
  display: none;
}

.market-card {
  padding: var(--spacing-lg);
  border: 2px solid var(--border-light);
  border-radius: var(--border-radius-lg);
  text-align: center;
  transition: all var(--transition-fast);
  background-color: var(--white);
}

.market-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-sm);
}

.market-radio:checked + .market-card {
  border-color: var(--primary-color);
  background-color: rgba(25, 118, 210, 0.05);
}

.market-card.bull:hover,
.market-radio:checked + .market-card.bull {
  border-color: var(--success-color);
  background-color: rgba(76, 175, 80, 0.05);
}

.market-card.bear:hover,
.market-radio:checked + .market-card.bear {
  border-color: var(--error-color);
  background-color: rgba(244, 67, 54, 0.05);
}

.region-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  margin-top: var(--spacing-sm);
}

.region-option {
  cursor: pointer;
}

.region-radio {
  display: none;
}

.region-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 2px solid var(--border-light);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast);
  background-color: var(--white);
}

.region-card:hover {
  border-color: var(--primary-color);
}

.region-radio:checked + .region-card {
  border-color: var(--primary-color);
  background-color: rgba(25, 118, 210, 0.05);
}

.region-flag {
  font-size: 1.2rem;
}

.best-strategy {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(25, 118, 210, 0.05));
  border: 1px solid rgba(25, 118, 210, 0.2);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  margin: var(--spacing-lg) 0;
}

.strategy-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.strategy-badge {
  background-color: var(--primary-color);
  color: var(--white);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-xl);
  font-size: var(--font-xs);
  font-weight: var(--font-medium);
  text-transform: uppercase;
}

.strategy-performance {
  font-weight: var(--font-medium);
  color: var(--success-color);
}

.recommended-stocks {
  margin-top: var(--spacing-md);
}

.recommended-stocks h4 {
  font-size: var(--font-sm);
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

.stock-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.stock-chip {
  background-color: rgba(25, 118, 210, 0.1);
  color: var(--primary-color);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-xs);
  font-weight: var(--font-medium);
}

.stocks-container {
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
}

.stock-item {
  margin-bottom: var(--spacing-md);
}

.stock-inputs {
  display: grid;
  grid-template-columns: 1fr 1.5fr 100px 40px;
  gap: var(--spacing-sm);
  align-items: center;
}

.allocation-input-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.allocation-input {
  width: 60px;
  text-align: center;
}

.allocation-unit {
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.btn-remove {
  background: var(--error-color);
  color: var(--white);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: var(--font-lg);
  line-height: 1;
}

.add-stock-btn {
  width: 100%;
  margin-bottom: var(--spacing-md);
}

.allocation-summary {
  text-align: center;
  padding: var(--spacing-sm);
  background-color: var(--white);
  border-radius: var(--border-radius-sm);
}

.total-allocation {
  font-weight: var(--font-medium);
  color: var(--success-color);
}

.total-allocation.invalid {
  color: var(--error-color);
}

.allocation-warning {
  font-size: var(--font-sm);
  color: var(--error-color);
  margin-left: var(--spacing-sm);
}

.strategy-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.trading-status {
  display: flex;
  align-items: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-medium);
  font-size: var(--font-sm);
}

.status-indicator.active {
  color: var(--success-color);
}

.status-indicator.inactive {
  color: var(--gray);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.action-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .market-options,
  .region-options {
    grid-template-columns: 1fr;
  }
  
  .strategy-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .stock-inputs {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
  
  .strategy-actions {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }
  
  .action-buttons {
    justify-content: center;
  }
}
</style>