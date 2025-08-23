import React, { useState } from 'react';
import './Colors.scss';

interface ColorSwatchProps {
  name: string;
  hex: string;
  cssVar: string;
  description?: string;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ name, hex, cssVar, description }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  return (
    <div className="color-swatch" onClick={handleCopy}>
      <div 
        className="color-swatch__color" 
        style={{ backgroundColor: hex }}
      />
      <div className="color-swatch__info">
        <div className="color-swatch__name">{name}</div>
        <div className="color-swatch__hex">{hex}</div>
        <div className="color-swatch__var">{cssVar}</div>
        {description && (
          <div className="color-swatch__description">{description}</div>
        )}
        {copied && (
          <div className="color-swatch__copied">복사됨!</div>
        )}
      </div>
    </div>
  );
};

interface ColorGroupProps {
  title: string;
  colors: ColorSwatchProps[];
}

const ColorGroup: React.FC<ColorGroupProps> = ({ title, colors }) => (
  <div className="color-group">
    <h3 className="color-group__title">{title}</h3>
    <div className="color-group__swatches">
      {colors.map((color, index) => (
        <ColorSwatch key={index} {...color} />
      ))}
    </div>
  </div>
);

const Colors: React.FC = () => {
  const brandColors: ColorSwatchProps[] = [
    {
      name: 'Primary',
      hex: '#c4a882',
      cssVar: '$primary',
      description: '브랜드 주색상, 주요 CTA 버튼'
    },
    {
      name: 'Secondary',
      hex: '#d6c19a',
      cssVar: '$secondary',
      description: '보조 색상, 강조 요소'
    },
    {
      name: 'Accent',
      hex: '#e8d4b0',
      cssVar: '$accent',
      description: '액센트 색상, 하이라이트'
    }
  ];

  const redColors: ColorSwatchProps[] = [
    {
      name: 'Red 100',
      hex: '#8b5a5a',
      cssVar: '$red-100',
      description: '진한 레드 (에러 텍스트)'
    },
    {
      name: 'Red 200',
      hex: '#d9b3b3',
      cssVar: '$red-200',
      description: '중간 레드 (에러 보더)'
    },
    {
      name: 'Red 300',
      hex: '#f5e6e6',
      cssVar: '$red-300',
      description: '연한 레드 (에러 배경)'
    },
    {
      name: 'Red 400',
      hex: '#faf5f5',
      cssVar: '$red-400',
      description: '매우 연한 레드 (서브 배경)'
    }
  ];

  const greenColors: ColorSwatchProps[] = [
    {
      name: 'Green 100',
      hex: '#5a7a5a',
      cssVar: '$green-100',
      description: '진한 그린 (성공 텍스트)'
    },
    {
      name: 'Green 200',
      hex: '#a3c4a3',
      cssVar: '$green-200',
      description: '중간 그린 (성공 보더)'
    },
    {
      name: 'Green 300',
      hex: '#e8f5e8',
      cssVar: '$green-300',
      description: '연한 그린 (성공 배경)'
    },
    {
      name: 'Green 400',
      hex: '#f5faf5',
      cssVar: '$green-400',
      description: '매우 연한 그린 (서브 배경)'
    }
  ];

  const grayColors: ColorSwatchProps[] = [
    {
      name: 'Gray 100',
      hex: '#1a1a1a',
      cssVar: '$gray-100',
      description: '가장 진한 회색 (제목, 강조 텍스트)'
    },
    {
      name: 'Gray 200',
      hex: '#2c2c2c',
      cssVar: '$gray-200',
      description: '진한 회색 (본문 텍스트)'
    },
    {
      name: 'Gray 300',
      hex: '#666',
      cssVar: '$gray-300',
      description: '중간 회색 (보조 텍스트)'
    },
    {
      name: 'Gray 400',
      hex: '#999',
      cssVar: '$gray-400',
      description: '연한 회색 (비활성 텍스트)'
    },
    {
      name: 'Gray 500',
      hex: '#bbb',
      cssVar: '$gray-500',
      description: '더 연한 회색 (플레이스홀더)'
    },
    {
      name: 'Gray 600',
      hex: '#e8e8e8',
      cssVar: '$gray-600',
      description: '배경/보더용 회색'
    },
    {
      name: 'Gray 700',
      hex: '#f0f0f0',
      cssVar: '$gray-700',
      description: '연한 배경 회색'
    },
    {
      name: 'Gray 800',
      hex: '#f5f5f5',
      cssVar: '$gray-800',
      description: '더 연한 배경 회색'
    },
    {
      name: 'Gray 900',
      hex: '#fbfbfb',
      cssVar: '$gray-900',
      description: '매우 연한 배경 회색'
    },
    {
      name: 'Gray 950',
      hex: '#fefefe',
      cssVar: '$gray-950',
      description: '가장 연한 배경 회색'
    }
  ];

  return (
    <div className="colors-showcase">
      <div className="colors-header">
        <h2 className="colors-title">Color Palette</h2>
        <p className="colors-description">
          FoodieShare 디자인 시스템의 컬러 팔레트입니다. 클릭하여 hex 코드를 복사할 수 있습니다.
        </p>
      </div>
      
      <ColorGroup title="Brand Colors" colors={brandColors} />
      <ColorGroup title="Gray Colors" colors={grayColors} />
      <ColorGroup title="Red Colors" colors={redColors} />
      <ColorGroup title="Green Colors" colors={greenColors} />
    </div>
  );
};

export default Colors;