/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f0eb] to-[#e8e0d5] py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#fffcf5] rounded-[2.5rem] p-8 sm:p-10 shadow-lg border border-[rgba(200,180,150,0.25)]">
          {/* Header */}
          <h1 className="text-3xl sm:text-4xl font-medium text-[#4a3e35] mb-2 flex items-center gap-2">
            🧭 依恋类型测试
            <span className="bg-[#d9c5a7] text-[#2f2820] text-sm sm:text-base px-4 py-1 rounded-full font-medium tracking-wide">
              成人版
            </span>
          </h1>
          <div className="text-base sm:text-lg text-[#6b5e53] mb-8 border-l-4 border-[#c8aa7a] pl-4 italic">
            基于成人依恋理论（ECR-RS）· 请根据你在亲密关系中的普遍感受作答
          </div>

          {/* Questions */}
          <div className="space-y-5 mb-8">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className={`bg-[#fefaf5] rounded-[1.8rem] p-6 shadow-sm border transition-colors ${
                  highlightedCards.has(question.id)
                    ? 'border-[#c96b5a]'
                    : 'border-[#ede3d6] hover:border-[#cdb79b]'
                }`}
              >
                <div className="font-medium text-lg text-[#3c332b] mb-4">
                  {index + 1}. {question.text}
                </div>
                <div className="flex flex-wrap gap-4">
                  {[1, 2, 3, 4, 5].map(val => (
                    <label key={val} className="flex items-center gap-2 cursor-pointer text-[#5b4d40] hover:text-[#2b221a] transition-colors">
                      <input
                        type="radio"
                        name={question.id}
                        value={val}
                        checked={answers[question.id] === val}
                        onChange={() => handleAnswerChange(question.id, val)}
                        className="appearance-none w-5 h-5 border-2 border-[#ccb699] rounded-full cursor-pointer checked:border-[#b2905a] checked:bg-[#b2905a] focus-visible:outline-2 focus-visible:outline-[#b2905a] focus-visible:outline-offset-2"
                      />
                      <span className="text-sm sm:text-base">{getLabelText(val)}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mb-4">
            <button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-[#b2926a] to-[#8b6d4f] hover:from-[#c3a582] hover:to-[#9c7c5c] text-white font-medium text-lg px-12 py-3 rounded-full border border-[#d4b185] shadow-lg hover:shadow-xl transition-all active:translate-y-1"
            >
              ✨ 查看我的依恋类型
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="text-center text-[#b85c4b] font-medium">
              {errorMsg}
            </div>
          )}

          {/* Results */}
          {showResult && analysis && (
            <div className="mt-8 p-8 bg-[#f7efe4] rounded-[2rem] border border-[#dacbbc] animate-fade-slide">
              {/* Scores */}
              <div className="flex justify-center gap-8 flex-wrap mb-8">
                <div className="bg-white rounded-full px-8 py-4 text-center shadow-sm">
                  <div className="text-4xl font-bold text-[#5e4330]">{anxietyScore}</div>
                  <div className="text-xs sm:text-sm uppercase text-[#7b6b5c] tracking-wide mt-1">依恋焦虑</div>
                </div>
                <div className="bg-white rounded-full px-8 py-4 text-center shadow-sm">
                  <div className="text-4xl font-bold text-[#5e4330]">{avoidanceScore}</div>
                  <div className="text-xs sm:text-sm uppercase text-[#7b6b5c] tracking-wide mt-1">依恋回避</div>
                </div>
              </div>

              {/* Attachment Style */}
              <div className="text-center mb-8">
                <div className="inline-block bg-[#e7d7c2] text-[#4f3b2a] text-2xl font-medium px-8 py-2 rounded-full tracking-wider">
                  {attachmentStyle}
                </div>
              </div>

              {/* Analysis */}
              <div className="space-y-6">
                <div className="bg-[#fffdf9] rounded-[1.5rem] p-6 border border-[#e3d3bf]">
                  <h4 className="text-lg font-semibold text-[#6e5843] mb-3 flex items-center gap-2">
                    🧠 核心特征
                  </h4>
                  <p className="text-[#3d3227] leading-relaxed">{analysis.characteristics}</p>
                </div>

                <div className="bg-[#fffdf9] rounded-[1.5rem] p-6 border border-[#e3d3bf]">
                  <h4 className="text-lg font-semibold text-[#6e5843] mb-3 flex items-center gap-2">
                    💞 关系模式与潜在雷区
                  </h4>
                  <p className="text-[#3d3227] leading-relaxed">{analysis.relationship_patterns}</p>
                </div>

                <div className="bg-[#fffdf9] rounded-[1.5rem] p-6 border border-[#e3d3bf]">
                  <h4 className="text-lg font-semibold text-[#6e5843] mb-3 flex items-center gap-2">
                    🌱 成长与改善建议
                  </h4>
                  <ul className="space-y-3 text-[#3d3227]">
                    {analysis.growth_advice
                      .split(/\d\.\s/)
                      .filter(item => item.trim() !== '')
                      .map((advice, idx) => (
                        <li key={idx} className="flex gap-3">
                          <span className="font-semibold text-[#6e5843] flex-shrink-0">{idx + 1}.</span>
                          <span className="leading-relaxed">{advice.trim()}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeSlide {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide {
          animation: fadeSlide 0.5s ease;
        }
      `}</style>
    </div>
  );
};

export default AttachmentTest;
