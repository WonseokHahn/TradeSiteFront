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
                @change="onRegionChange"
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
                @change="onRegionChange"
              >
              <div class="region-card">
                <span class="region-flag">🌍</span>
                <span class="region-text">해외 투자</span>
              </div>
            </label>
          </div>
        </div>

        <!-- 잔고 정보 표시 -->
        <div class="form-group">
          <label class="form-label">투자 가능 금액</label>
          <div class="balance-info">
            <div v-if="balanceLoading" class="balance-loading">
              <div class="loading-spinner"></div>
              <span>잔고 조회 중...</span>
            </div>
            <div v-else-if="accountBalance" class="balance-display">
              <div class="balance-item">
                <span class="balance-label">총 예수금:</span>
                <span class="balance-value">{{ formatCurrency(accountBalance.totalDeposit, strategy.region) }}</span>
              </div>
              <div class="balance-item">
                <span class="balance-label">주문 가능 금액:</span>
                <span class="balance-value available">{{ formatCurrency(accountBalance.availableAmount, strategy.region) }}</span>
              </div>
            </div>
            <div v-else class="balance-error">
              <span>잔고 정보를 불러올 수 없습니다.</span>
              <button @click="loadAccountBalance" class="btn btn-sm btn-outline">다시 시도</button>
            </div>
          </div>
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
                  :disabled="stock.validating"
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
              <div v-if="stock.validating" class="validation-loading">
                <div class="loading-spinner"></div>
                <span>종목 정보 확인 중...</span>
              </div>
              <div v-if="stock.error" class="form-error">
                {{ stock.error }}
              </div>
              <div v-if="stock.price" class="stock-price">
                현재가: {{ formatCurrency(stock.price, strategy.region) }}
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
              <span class="total-allocation" :class="{ 'over-100': totalAllocation > 100 }">
                총 투자 비율: {{ totalAllocation }}%
              </span>
              <span v-if="totalAllocation > 100" class="allocation-warning">
                (100%를 초과했습니다)
              </span>
              <span v-if="totalAllocation < 100" class="allocation-info">
                (남은 비율: {{ 100 - totalAllocation }}%)
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
              @click="handleStartTrading"
              :disabled="!isValidStrategy || loading"
              class="btn btn-success"
            >
              <span v-if="loading" class="loading-spinner"></span>
              자동매매 시작
            </button>
            
            <button 
              v-if="isTrading"
              @click="handleStopTrading"
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
import apiClient from '@/utils/api'

