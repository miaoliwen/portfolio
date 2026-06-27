/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';

interface Question {
  id: string;
  dimension: 'anxiety' | 'avoidance';
  text: string;
}

interface Analysis {
  characteristics: string;
  relationship_patterns: string;
  growth_advice: string;
}

const AttachmentTest = () => {
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [showResult, setShowResult] = useState(false);
  const [anxietyScore, setAnxietyScore] = useState(0);
  const [avoidanceScore, setAvoidanceScore] = useState(0);
  const [attachmentStyle, setAttachmentStyle] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [highlightedCards, setHighlightedCards] = useState<Set<string>>(new Set());
  const resultRef = useRef<HTMLDivElement>(null);

  const questions: Question[] = [
    { id: 'Q1', dimension: 'anxiety', text: '我经常担心我的伴侣不再在乎我或不再爱我。' },
    { id: 'Q2', dimension: 'avoidance', text: '我发现自己很难在情感上完全信任和依赖伴侣。' },
    { id: 'Q3', dimension: 'anxiety', text: '我常常需要伴侣反复向我保证他们是爱我的，我才能感到安心。' },
    { id: 'Q4', dimension: 'avoidance', text: '当伴侣试图在情感上与我靠得太近时，我会本能地感到不适或想要退缩。' },
    { id: 'Q5', dimension: 'anxiety', text: '如果伴侣没有及时回复我的消息，我很容易胡思乱想，觉得是不是自己做错了什么。' },
    { id: 'Q6', dimension: 'avoidance', text: '即使在恋爱中，我也认为保持个人的绝对独立和距离感是必须的。' },
    { id: 'Q7', dimension: 'anxiety', text: '在亲密关系中，我非常害怕被抛弃或最终只剩自己一个人。' },
    { id: 'Q8', dimension: 'avoidance', text: '遇到挫折或情绪低落时，我更倾向于自己消化，而不是向伴侣求助。' },
    { id: 'Q9', dimension: 'anxiety', text: '我有时会觉得，我投入在这段感情里的爱，远超过伴侣给我的爱。' },
    { id: 'Q10', dimension: 'avoidance', text: '当伴侣对我表达非常强烈、浓烈的情感时，我会感到有压力甚至窒息。' }
  ];

  const analysisData: { [key: string]: Analysis } = {
    '安全型': {
      characteristics: '你既能安心地依赖伴侣，也愿意被伴侣依赖。你相信自己是值得被爱的，同时也能在亲密与独立之间找到舒适的平衡。情绪调节能力较强，面对关系中的波动通常能以建设性方式应对。',
      relationship_patterns: '你在关系中倾向于直接沟通需求，既不会过度黏人，也不会刻意疏远。冲突时更愿意协商解决。潜在雷区：有时可能低估伴侣的不安全感，需要留意对方是否隐藏着焦虑或回避倾向。',
      growth_advice: '1. 继续保持坦诚的情感表达，定期与伴侣进行"关系检查"，让彼此的情感账户保持充盈。2. 尝试在安全的基础上，主动探索更深层的情感脆弱面，这能让亲密感进一步升华。'
    },
    '焦虑型/痴迷型': {
      characteristics: '你渴望高度的亲密和融合，但常常担忧被拒绝或抛弃。你的情感雷达非常敏锐，容易过度解读伴侣的言行。你需要大量的确认与 reassurance 才能平息内心的不安。',
      relationship_patterns: '可能会频繁寻求联系、反复确认爱意，一旦感知到距离就会激活"抗议行为"。雷区：过度付出后感到委屈，或通过情绪爆发来吸引关注，容易让伴侣感到压力。',
      growth_advice: '1. 练习自我安抚：当焦虑升起时，先进行深呼吸或写下情绪日记，延迟向伴侣寻求保证的冲动，逐渐建立内在安全感。2. 学习清晰、非指责地表达需求（如"我需要一些 reassurance"），而不是通过试探或抱怨来获取关注。'
    },
    '回避型/疏离型': {
      characteristics: '你将独立和自给自足视为核心价值，情感上习惯保持距离。你不太愿意展示脆弱，可能会贬低亲密关系的重要性，以此保护自己免受可能的失望或束缚。',
      relationship_patterns: '在关系中常表现出"情感撤退"，当伴侣试图靠近时你会感到压迫。雷区：容易让伴侣感到被冷落或不被需要；你可能在冲突中选择沉默或离开，而非共同解决。',
      growth_advice: '1. 从小事开始练习"有控制的暴露"：尝试向伴侣分享一个微小的烦恼或软弱的时刻，观察对方的反应并逐步建立信任。2. 重新定义独立：真正的独立不是隔绝依赖，而是有能力在亲密中依然保有自我，允许自己接受支持。'
    },
    '恐惧型/混乱型': {
      characteristics: '你内心渴望亲密，却又极度害怕受伤或被抛弃。这种矛盾让你在关系中既想靠近又想逃离，情绪起伏较大，常常陷入"推拉"循环。你对自己和他人可能都缺乏稳定的信任。',
      relationship_patterns: '关系模式往往混乱且强烈：可能上一秒热情似火，下一秒冷若冰霜。雷区：因恐惧而先行推开对方，或在冲突中表现出难以预测的情绪反应，让双方都感到精疲力竭。',
      growth_advice: '1. 优先建立情绪调节技能：通过正念冥想或专业咨询学习与强烈情绪共处，而不被其驱使做出冲动行为。2. 在安全、低风险的关系中练习一致性：尝试用语言表达"我现在感到害怕，但我仍想试着靠近"，给伴侣理解你的机会。'
    }
  };

  const getLabelText = (value: number): string => {
    const labels: { [key: number]: string } = {
      1: '完全不符合',
      2: '比较不符合',
      3: '不确定/中立',
      4: '比较符合',
      5: '完全符合'
    };
    return labels[value] || '';
  };

  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    setErrorMsg('');
    setHighlightedCards(prev => {
      const newSet = new Set(prev);
      newSet.delete(questionId);
      return newSet;
    });
  };

  const handleSubmit = () => {
    setErrorMsg('');
    setHighlightedCards(new Set());

    const unanswered = questions.filter(q => !(q.id in answers));
    if (unanswered.length > 0) {
      const newHighlighted = new Set(unanswered.map(q => q.id));
      setHighlightedCards(newHighlighted);
      setErrorMsg('请完成所有题目后再查看结果。');
      setShowResult(false);
      
      // 自动移除高亮
      setTimeout(() => {
        setHighlightedCards(new Set());
      }, 2500);
      return;
    }

    const anxietyIds = ['Q1', 'Q3', 'Q5', 'Q7', 'Q9'];
    const avoidanceIds = ['Q2', 'Q4', 'Q6', 'Q8', 'Q10'];

    const anxiety = anxietyIds.reduce((sum, id) => sum + (answers[id] || 0), 0);
    const avoidance = avoidanceIds.reduce((sum, id) => sum + (answers[id] || 0), 0);

    setAnxietyScore(anxiety);
    setAvoidanceScore(avoidance);

    let style = '';
    if (anxiety < 15 && avoidance < 15) {
      style = '安全型';
    } else if (anxiety >= 15 && avoidance < 15) {
      style = '焦虑型/痴迷型';
    } else if (anxiety < 15 && avoidance >= 15) {
      style = '回避型/疏离型';
    } else {
      style = '恐惧型/混乱型';
    }

    setAttachmentStyle(style);
    setAnalysis(analysisData[style] || null);
    setShowResult(true);

    const jsonOutput = {
      scores: {
        anxiety_score: anxiety,
        avoidance_score: avoidance
      },
      attachment_style: style,
      analysis: analysisData[style]
    };
    console.log('依恋类型测试结果 (JSON):', JSON.stringify(jsonOutput, null, 2));
  };

  // 滚动到结果
  useEffect(() => {
    if (showResult && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [showResult]);

  return (
    <div style={{
      fontFamily: "'Segoe UI', 'Roboto', 'Noto Sans', system-ui, -apple-system, sans-serif",
      background: 'linear-gradient(145deg, #f5f0eb 0%, #e8e0d5 100%)',
      minHeight: '100vh',
      padding: '2rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#3e3a37'
    }}>
      <div style={{
        maxWidth: '720px',
        width: '100%',
        background: '#fffcf5',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        boxShadow: '0 30px 50px rgba(0, 0, 0, 0.08), 0 12px 24px rgba(0, 0, 0, 0.06)',
        borderRadius: '2.5rem',
        padding: '2.5rem 2rem',
        transition: 'all 0.3s ease',
        border: '1px solid rgba(200, 180, 150, 0.25)'
      }}>
        {/* Header */}
        <h1 style={{
          fontSize: '2.2rem',
          fontWeight: 500,
          letterSpacing: '0.5px',
          color: '#4a3e35',
          marginBottom: '0.4rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          🧭 依恋类型测试
          <span style={{
            background: '#d9c5a7',
            color: '#2f2820',
            fontSize: '1rem',
            padding: '0.2rem 0.9rem',
            borderRadius: '30px',
            letterSpacing: '0.4px',
            fontWeight: 500
          }}>
            成人版
          </span>
        </h1>
        
        <div style={{
          fontSize: '1.05rem',
          color: '#6b5e53',
          marginBottom: '2.5rem',
          borderLeft: '4px solid #c8aa7a',
          paddingLeft: '1.2rem',
          fontStyle: 'italic',
          lineHeight: 1.5
        }}>
          基于成人依恋理论（ECR-RS）· 请根据你在亲密关系中的普遍感受作答
        </div>

        {/* Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', marginBottom: '2rem' }}>
          {questions.map((question, index) => (
            <div
              key={question.id}
              style={{
                background: '#fefaf5',
                borderRadius: '1.8rem',
                padding: '1.5rem 1.8rem',
                boxShadow: '0 6px 14px rgba(0, 0, 0, 0.02)',
                border: `1px solid ${highlightedCards.has(question.id) ? '#c96b5a' : '#ede3d6'}`,
                transition: '0.2s'
              }}
            >
              <div style={{
                fontWeight: 500,
                fontSize: '1.1rem',
                marginBottom: '1.2rem',
                color: '#3c332b',
                lineHeight: 1.5
              }}>
                {index + 1}. {question.text}
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '1.8rem',
                justifyContent: 'flex-start'
              }}>
                {[1, 2, 3, 4, 5].map(val => (
                  <label key={val} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    color: '#5b4d40',
                    transition: 'color 0.15s',
                    userSelect: 'none'
                  }}>
                    <input
                      type="radio"
                      name={question.id}
                      value={val}
                      checked={answers[question.id] === val}
                      onChange={() => handleAnswerChange(question.id, val)}
                      style={{
                        appearance: 'none',
                        width: '1.2rem',
                        height: '1.2rem',
                        border: `2px solid ${answers[question.id] === val ? '#b2905a' : '#ccb699'}`,
                        borderRadius: '50%',
                        marginRight: '0.15rem',
                        transition: '0.2s',
                        cursor: 'pointer',
                        background: answers[question.id] === val ? '#b2905a' : 'white',
                        boxShadow: answers[question.id] === val ? 'inset 0 0 0 4px #fffcf5' : 'none'
                      }}
                    />
                    <span>{getLabelText(val)}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button
            onClick={handleSubmit}
            style={{
              background: 'linear-gradient(135deg, #b2926a 0%, #8b6d4f 100%)',
              border: '1px solid #d4b185',
              color: 'white',
              fontWeight: 500,
              fontSize: '1.2rem',
              padding: '1rem 2.2rem',
              borderRadius: '3rem',
              letterSpacing: '0.8px',
              cursor: 'pointer',
              transition: 'background 0.25s, transform 0.15s, box-shadow 0.2s',
              boxShadow: '0 10px 18px -8px rgba(130, 90, 50, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #c3a582 0%, #9c7c5c 100%)';
              e.currentTarget.style.boxShadow = '0 14px 22px -8px rgba(110, 70, 30, 0.4)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #b2926a 0%, #8b6d4f 100%)';
              e.currentTarget.style.boxShadow = '0 10px 18px -8px rgba(130, 90, 50, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(1px)';
              e.currentTarget.style.boxShadow = '0 6px 12px -4px rgba(90, 60, 30, 0.3)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 14px 22px -8px rgba(110, 70, 30, 0.4)';
            }}
          >
            ✨ 查看我的依恋类型
          </button>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div style={{
            color: '#b85c4b',
            fontWeight: 500,
            textAlign: 'center',
            marginTop: '1rem'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Results */}
        {showResult && analysis && (
          <div ref={resultRef} style={{
            marginTop: '2.5rem',
            padding: '2rem 1.8rem',
            background: '#f7efe4',
            borderRadius: '2rem',
            border: '1px solid #dacbbc',
            animation: 'fadeSlide 0.5s ease'
          }}>
            {/* Scores */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2.5rem',
              flexWrap: 'wrap',
              marginBottom: '1.8rem'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '2rem',
                padding: '0.8rem 1.8rem',
                textAlign: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
              }}>
                <small style={{
                  display: 'block',
                  color: '#7b6b5c',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  fontSize: '0.8rem',
                  marginBottom: '0.2rem'
                }}>依恋焦虑</small>
                <span style={{
                  fontSize: '2rem',
                  fontWeight: 600,
                  color: '#5e4330'
                }}>{anxietyScore}</span>
              </div>
              <div style={{
                background: 'white',
                borderRadius: '2rem',
                padding: '0.8rem 1.8rem',
                textAlign: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
              }}>
                <small style={{
                  display: 'block',
                  color: '#7b6b5c',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  fontSize: '0.8rem',
                  marginBottom: '0.2rem'
                }}>依恋回避</small>
                <span style={{
                  fontSize: '2rem',
                  fontWeight: 600,
                  color: '#5e4330'
                }}>{avoidanceScore}</span>
              </div>
            </div>

            {/* Attachment Style */}
            <div style={{ textAlign: 'center', marginBottom: '1.6rem' }}>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: 500,
                color: '#4f3b2a',
                background: '#e7d7c2',
                display: 'inline-block',
                padding: '0.4rem 2.2rem',
                borderRadius: '3rem',
                letterSpacing: '1px'
              }}>
                {attachmentStyle}
              </div>
            </div>

            {/* Analysis */}
            <div style={{
              background: '#fffdf9',
              borderRadius: '1.5rem',
              padding: '1.6rem',
              border: '1px solid #e3d3bf'
            }}>
              <h4 style={{
                fontWeight: 600,
                color: '#6e5843',
                marginBottom: '0.6rem',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                🧠 核心特征
              </h4>
              <p style={{
                color: '#3d3227',
                lineHeight: 1.6,
                marginBottom: '1.2rem'
              }}>
                {analysis.characteristics}
              </p>

              <h4 style={{
                fontWeight: 600,
                color: '#6e5843',
                marginBottom: '0.6rem',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                💞 关系模式与潜在雷区
              </h4>
              <p style={{
                color: '#3d3227',
                lineHeight: 1.6,
                marginBottom: '1.2rem'
              }}>
                {analysis.relationship_patterns}
              </p>

              <h4 style={{
                fontWeight: 600,
                color: '#6e5843',
                marginBottom: '0.6rem',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                🌱 成长与改善建议
              </h4>
              <ul style={{ paddingLeft: '1.4rem' }}>
                {analysis.growth_advice
                  .split(/\d\.\s/)
                  .filter(item => item.trim() !== '')
                  .map((advice, idx) => (
                    <li key={idx} style={{
                      color: '#3d3227',
                      lineHeight: 1.6,
                      marginBottom: '0.6rem'
                    }}>
                      <strong>{idx + 1}.</strong> {advice.trim()}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeSlide {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 500px) {
          h1 {
            font-size: 1.8rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AttachmentTest;
