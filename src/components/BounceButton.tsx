import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface BounceButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const BounceButton = React.forwardRef<HTMLButtonElement, BounceButtonProps>(
  ({ children, className, ...props }, ref) => {
    // 监听用户的 prefers-reduced-motion 系统偏好
    const shouldReduceMotion = useReducedMotion();

    // 降级动画：对于需要减少动画的用户，提供简单的透明度淡入淡出
    if (shouldReduceMotion) {
      return (
        <motion.button
          ref={ref}
          className={className}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          whileHover={{ opacity: 0.8 }}
          whileFocus={{ opacity: 0.8 }}
          whileTap={{ opacity: 0.6 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          {...(props as any)}
        >
          {children}
        </motion.button>
      );
    }

    // 弹性幅度与位移：scale(1)→scale(1.08)→scale(0.96)→scale(1)，同时带 8px 的 Y 轴回弹
    const bounceKeyframes = {
      scale: [1, 1.08, 0.96, 1],
      y: [0, -8, 2, 0], // 8px 位移回弹以强化 "Q弹"
      transition: {
        duration: 0.6, // 持续 600ms
        ease: [0.68, -0.55, 0.27, 1.55], // 物理规律弹性贝塞尔曲线
      }
    };

    // 初始/交互弹簧物理参数：mass=1、stiffness=300、damping=20
    const springEntry = {
      type: "spring",
      mass: 1,
      stiffness: 300,
      damping: 20,
    };

    return (
      <motion.button
        ref={ref}
        // 使用 will-change-transform 保证 60fps 硬件加速
        className={`will-change-transform ${className || ''}`}
        // 1. 滚动进入视口动画 (Scroll-into-view)
        initial={{ scale: 0.8, opacity: 0, y: 10 }}
        whileInView={{
          scale: 1,
          opacity: 1,
          y: 0,
          transition: springEntry
        }}
        viewport={{ once: false, amount: 0.2 }}
        
        // 2. 移除 Hover 的 Q弹动画 (保留组件外部传入的 className hover)
        
        // 3. Focus 动画
        whileFocus={bounceKeyframes}
        
        // 4. Active (Tap) 动画
        whileTap={{ 
          scale: 0.9, 
          y: 0,
          transition: springEntry 
        }}
        
        {...(props as any)}
      >
        {children}
      </motion.button>
    );
  }
);

BounceButton.displayName = 'BounceButton';
