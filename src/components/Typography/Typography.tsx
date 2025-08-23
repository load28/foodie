import React from 'react';
import './Typography.scss';

interface TypographySampleProps {
  label: string;
  className: string;
  text: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  color?: string;
}

const TypographySample: React.FC<TypographySampleProps> = ({
  label,
  className,
  text,
  fontSize,
  fontWeight,
  lineHeight,
  color = '#2c2c2c'
}) => (
  <div className="typography-sample">
    <div className="typography-sample__meta">
      <div className="typography-sample__label">{label}</div>
      <div className="typography-sample__specs">
        {fontSize} / {lineHeight} / {fontWeight} / {color}
      </div>
    </div>
    <div className={`typography-sample__text ${className}`}>
      {text}
    </div>
  </div>
);

interface FontFamilyProps {
  name: string;
  family: string;
  description: string;
  sample: string;
}

const FontFamilySample: React.FC<FontFamilyProps> = ({ name, family, description, sample }) => (
  <div className="font-family-sample">
    <div className="font-family-sample__header">
      <h4 className="font-family-sample__name">{name}</h4>
      <div className="font-family-sample__family">{family}</div>
    </div>
    <div className="font-family-sample__description">{description}</div>
    <div className="font-family-sample__text" style={{ fontFamily: family }}>
      {sample}
    </div>
  </div>
);

const Typography: React.FC = () => {
  const headingSamples: TypographySampleProps[] = [
    {
      label: 'Heading 1',
      className: 'heading-1',
      text: '맛있는 음식, 특별한 경험',
      fontSize: '36px',
      fontWeight: '300',
      lineHeight: '1.3',
      color: '#1a1a1a'
    },
    {
      label: 'Heading 2',
      className: 'heading-2',
      text: '새로운 맛집을 발견해보세요',
      fontSize: '28px',
      fontWeight: '400',
      lineHeight: '1.4',
      color: '#1a1a1a'
    },
    {
      label: 'Heading 3',
      className: 'heading-3',
      text: '오늘의 추천 맛집',
      fontSize: '22px',
      fontWeight: '500',
      lineHeight: '1.4',
      color: '#1a1a1a'
    }
  ];

  const bodySamples: TypographySampleProps[] = [
    {
      label: 'Body 1',
      className: 'body-1',
      text: '이 곳은 정말 특별한 맛집입니다. 신선한 재료와 정성스러운 요리로 많은 사람들에게 사랑받고 있어요. 가족과 함께, 친구들과 함께, 언제 방문해도 만족스러운 경험을 선사합니다.',
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '1.7',
      color: '#2c2c2c'
    },
    {
      label: 'Body 2',
      className: 'body-2',
      text: '맛있는 음식과 따뜻한 서비스로 여러분을 기다리고 있습니다. 특별한 날, 일상의 작은 행복을 찾고 싶을 때 언제든 방문해주세요.',
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '1.6',
      color: '#555555'
    },
    {
      label: 'Caption',
      className: 'caption',
      text: '영업시간: 평일 11:00-22:00, 주말 11:00-23:00',
      fontSize: '12px',
      fontWeight: '300',
      lineHeight: '1.5',
      color: '#999999'
    }
  ];

  const fontFamilies: FontFamilyProps[] = [
    {
      name: 'Segoe UI',
      family: "'Segoe UI', Roboto, sans-serif",
      description: '디자인 시스템 전체에서 사용하는 기본 폰트입니다. 모든 텍스트에 일관성을 제공합니다.',
      sample: '깔끔하고 현대적인 시스템 폰트 / Clean and modern system font / 한글과 영문 모두 지원'
    }
  ];

  return (
    <div className="typography-showcase">
      <div className="typography-header">
        <h2 className="typography-title">Typography</h2>
        <p className="typography-description">
          FoodieShare 디자인 시스템의 타이포그래피 가이드입니다. 
          일관된 텍스트 스타일을 통해 읽기 쉽고 아름다운 콘텐츠를 제공합니다.
        </p>
      </div>

      <div className="typography-section">
        <h3 className="typography-section__title">Font Families</h3>
        <div className="font-families">
          {fontFamilies.map((font, index) => (
            <FontFamilySample key={index} {...font} />
          ))}
        </div>
      </div>

      <div className="typography-section">
        <h3 className="typography-section__title">Headings</h3>
        <div className="typography-samples">
          {headingSamples.map((sample, index) => (
            <TypographySample key={index} {...sample} />
          ))}
        </div>
      </div>

      <div className="typography-section">
        <h3 className="typography-section__title">Body Text</h3>
        <div className="typography-samples">
          {bodySamples.map((sample, index) => (
            <TypographySample key={index} {...sample} />
          ))}
        </div>
      </div>

      <div className="typography-section">
        <h3 className="typography-section__title">Font Weights</h3>
        <div className="font-weights">
          <div className="font-weight-sample" style={{ fontWeight: 300 }}>
            Light (300) - 가벼운 텍스트용
          </div>
          <div className="font-weight-sample" style={{ fontWeight: 400 }}>
            Regular (400) - 일반 본문 텍스트
          </div>
          <div className="font-weight-sample" style={{ fontWeight: 500 }}>
            Medium (500) - 중요한 텍스트
          </div>
          <div className="font-weight-sample" style={{ fontWeight: 600 }}>
            Semibold (600) - 부제목
          </div>
          <div className="font-weight-sample" style={{ fontWeight: 700 }}>
            Bold (700) - 강조 텍스트
          </div>
        </div>
      </div>
    </div>
  );
};

export default Typography;