<template>
  <div class="strategy-form">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">자동매매 전략 설정</h2>
      </div>
      
      <div class="card-body">
        <!-- 시장 상태 선택 - 향상된 버전 -->
        <div class="form-group">
          <label class="form-label">시장 상태 및 전략 선택</label>
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
                <div class="market-label">상승장 모멘텀 전략</div>
                <div class="market-desc">
                  <strong>기술적 분석 기반 매매:</strong><br>
                  • RSI, MACD, 이동평균선 분석<br>
                  • 골든크로스 시 매수 신호<br>
                  • 모멘텀 지속성 확인 후 진입<br>
                  • 과매수 구간에서 일부 매도
                </div>
                <div class="strategy-indicators">
                  <span class="indicator">RSI 30-70</span>
                  <span class="indicator">MACD↗</span>
                  <span class="indicator">MA정배열</span>
                </div>
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
                <div class="market-label">하락장 가치투자 전략</div>
                <div class="market-desc">
                  <strong>역추세 매매 및 손절관리:</strong><br>
                  • RSI 과매도 구간 매수<br>
                  • 볼린저밴드 하단 터치시 진입<br>
                  • 장기 이평선 이탈시 손절<br>
                  • 분할 매수로 리스크 분산
                </div>
                <div class="strategy-indicators">
                  <span class="indicator">RSI &lt;30</span>
                  <span class="indicator">볼린저하단</span>
                  <span class="indicator">가치매수</span>
                </div>
              </div>
            </label>
          </div>
          
          <!-- 선택된 전략의 상세 설명 -->
          <div v-if="strategy.marketType" class="strategy-details">
            <div class="strategy-detail-card">
              <h4 class="detail-title">
                {{ strategy.marketType === 'bull' ? '상승장 모멘텀 전략' : '하락장 가치투자 전략' }} 상세 정보
              </h4>
              
              <div v-if="strategy.marketType === 'bull'" class="strategy-explanation">
                <div class="explanation-section">
                  <h5>📊 사용하는 기술적 지표</h5>
                  <ul>
                    <li><strong>RSI (14일):</strong> 30-70 구간에서 매수, 80 이상시 매도</li>
                    <li><strong>이동평균선:</strong> 5일선 &gt; 20일선 정배열시 매수 신호</li>
                    <li><strong>MACD:</strong> 골든크로스 형성시 매수 진입</li>
                    <li><strong>모멘텀:</strong> 10일간 +5% 이상시 추가 매수</li>
                  </ul>
                </div>
                
                <div class="explanation-section">
                  <h5>⚡ 매매 실행 로직</h5>
                  <ul>
                    <li>신호 강도 40점 이상시 매수 실행</li>
                    <li>신호 강도에 따라 투자 비중 조절 (최대 120%)</li>
                    <li>30분 간격으로 중복 주문 방지</li>
                    <li>과매수 신호시 보유량의 30-80% 매도</li>
                  </ul>
                </div>
              </div>
              
              <div v-else class="strategy-explanation">
                <div class="explanation-section">
                  <h5>📊 사용하는 기술적 지표</h5>
                  <ul>
                    <li><strong>RSI (14일):</strong> 30 미만 과매도시 매수, 70 이상시 매도</li>
                    <li><strong>볼린저밴드:</strong> 하단 터치시 매수, 상단 도달시 매도</li>
                    <li><strong>50일 이동평균:</strong> 10% 이상 하락시 가치매수</li>
                    <li><strong>장기 모멘텀:</strong> 20일간 -15% 이상 하락시 진입</li>
                  </ul>
                </div>
                
                <div class="explanation-section">
                  <h5>🛡️ 리스크 관리 로직</h5>
                  <ul>
                    <li>분할 매수로 평균 단가 낮추기</li>
                    <li>극심한 하락(-25%)시 손절매 실행</li>
                    <li>과매수 구간에서 점진적 매도</li>
                    <li>포트폴리오 리밸런싱 자동 제안</li>
                  </ul>
                </div>
              </div>
              
              <div class="strategy-warning">
                <div class="warning-icon">⚠️</div>
                <div class="warning-text">
                  <strong>주의사항:</strong> 모든 기술적 분석은 과거 데이터를 기반으로 하며, 
                  미래 수익을 보장하지 않습니다. 투자에 따른 손실의 책임은 투자자 본인에게 있습니다.
                </div>
              </div>
            </div>
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

        <!-- 시장 상태 정보 표시 -->
        <div class="form-group">
          <label class="form-label">
            현재 시장 상태 
            <span class="api-source">(한국투자증권 API 실시간)</span>
          </label>
          <div class="market-status-info">
            <div v-if="marketStatusLoading" class="market-status-loading">
              <div class="loading-spinner"></div>
              <span>KIS API로 시장 상태 확인 중...</span>
            </div>
            <div v-else-if="marketStatus" class="market-status-display">
              <div class="market-status-item" :class="{ 'market-open': marketStatus.isOpen, 'market-closed': !marketStatus.isOpen }">
                <div class="status-indicator">
                  <span class="status-dot" :class="{ 'open': marketStatus.isOpen, 'closed': !marketStatus.isOpen }"></span>
                  <span class="status-text">{{ marketStatus.statusText }}</span>
                </div>
                <div class="market-details">
                  <small class="api-info">
                    {{ marketStatus.source === 'KIS_API' ? '🟢 실시간 API 데이터' : 
                       marketStatus.source === 'FALLBACK_TIME' ? '🟡 시간 기반 추정' : '🔴 API 오류' }}
                  </small>
                  <small class="check-time">
                    마지막 확인: {{ formatDateTime(marketStatus.checkedAt) }}
                  </small>
                  <small v-if="marketStatus.error" class="error-info">
                    오류: {{ marketStatus.error }}
                  </small>
                </div>
              </div>
              <div class="status-actions">
                <button @click="refreshMarketStatus" class="btn btn-sm btn-outline refresh-btn">
                  🔄 즉시 새로고침
                </button>
                <small class="auto-refresh-info">2분마다 자동 새로고침</small>
              </div>
            </div>
            <div v-else class="market-status-error">
              <span>❌ 시장 상태를 확인할 수 없습니다.</span>
              <button @click="loadMarketStatus" class="btn btn-sm btn-outline">다시 시도</button>
            </div>
            
            <!-- 시장 마감 시 강화된 경고 메시지 -->
            <div v-if="marketStatus && !marketStatus.isOpen" class="market-warning enhanced">
              <div class="warning-icon">🚫</div>
              <div class="warning-content">
                <strong>자동매매 시작 불가</strong>
                <p>{{ marketStatus.message }}</p>
                <p class="warning-notice">
                  한국투자증권 API에서 시장이 마감되었음을 확인했습니다. 
                  시장이 열려있을 때만 자동매매를 시작할 수 있습니다.
                </p>
              </div>
            </div>
            
            <!-- 시장 개장 시 확인 메시지 -->
            <div v-if="marketStatus && marketStatus.isOpen" class="market-success">
              <div class="success-icon">✅</div>
              <div class="success-content">
                <strong>자동매매 시작 가능</strong>
                <p>{{ marketStatus.message }}</p>
                <p class="success-notice">
                  실시간 API 확인 결과 시장이 열려있어 자동매매를 시작할 수 있습니다.
                </p>
              </div>
            </div>
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
              :disabled="!isValidStrategy || loading || (marketStatus && !marketStatus.isOpen)"
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
      balanceLoading: false,
      marketStatus: null,
      marketStatusLoading: false,
      marketStatusTimer: null
    }
  },
  computed: {
    ...mapGetters('trading', ['isTrading', 'currentStrategy', 'isLoading']),
    
    loading() {
      return this.isLoading
    },
    
    debugTradingState() {
      const state = {
        isTrading: this.isTrading,
        currentStrategy: this.currentStrategy,
        isLoading: this.isLoading
      };
      console.log('🔍 현재 트레이딩 상태:', state);
      return state;
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
    await this.loadMarketStatus()
    
    // 현재 활성 전략이 있으면 폼에 로드
    if (this.currentStrategy) {
      this.loadCurrentStrategy()
    }
  },
  mounted() {
    // 2분마다 시장 상태 자동 새로고침
    this.startMarketStatusAutoRefresh();
  },
  beforeUnmount() {
    this.stopMarketStatusAutoRefresh();
  },
  methods: {
    ...mapActions('trading', [
      'loadTradingStatus', 
      'createStrategy',
      'startTrading',
      'stopTrading'
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

    async onRegionChange() {
      // 지역 변경시 잔고 다시 조회 및 종목 정보 초기화
      this.loadAccountBalance()
      this.strategy.stocks.forEach(stock => {
        stock.name = ''
        stock.error = null
        stock.price = null
      })
      
      // 타이머 재시작
      this.stopMarketStatusAutoRefresh();
      await this.loadMarketStatus();
      this.startMarketStatusAutoRefresh();
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

    async loadMarketStatus() {
      if (!this.strategy.region) return;
      
      this.marketStatusLoading = true;
      try {
        const response = await apiClient.get('/trading/market-status', {
          params: { region: this.strategy.region }
        });
        
        if (response.data.success) {
          this.marketStatus = response.data.data;
          console.log('📊 시장 상태 로드 완료:', this.marketStatus);
        }
      } catch (error) {
        console.error('❌ 시장 상태 로드 실패:', error);
        this.marketStatus = null;
      } finally {
        this.marketStatusLoading = false;
      }
    },

    async refreshMarketStatus() {
      await this.loadMarketStatus();
      if (this.$toast) {
        this.$toast.success('시장 상태가 업데이트되었습니다.');
      }
    },

    startMarketStatusAutoRefresh() {
      console.log('🔄 시장 상태 자동 새로고침 시작 (2분 간격)');
      
      this.marketStatusTimer = setInterval(async () => {
        if (this.strategy.region) {
          console.log('🕐 시장 상태 자동 새로고침...');
          await this.loadMarketStatus();
        }
      }, 2 * 60 * 1000); // 2분마다
    },

    stopMarketStatusAutoRefresh() {
      if (this.marketStatusTimer) {
        console.log('⏹️ 시장 상태 자동 새로고침 중단');
        clearInterval(this.marketStatusTimer);
        this.marketStatusTimer = null;
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

    async handleStartTrading() {
      try {
        console.log('🔍 자동매매 시작 프로세스 시작');
        
        // 1️⃣ 시장 상태 먼저 재확인
        console.log('🕐 시장 상태 재확인 중...');
        await this.loadMarketStatus();
        
        if (this.marketStatus && !this.marketStatus.isOpen) {
          console.log('❌ 시장 마감으로 인한 자동매매 시작 불가');
          
          if (this.$toast) {
            this.$toast.error(`${this.marketStatus.statusText}\n시장이 열려있을 때 다시 시도해주세요.`);
          }
          return;
        }
        
        // 2️⃣ 전략 데이터 검증
        console.log('📊 전략 데이터 검증 중...');
        const strategyData = {
          marketType: this.strategy.marketType,
          region: this.strategy.region,
          stocks: this.strategy.stocks.map(stock => ({
            code: stock.code,
            name: stock.name || stock.code,
            allocation: parseInt(stock.allocation) || 0
          }))
        };
        
        console.log('📤 전략 생성용 데이터:', JSON.stringify(strategyData, null, 2));
        
        // 3️⃣ 투자 비율 검증
        const totalAlloc = strategyData.stocks.reduce((sum, stock) => sum + stock.allocation, 0);
        console.log('🔢 계산된 총 투자 비율:', totalAlloc);
        
        if (totalAlloc !== 100) {
          console.error('❌ 투자 비율 오류:', totalAlloc);
          if (this.$toast) {
            this.$toast.error(`총 투자 비율이 100%가 되어야 합니다. (현재: ${totalAlloc}%)`);
          }
          return;
        }
        
        // 4️⃣ 전략 생성
        console.log('✍️ 전략 생성 중...');
        const createSuccess = await this.createStrategy(strategyData);
        
        if (!createSuccess) {
          console.error('❌ 전략 생성 실패');
          if (this.$toast) {
            this.$toast.error('전략 생성에 실패했습니다.');
          }
          return;
        }
        
        console.log('✅ 전략 생성 성공');
        
        // 5️⃣ 잠시 기다려서 currentStrategy가 업데이트되도록 함
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 6️⃣ 현재 전략 확인
        const latestStrategy = this.currentStrategy;
        console.log('📊 생성된 전략 확인:', latestStrategy);
        
        if (!latestStrategy || !latestStrategy.id) {
          console.error('❌ 생성된 전략을 찾을 수 없음');
          
          // 수동으로 전략 상태 다시 로드 시도
          await this.loadTradingStatus();
          const retryStrategy = this.currentStrategy;
          
          if (!retryStrategy || !retryStrategy.id) {
            if (this.$toast) {
              this.$toast.error('전략 생성은 성공했지만 전략 정보를 찾을 수 없습니다.');
            }
            return;
          }
          
          console.log('✅ 재시도로 전략 발견:', retryStrategy);
        }
        
        const finalStrategy = latestStrategy || this.currentStrategy;
        
        // 7️⃣ 자동매매 시작
        console.log('🚀 자동매매 시작 중... strategyId:', finalStrategy.id, '타입:', typeof finalStrategy.id);
        
        const startSuccess = await this.startTrading(finalStrategy.id);
        
        if (startSuccess) {
          console.log('✅ 자동매매 시작 성공!');
          
          // 8️⃣ 상태 강제 새로고침
          await this.loadTradingStatus();
          await this.loadMarketStatus();
          
          if (this.$toast) {
            this.$toast.success('🟢 시장이 열려있어 자동매매가 시작되었습니다!');
          }
        } else {
          console.error('❌ 자동매매 시작 실패 - startTrading 메서드에서 false 반환');
          
          // 시장 상태 재확인
          await this.loadMarketStatus();
          
          if (this.$toast) {
            this.$toast.error('자동매매 시작이 거부되었습니다. 시장 상태를 확인해주세요.');
          }
        }
        
      } catch (error) {
        console.error('❌ handleStartTrading 전체 오류:', error);
        console.error('❌ 오류 스택:', error.stack);
        
        if (error.response && error.response.data && error.response.data.message) {
          // 서버에서 온 구체적인 오류 메시지 표시
          console.error('서버 오류 메시지:', error.response.data.message);
          console.error('서버 오류 전체:', error.response.data);
          
          if (this.$toast) {
            this.$toast.error(error.response.data.message);
          }
          
          // 시장 상태 관련 오류면 상태 새로고침
          if (error.response.data.reason === 'MARKET_CLOSED') {
            await this.loadMarketStatus();
          }
        } else {
          if (this.$toast) {
            this.$toast.error('자동매매 시작 중 오류가 발생했습니다.');
          }
        }
      }
    },

    async handleStopTrading() {
      try {
        console.log('⏹️ 자동매매 중단 요청 시작');
        
        // 1️⃣ 즉시 UI 상태를 false로 설정 (사용자 경험 개선)
        this.$store.commit('trading/SET_IS_TRADING', false);
        
        // 2️⃣ 자동매매 중단 API 호출
        const success = await this.stopTrading();
        
        if (success) {
          console.log('✅ 자동매매 중단 API 성공');
          
          // 3️⃣ 서버 상태 동기화를 위한 충분한 지연
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // 4️⃣ 상태 새로고침
          await this.loadTradingStatus();
          
          // 5️⃣ 혹시 모를 상황을 대비한 추가 체크
          const finalState = this.$store.getters['trading/isTrading'];
          console.log('🔍 최종 확인된 상태:', finalState);
          
          if (finalState === true) {
            console.log('⚠️ 상태가 여전히 true - 강제로 false 설정');
            this.$store.commit('trading/SET_IS_TRADING', false);
            this.$store.commit('trading/SET_CURRENT_STRATEGY', null);
          }
          
          // 6️⃣ 토스트 메시지
          if (this.$toast) {
            this.$toast.success('자동매매가 중단되었습니다.');
          }
          
          console.log('✅ 자동매매 중단 처리 완료');
        } else {
          console.error('❌ 자동매매 중단 API 실패 - 상태 복원');
          
          // API 실패시 상태 복원
          await this.loadTradingStatus();
          
          if (this.$toast) {
            this.$toast.error('자동매매 중단에 실패했습니다.');
          }
        }
      } catch (error) {
        console.error('❌ handleStopTrading 전체 오류:', error);
        
        // 오류 발생시 상태 복원
        await this.loadTradingStatus();
        
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
    },

    formatDateTime(dateString) {
      if (!dateString) return '-';
      
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        
        return date.toLocaleString('ko-KR', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        return dateString;
      }
    }
  }
}
</script> 