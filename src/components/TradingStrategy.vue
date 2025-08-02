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
                <div class="market-label">상승장</div>
                <div class="market-desc">적극적 매수 전략</div>
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
                <div class="market-label">하락장</div>
                <div class="market-desc">보수적 매수 전략</div>
              </div>
            </label>
          </div>
        </div>

        <!-- 최적 전략 표시 -->
        <div v-if="bestStrategy" class="best-strategy">
          <div class="strategy-header">
            <span class="strategy-badge">추천 전략</span>
            <span class="strategy-performance">
              예상 수익률: {{ bestStrategy.expectedReturn }}%
            </span>
          </div>
          <div class="strategy-info">
            <p><strong>{{ bestStrategy.stockName }}</strong> ({{ bestStrategy.stockCode }})</p>
            <p>추천 비율: {{ bestStrategy.allocation }}%</p>
            <p>위험 수준: {{ getRiskLevelText(bestStrategy.riskLevel) }}</p>
          </div>
          <button 
            @click="applyBestStrategy"
            class="btn btn-sm btn-outline"
          >
            이 전략 적용
          </button>
        </div>

        <!-- 종목 및 비율 설정 -->
        <div class="form-group">
          <label class="form-label">종목 코드</label>
          <input 
            type="text" 
            v-model="strategy.stockCode"
            placeholder="예: 005930 (삼성전자)"
            class="form-input"
            @input="validateStockCode"
          >
          <div v-if="stockCodeError" class="form-error">
            {{ stockCodeError }}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">투자 비율 (%)</label>
          <div class="allocation-input">
            <input 
              type="range" 
              v-model="strategy.allocation"
              min="1"
              max="100"
              class="allocation-slider"
            >
            <input 
              type="number" 
              v-model="strategy.allocation"
              min="1"
              max="100"
              class="allocation-number"
            >
            <span class="allocation-unit">%</span>
          </div>
          <div class="allocation-display">
            현재 설정: {{ strategy.allocation }}%
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
        stockCode: '',
        allocation: 30
      },
      stockCodeError: null
    }
  },
  computed: {
    ...mapGetters('trading', ['bestStrategy', 'isTrading', 'isLoading', 'currentStrategy']),
    
    loading() {
      return this.isLoading
    },
    
    isValidStrategy() {
      return this.strategy.marketType && 
             this.strategy.stockCode && 
             this.strategy.allocation > 0 && 
             this.strategy.allocation <= 100 &&
             !this.stockCodeError
    }
  },
  async created() {
    await this.loadBestStrategy()
    await this.loadTradingStatus()
    
    // 현재 활성 전략이 있으면 폼에 로드
    if (this.currentStrategy) {
      this.strategy = {
        marketType: this.currentStrategy.marketType,
        stockCode: this.currentStrategy.stockCode,
        allocation: this.currentStrategy.allocation
      }
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
    
    applyBestStrategy() {
      if (this.bestStrategy) {
        this.strategy = {
          marketType: this.bestStrategy.marketType,
          stockCode: this.bestStrategy.stockCode,
          allocation: this.bestStrategy.allocation
        }
        this.stockCodeError = null
      }
    },
    
    validateStockCode() {
      const code = this.strategy.stockCode.trim()
      
      if (!code) {
        this.stockCodeError = null
        return
      }
      
      // 한국 주식 코드 형식 검증 (6자리 숫자)
      const stockCodePattern = /^\d{6}$/
      
      if (!stockCodePattern.test(code)) {
        this.stockCodeError = '올바른 종목 코드를 입력해주세요 (6자리 숫자)'
      } else {
        this.stockCodeError = null
      }
    },
    
    async startTrading() {
      try {
        // 전략 생성
        const success = await this.createStrategy(this.strategy)
        
        if (success) {
          // 생성된 전략으로 자동매매 시작
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
    },
    
    getRiskLevelText(level) {
      const levels = {
        'Low': '낮음',
        'Medium': '보통',
        'High': '높음'
      }
      return levels[level] || level
    }
  }
}
</script>

<style scoped>
.strategy-form {
  max-width: 800px;
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

.market-icon {
  font-size: 2rem;
  margin-bottom: var(--spacing-sm);
}

.market-label {
  font-weight: var(--font-medium);
  font-size: var(--font-lg);
  margin-bottom: var(--spacing-xs);
  color: var(--text-primary);
}

.market-desc {
  font-size: var(--font-sm);
  color: var(--text-secondary);
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

.strategy-info {
  margin-bottom: var(--spacing-md);
}

.strategy-info p {
  margin: var(--spacing-xs) 0;
  color: var(--text-primary);
}

.allocation-input {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-sm);
}

.allocation-slider {
  flex: 1;
  height: 6px;
  background: var(--border-light);
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;         /* 표준 */

}

.allocation-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
}

.allocation-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.allocation-number {
  width: 80px;
  text-align: center;
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-xs);
}

.allocation-unit {
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.allocation-display {
  margin-top: var(--spacing-sm);
  font-size: var(--font-sm);
  color: var(--text-secondary);
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
  .market-options {
    grid-template-columns: 1fr;
  }
  
  .strategy-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .allocation-input {
    flex-direction: column;
    align-items: stretch;
  }
  
  .allocation-number {
    width: 100%;
  }
  
  .strategy-actions {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .action-buttons .btn {
    flex: 1;
  }
}
</style>