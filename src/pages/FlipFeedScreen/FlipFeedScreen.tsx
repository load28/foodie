import React, { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import CardStack from '../../components/CardStack/CardStack';
import Button from '../../components/Button/Button';
import './FlipFeedScreen.scss';

interface FeedItem {
  id: number;
  title: string;
  description: string;
  rating: number;
  location: string;
  emoji?: string;
  image?: string;
  category: string;
  tags: string[];
}

const FlipFeedScreen: React.FC = () => {
  const [feedData, setFeedData] = useState<FeedItem[]>([]);
  const [likedItems, setLikedItems] = useState<FeedItem[]>([]);
  const [passedItems, setPassedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  const generateFeedData = useCallback((): FeedItem[] => {
    const restaurants = [
      { 
        title: '신선한 회가 일품인 횟집', 
        description: '오마카세 코스로 먹었는데 정말 최고였어요. 회도 신선하고 사장님이 직접 설명해주셔서 더욱 맛있게 먹을 수 있었습니다.', 
        location: '서초구 방배동 바다횟집', 
        emoji: '🍣', 
        category: '일식', 
        tags: ['오마카세', '신선한회'] 
      },
      { 
        title: '분위기 좋은 이탈리안 레스토랑', 
        description: '크림 파스타가 정말 환상적이었어요. 면도 알덴테로 완벽하고 크림 소스도 진짜 진하고 맛있었습니다.', 
        location: '강남구 논현동 맘마미아', 
        emoji: '🍝', 
        category: '양식', 
        tags: ['데이트', '파스타맛집'] 
      },
      { 
        title: '숨은 맛집 브런치 카페', 
        description: '주말 브런치로 완벽한 곳을 발견했어요! 팬케이크가 정말 부드럽고 시럽도 진짜 메이플시럽이라 달콤함이 일품이었습니다.', 
        location: '홍대입구 선셋카페', 
        emoji: '🥞', 
        category: '카페', 
        tags: ['브런치', '팬케이크', '인스타감성'] 
      },
      { 
        title: '정통 일본식 라멘집', 
        description: '진짜 일본에서 먹는 라멘 맛이에요! 돈코츠 라멘의 진한 국물과 쫄깃한 면발이 환상적입니다.', 
        location: '신사동 라멘야', 
        emoji: '🍜', 
        category: '일식', 
        tags: ['라멘', '돈코츠', '진짜맛집'] 
      },
      { 
        title: '힐링되는 한옥 카페', 
        description: '전통 한옥을 개조한 카페인데 분위기가 정말 좋아요. 전통차와 한과도 맛있고 사진찍기에도 예쁜 곳이에요.', 
        location: '인사동 한옥마루', 
        emoji: '🍵', 
        category: '카페', 
        tags: ['한옥', '전통차', '힐링'] 
      },
      { 
        title: '매콤한 떡볶이 맛집', 
        description: '어릴 때 먹던 그 맛! 떡볶이가 정말 쫄깃하고 소스가 진짜 맛있어요. 어묵도 두툼하고 맛있습니다.', 
        location: '신촌 할머니떡볶이', 
        emoji: '🍢', 
        category: '분식', 
        tags: ['떡볶이', '추억의맛', '매콤'] 
      },
      { 
        title: '고급스러운 한정식집', 
        description: '특별한 날에 가기 좋은 한정식집이에요. 모든 반찬이 하나하나 정성스럽고 맛도 훌륭합니다.', 
        location: '종로구 궁중한정식', 
        emoji: '🍽️', 
        category: '한식', 
        tags: ['한정식', '고급', '특별한날'] 
      },
      { 
        title: '신선한 샐러드 전문점', 
        description: '건강한 한 끼 식사로 완벽해요. 야채도 신선하고 드레싱도 다양해서 선택의 재미가 있습니다.', 
        location: '압구정 그린샐러드', 
        emoji: '🥗', 
        category: '샐러드', 
        tags: ['건강식', '신선한야채', '다이어트'] 
      },
      { 
        title: '진한 커피 원두 카페', 
        description: '커피 맛이 정말 진하고 좋아요. 원두를 직접 로스팅해서 향도 훌륭하고 디저트도 맛있습니다.', 
        location: '성수동 로스터리카페', 
        emoji: '☕', 
        category: '카페', 
        tags: ['원두커피', '로스팅', '디저트'] 
      },
      { 
        title: '푸짐한 삼겹살집', 
        description: '고기가 정말 두툼하고 맛있어요. 밑반찬도 푸짐하고 된장찌개도 일품입니다. 가격도 합리적이에요.', 
        location: '마포구 삼겹살왕', 
        emoji: '🥩', 
        category: '한식', 
        tags: ['삼겹살', '푸짐한', '가성비'] 
      }
    ];

    return restaurants.map((restaurant, index) => ({
      id: index + 1,
      title: restaurant.title,
      description: restaurant.description,
      rating: Number((Math.random() * 2 + 3).toFixed(1)),
      location: restaurant.location,
      emoji: restaurant.emoji,
      category: restaurant.category,
      tags: restaurant.tags,
    }));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const data = generateFeedData();
      setFeedData(data);
      setIsLoading(false);
    }, 1000);
  }, [generateFeedData]);

  const handleSwipeLeft = useCallback((card: FeedItem) => {
    console.log('패스:', card.title);
    setPassedItems(prev => [...prev, card]);
    setStatusMessage(`${card.title}을(를) 패스했습니다.`);
    setTimeout(() => setStatusMessage(''), 2000);
  }, []);

  const handleSwipeRight = useCallback((card: FeedItem) => {
    console.log('좋아요:', card.title);
    setLikedItems(prev => [...prev, card]);
    setStatusMessage(`${card.title}을(를) 좋아요했습니다.`);
    setTimeout(() => setStatusMessage(''), 2000);
  }, []);

  const handleStackEmpty = useCallback(() => {
    console.log('모든 카드를 확인했습니다!');
  }, []);

  const handleRestart = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      const data = generateFeedData();
      setFeedData(data);
      setLikedItems([]);
      setPassedItems([]);
      setIsLoading(false);
    }, 500);
  }, [generateFeedData]);

  const handleBack = useCallback(() => {
    // 뒤로 가기 로직 (실제 구현에서는 라우터 사용)
    console.log('뒤로 가기');
  }, []);

  const renderEmptyState = useCallback(() => (
    <>
      <div className="ds-flip-feed__empty-icon">🎉</div>
      <h3 className="ds-flip-feed__empty-title">모든 맛집을 확인했어요!</h3>
      <p className="ds-flip-feed__empty-description">
        {likedItems.length}개의 맛집을 좋아요 했습니다
      </p>
      <Button 
        variant="primary" 
        onClick={handleRestart}
        className="ds-flip-feed__restart-button"
      >
        <RotateCcw size={16} />
        다시 시작하기
      </Button>
    </>
  ), [likedItems.length, handleRestart]);

  if (isLoading) {
    return (
      <div className="ds-flip-feed">
        <header className="ds-flip-feed__header">
          <Button variant="text" onClick={handleBack} className="ds-flip-feed__back-button">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="ds-flip-feed__title">맛집 발견</h1>
          <div className="ds-flip-feed__header-placeholder" />
        </header>
        
        <div className="ds-flip-feed__loading">
          <div className="ds-flip-feed__loading-spinner"></div>
          <p className="ds-flip-feed__loading-text">맛있는 맛집들을 준비하고 있어요...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ds-flip-feed">
      <header className="ds-flip-feed__header">
        <Button variant="text" onClick={handleBack} className="ds-flip-feed__back-button">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="ds-flip-feed__title">맛집 발견</h1>
        <div className="ds-flip-feed__header-placeholder" />
      </header>

      <div className="ds-flip-feed__container">
        <div className="ds-flip-feed__instructions">
          <p>좌우로 스와이프하여 맛집을 선택해보세요</p>
          <div className="ds-flip-feed__instructions-icons">
            <span className="ds-flip-feed__instruction-item">
              <span className="ds-flip-feed__instruction-icon">👈</span>
              패스
            </span>
            <span className="ds-flip-feed__instruction-item">
              <span className="ds-flip-feed__instruction-icon">👉</span>
              좋아요
            </span>
          </div>
          <div id="swipe-instructions" className="ds-flip-feed__keyboard-instructions">
            키보드: ← 패스 | → 또는 스페이스 좋아요 | ESC 리셋
          </div>
        </div>

        <div className="ds-flip-feed__stack-container">
          <CardStack
            cards={feedData}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onStackEmpty={handleStackEmpty}
            renderEmptyState={renderEmptyState}
          />
        </div>
      </div>

      <div className="ds-flip-feed__stats">
        <div className="ds-flip-feed__stat-item">
          <span className="ds-flip-feed__stat-value">{likedItems.length}</span>
          <span className="ds-flip-feed__stat-label">좋아요</span>
        </div>
        <div className="ds-flip-feed__stat-item">
          <span className="ds-flip-feed__stat-value">{passedItems.length}</span>
          <span className="ds-flip-feed__stat-label">패스</span>
        </div>
      </div>

      {/* Screen Reader용 상태 메시지 */}
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {statusMessage}
      </div>
    </div>
  );
};

export default FlipFeedScreen;