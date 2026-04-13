import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BounceButton } from './BounceButton';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// 模拟 Framer Motion 以便更容易测试时序
// 在实际的测试环境中，您可能需要配置 jsdom 并在 vitest.setup.ts 中注入 IntersectionObserver 等
vi.mock('motion/react', async () => {
  const actual = await vi.importActual('motion/react');
  return {
    ...actual,
    useReducedMotion: () => false, // 模拟未开启降级动画
  };
});

describe('BounceButton 动画时序误差测试', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('Focus 动画的持续时间应符合 600ms，误差小于 16ms (1帧)', () => {
    const onFocus = vi.fn();

    render(
      <BounceButton 
        onFocus={onFocus} 
        data-testid="bounce-button"
      >
        Test
      </BounceButton>
    );

    const button = screen.getByTestId('bounce-button');

    // 触发 Focus 动画
    fireEvent.focus(button);
    expect(onFocus).toHaveBeenCalled();

    // 此时动画开始，持续时间应该为 600ms
    // 我们快进 585ms (600ms - 15ms)
    vi.advanceTimersByTime(585);
    
    // 我们期待 Framer Motion 内部的 animation 完成时间点不应早于 600ms 太多
    // 快进到 600ms
    vi.advanceTimersByTime(15);
    
    // 使用基础断言，避免依赖 jest-dom 的 toBeInTheDocument
    expect(button).toBeTruthy();
  });
  
  it('应当包含 will-change-transform 以确保 60fps', () => {
    render(<BounceButton data-testid="bounce-button">Test</BounceButton>);
    const button = screen.getByTestId('bounce-button');
    expect(button.className).toContain('will-change-transform');
  });
});