export default {
  name: 'TradingStrategy',
  data() {
    return {
      strategy: {
        marketType: 'bull',
        region: 'domestic',
        stocks: [
          { code: '', name: '', allocation: 50, error: null, validating: false, price: null }
        ]
      },
      totalAllocation: 50,
      accountBalance: null,
      balanceLoading: false
    }
  },
  computed: {
    ...mapGetters('trading', ['isTrading', 'isLoading', 'currentStrategy']),
    
    loading() {
      return this.isLoading
    },
    
    isValidStrategy() {
      return this.strategy.marketType && 
             this.strategy.region &&
             this.strategy.stocks.every(stock => stock.code && stock.allocation > 0) &&
             this.totalAllocation > 0 &&
             this.totalAllocation <= 100 &&
             !this.strategy.stocks.some(stock => stock.error || stock.validating)
    }
  },
  async created() {
    await this.loadTradingStatus()
    await this.loadAccountBalance()
    
    // 현재 활성 전략이 있으면 폼에 로드
    if (this.currentStrategy) {
      this.loadCurrentStrategy()
    }
  },
  // TradingStrategy.vue의 methods 섹션을 이것으로 완전히 교체하세요

  methods: {
    ...mapActions('trading', [
      'loadTradingStatus', 
      'createStrategy',
      'startTrading', // ← 이름을 맞춰줍니다 (startTradingAction이 아니라 startTrading)
      'stopTrading'   // ← 이것도 맞춰줍니다
    ]),

    loadCurrentStrategy() {
      if (this.currentStrategy) {
        this.strategy = {
          marketType: this.currentStrategy.marketType,
          region: this.currentStrategy.region,
          stocks: this.currentStrategy.stocks || [{ code: '', name: '', allocation: 50, error: null, validating: false, price: null }]
        }
        this.updateTotalAllocation()
      }
    },

    onRegionChange() {
      // 지역 변경시 잔고 다시 조회 및 종목 정보 초기화
      this.loadAccountBalance()
      this.strategy.stocks.forEach(stock => {
        stock.name = ''
        stock.error = null
        stock.price = null
      })
    },

    async loadAccountBalance() {
      this.balanceLoading = true
      try {
        const endpoint = this.strategy.region === 'domestic' 
          ? '/trading/account/balance/domestic'
          : '/trading/account/balance/global'

        const response = await apiClient.get(endpoint)
        if (response.data.success) {
          this.accountBalance = response.data.data
        }
      } catch (error) {
        console.error('잔고 조회 실패:', error)
        this.accountBalance = null
      } finally {
        this.balanceLoading = false
      }
    },

    addStock() {
      if (this.strategy.stocks.length < 10) { // 최대 10개 종목
        this.strategy.stocks.push({ 
          code: '', 
          name: '', 
          allocation: 0, 
          error: null, 
          validating: false,
          price: null
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
        stock.price = null
        return
      }

      stock.validating = true
      stock.error = null

      try {
        let endpoint, validationResponse

        if (this.strategy.region === 'domestic') {
          // 국내 주식 코드 검증 (6자리 숫자)
          if (!/^\d{6}$/.test(stock.code)) {
            stock.error = '올바른 종목 코드를 입력해주세요 (6자리 숫자)'
            stock.name = ''
            stock.price = null
            return
          }

          endpoint = '/trading/stock/info/domestic'
          validationResponse = await apiClient.get(endpoint, {
            params: { stockCode: stock.code }
          })

        } else {
          // 해외 주식 티커 검증
          if (!/^[A-Z]{1,5}$/.test(stock.code.toUpperCase())) {
            stock.error = '올바른 티커를 입력해주세요 (1-5자리 영문)'
            stock.name = ''
            stock.price = null
            return
          }

          stock.code = stock.code.toUpperCase()
          endpoint = '/trading/stock/info/global'
          validationResponse = await apiClient.get(endpoint, {
            params: { ticker: stock.code }
          })
        }

        if (validationResponse.data.success) {
          const stockInfo = validationResponse.data.data
          stock.name = stockInfo.name
          stock.price = stockInfo.price
          stock.error = null
        } else {
          stock.error = validationResponse.data.message || '종목 정보를 찾을 수 없습니다'
          stock.name = ''
          stock.price = null
        }

      } catch (error) {
        console.error('종목 검증 오류:', error)
        stock.error = '종목 정보를 가져올 수 없습니다'
        stock.name = ''
        stock.price = null
      } finally {
        stock.validating = false
      }
    },

    // TradingStrategy.vue의 handleStartTrading 메서드를 이것으로 교체하세요

    async handleStartTrading() {
      try {
        console.log('🔍 handleStartTrading 시작');
        console.log('📊 현재 strategy 상태:', JSON.stringify(this.strategy, null, 2));
        
        // 전략 생성 데이터 준비
        const strategyData = {
          marketType: this.strategy.marketType,
          region: this.strategy.region,
          stocks: this.strategy.stocks.map(stock => ({
            code: stock.code,
            name: stock.name || stock.code,
            allocation: parseInt(stock.allocation) || 0
          }))
        };
        
        console.log('📤 서버로 전송할 데이터:', JSON.stringify(strategyData, null, 2));
        
        // 전송 전 한번 더 검증
        const totalAlloc = strategyData.stocks.reduce((sum, stock) => sum + stock.allocation, 0);
        console.log('🔢 계산된 총 투자 비율:', totalAlloc);
        
        if (totalAlloc !== 100) {
          console.error('❌ 투자 비율 오류:', totalAlloc);
          if (this.$toast) {
            this.$toast.error(`총 투자 비율이 100%가 되어야 합니다. (현재: ${totalAlloc}%)`);
          }
          return;
        }
        
        // 1️⃣ 먼저 전략 생성
        const success = await this.createStrategy(strategyData)
        
        if (success) {
          console.log('✅ 전략 생성 성공');
          
          // 2️⃣ 잠시 기다려서 currentStrategy가 업데이트되도록 함
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // 3️⃣ 현재 전략 확인
          const latestStrategy = this.currentStrategy
          console.log('📊 생성된 전략:', latestStrategy);
          
          if (latestStrategy && latestStrategy.id) {
            console.log('🚀 자동매매 시작 중...', latestStrategy.id);
            
            // 4️⃣ 자동매매 시작
            const startSuccess = await this.startTrading(latestStrategy.id)
            
            if (startSuccess) {
              console.log('✅ 자동매매 시작 성공!');
              
              // 5️⃣ 상태 강제 새로고침
              await this.loadTradingStatus()
              
              if (this.$toast) {
                this.$toast.success('자동매매가 시작되었습니다!');
              }
            } else {
              console.error('❌ 자동매매 시작 실패');
            }
          } else {
            console.error('❌ 현재 전략을 찾을 수 없음:', latestStrategy);
            if (this.$toast) {
              this.$toast.error('전략을 찾을 수 없습니다.');
            }
          }
        } else {
          console.error('❌ 전략 생성 실패');
        }
      } catch (error) {
        console.error('❌ handleStartTrading 전체 오류:', error);
        if (this.$toast) {
          this.$toast.error('자동매매 시작 중 오류가 발생했습니다.');
        }
      }
    },

    // 🔥 수정된 handleStopTrading 메서드 (이름 변경!)
    async handleStopTrading() {
      try {
        const success = await this.stopTrading() // mapActions에서 가져온 stopTrading 호출
        if (success && this.$toast) {
          this.$toast.success('자동매매가 중단되었습니다.');
        }
      } catch (error) {
        console.error('자동매매 중단 오류:', error)
        if (this.$toast) {
          this.$toast.error('자동매매 중단 중 오류가 발생했습니다.');
        }
      }
    },

    formatCurrency(amount, region) {
      if (!amount) return '-'

      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
      if (isNaN(numAmount)) return '-'

      if (region === 'domestic') {
        return numAmount.toLocaleString() + '원'
      } else {
        return '$' + numAmount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
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

.balance-info {
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  margin-top: var(--spacing-sm);
}

.balance-loading,
.balance-error {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
}

.balance-display {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.balance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.balance-label {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.balance-value {
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.balance-value.available {
  color: var(--success-color);
  font-weight: var(--font-bold);
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
  grid-template-columns: 1fr 1.5fr 120px 40px;
  gap: var(--spacing-sm);
  align-items: center;
}

.allocation-input-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  min-width: 120px; /* 최소 너비 보장 */
}

.allocation-input {
  width: 85px; /* 80px → 85px로 증가 */
  text-align: center;
  font-size: var(--font-md);
  padding: var(--spacing-sm);
  min-width: 85px; /* 최소 너비도 함께 증가 */
}

.allocation-unit {
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  font-size: var(--font-md);
  min-width: 20px; /* % 기호가 잘리지 않도록 */
  flex-shrink: 0; /* 축소되지 않도록 */
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

.validation-loading {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.stock-price {
  margin-top: var(--spacing-xs);
  font-size: var(--font-sm);
  color: var(--success-color);
  font-weight: var(--font-medium);
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

.total-allocation.over-100 {
  color: var(--error-color);
}

.allocation-warning {
  font-size: var(--font-sm);
  color: var(--error-color);
  margin-left: var(--spacing-sm);
}

.allocation-info {
  font-size: var(--font-sm);
  color: var(--text-secondary);
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

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-light);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .market-options,
  .region-options {
    grid-template-columns: 1fr;
  }
  
  .balance-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
  
  .stock-inputs {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
  
  .allocation-input-group {
    justify-content: flex-start;
    width: auto;
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