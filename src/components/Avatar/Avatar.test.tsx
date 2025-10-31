import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Camera } from 'lucide-react';
import Avatar from './Avatar';

describe('Avatar 컴포넌트', () => {
  it('기본 아바타가 렌더링된다', () => {
    render(<Avatar />);
    expect(screen.getByText('').closest('.ds-avatar')).toBeInTheDocument();
  });

  it('이미지가 제공되면 이미지가 표시된다', () => {
    render(<Avatar image="https://example.com/avatar.jpg" alt="User Avatar" />);
    const img = screen.getByAltText('User Avatar');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('이미지가 없으면 기본 아이콘이 표시된다', () => {
    const { container } = render(<Avatar />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('커스텀 아이콘이 적용된다', () => {
    const { container } = render(<Avatar icon={Camera} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('small size가 적용된다', () => {
    const { container } = render(<Avatar size="small" />);
    expect(container.querySelector('.ds-avatar--small')).toBeInTheDocument();
  });

  it('medium size가 적용된다 (기본값)', () => {
    const { container } = render(<Avatar size="medium" />);
    expect(container.querySelector('.ds-avatar--medium')).not.toBeInTheDocument();
  });

  it('large size가 적용된다', () => {
    const { container } = render(<Avatar size="large" />);
    expect(container.querySelector('.ds-avatar--large')).toBeInTheDocument();
  });

  it('xl size가 적용된다', () => {
    const { container } = render(<Avatar size="xl" />);
    expect(container.querySelector('.ds-avatar--xl')).toBeInTheDocument();
  });

  it('primary color가 적용된다 (기본값)', () => {
    const { container } = render(<Avatar color="primary" />);
    expect(container.querySelector('.ds-avatar--primary')).not.toBeInTheDocument();
  });

  it('secondary color가 적용된다', () => {
    const { container } = render(<Avatar color="secondary" />);
    expect(container.querySelector('.ds-avatar--secondary')).toBeInTheDocument();
  });

  it('accent color가 적용된다', () => {
    const { container } = render(<Avatar color="accent" />);
    expect(container.querySelector('.ds-avatar--accent')).toBeInTheDocument();
  });

  it('gray color가 적용된다', () => {
    const { container } = render(<Avatar color="gray" />);
    expect(container.querySelector('.ds-avatar--gray')).toBeInTheDocument();
  });

  it('online 상태가 표시된다', () => {
    const { container } = render(<Avatar status="online" />);
    expect(container.querySelector('.ds-avatar__status--online')).toBeInTheDocument();
  });

  it('away 상태가 표시된다', () => {
    const { container } = render(<Avatar status="away" />);
    expect(container.querySelector('.ds-avatar__status--away')).toBeInTheDocument();
  });

  it('offline 상태가 표시된다', () => {
    const { container } = render(<Avatar status="offline" />);
    expect(container.querySelector('.ds-avatar__status--offline')).toBeInTheDocument();
  });

  it('status가 없으면 상태 표시가 없다', () => {
    const { container } = render(<Avatar />);
    expect(container.querySelector('.ds-avatar__status')).not.toBeInTheDocument();
  });

  it('clickable이 true일 때 클릭 가능하다', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<Avatar clickable onClick={handleClick} />);

    const avatar = container.querySelector('.ds-avatar');
    await user.click(avatar!);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('clickable이 false일 때 클릭 이벤트가 호출되지 않는다', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<Avatar clickable={false} onClick={handleClick} />);

    const avatar = container.querySelector('.ds-avatar');
    await user.click(avatar!);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('clickable일 때 cursor pointer 스타일이 적용된다', () => {
    const { container } = render(<Avatar clickable />);
    const avatar = container.querySelector('.ds-avatar') as HTMLElement;
    expect(avatar.style.cursor).toBe('pointer');
  });

  it('clickable이 아닐 때 cursor 스타일이 없다', () => {
    const { container } = render(<Avatar clickable={false} />);
    const avatar = container.querySelector('.ds-avatar') as HTMLElement;
    expect(avatar.style.cursor).toBe('');
  });

  it('className이 추가로 적용된다', () => {
    const { container } = render(<Avatar className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('여러 조합이 동시에 적용된다', () => {
    const { container } = render(
      <Avatar
        size="large"
        color="secondary"
        status="online"
        clickable
        className="custom"
      />
    );

    const avatar = container.querySelector('.ds-avatar');
    expect(avatar).toHaveClass('ds-avatar--large');
    expect(avatar).toHaveClass('ds-avatar--secondary');
    expect(avatar).toHaveClass('ds-avatar--clickable');
    expect(avatar).toHaveClass('custom');
    expect(container.querySelector('.ds-avatar__status--online')).toBeInTheDocument();
  });

  it('이미지와 상태가 함께 표시된다', () => {
    render(
      <Avatar
        image="https://example.com/avatar.jpg"
        alt="User"
        status="online"
      />
    );

    expect(screen.getByAltText('User')).toBeInTheDocument();
    const { container } = render(
      <Avatar
        image="https://example.com/avatar.jpg"
        status="online"
      />
    );
    expect(container.querySelector('.ds-avatar__status--online')).toBeInTheDocument();
  });
});
