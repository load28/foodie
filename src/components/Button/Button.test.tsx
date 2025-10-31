import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button 컴포넌트', () => {
  it('기본 버튼이 렌더링된다', () => {
    render(<Button>클릭</Button>);
    expect(screen.getByRole('button', { name: '클릭' })).toBeInTheDocument();
  });

  it('기본 텍스트가 표시된다', () => {
    render(<Button />);
    expect(screen.getByRole('button', { name: 'Button' })).toBeInTheDocument();
  });

  it('primary variant가 적용된다', () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('ds-button--primary');
  });

  it('secondary variant가 적용된다', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('ds-button--secondary');
  });

  it('ghost variant가 적용된다', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('ds-button--ghost');
  });

  it('small size가 적용된다', () => {
    render(<Button size="small">Small</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('ds-button--small');
  });

  it('medium size가 적용된다', () => {
    render(<Button size="medium">Medium</Button>);
    const button = screen.getByRole('button');
    expect(button).not.toHaveClass('ds-button--small');
  });

  it('클릭 이벤트가 호출된다', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>클릭</Button>);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 상태에서 클릭 이벤트가 호출되지 않는다', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick} disabled>클릭</Button>);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  it('submit 타입이 적용된다', () => {
    render(<Button type="submit">제출</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('reset 타입이 적용된다', () => {
    render(<Button type="reset">초기화</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'reset');
  });

  it('기본 button 타입이 적용된다', () => {
    render(<Button>버튼</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('여러 조합이 동시에 적용된다', () => {
    render(
      <Button variant="secondary" size="small" disabled>
        조합 버튼
      </Button>
    );
    const button = screen.getByRole('button');

    expect(button).toHaveClass('ds-button');
    expect(button).toHaveClass('ds-button--secondary');
    expect(button).toHaveClass('ds-button--small');
    expect(button).toBeDisabled();
  });

  it('children으로 JSX가 렌더링된다', () => {
    render(
      <Button>
        <span data-testid="icon">🔥</span>
        <span>텍스트</span>
      </Button>
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('텍스트')).toBeInTheDocument();
  });
});
