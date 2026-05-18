/**
 * 智能请假条生成器 - 移动端优化版
 * 功能：表单处理、文本生成、图片渲染、分享功能
 * 适配：全面支持移动设备触控交互
 */

/**
 * HTML 转义函数 - 防止 XSS 攻击
 * 将特殊字符转换为 HTML 实体
 */
function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 全局状态
const state = {
    leaveType: '事假',
    formData: {},
    generatedText: '',
    generatedImage: null,
    isTouchDevice: false
};

// DOM 元素
const elements = {
    form: document.getElementById('leaveForm'),
    leaveTypeBtns: document.querySelectorAll('.leave-type-btn'),
    customTypeInput: document.getElementById('customTypeInput'),
    customType: document.getElementById('customType'),
    startTime: document.getElementById('startTime'),
    endTime: document.getElementById('endTime'),
    durationDisplay: document.getElementById('durationDisplay'),
    durationText: document.getElementById('durationText'),
    previewContainer: document.getElementById('previewContainer'),
    generateBtn: document.getElementById('generateBtn'),
    resetBtn: document.getElementById('resetBtn'),
    shareModal: document.getElementById('shareModal'),
    closeModal: document.getElementById('closeModal'),
    generatedImageContainer: document.getElementById('generatedImageContainer'),
    downloadBtn: document.getElementById('downloadBtn'),
    copyBtn: document.getElementById('copyBtn'),
    emailBtn: document.getElementById('emailBtn'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    toast: document.getElementById('toast'),
    canvas: document.getElementById('hiddenCanvas')
};

/**
 * 初始化应用
 */
function init() {
    detectTouchDevice();
    bindEvents();
    setDefaultDateTime();
    updatePreview();
    setupViewportHandler();
    setupOrientationHandler();
}

/**
 * 检测是否为触摸设备
 */
function detectTouchDevice() {
    state.isTouchDevice = window.matchMedia('(pointer: coarse)').matches ||
                          'ontouchstart' in window ||
                          navigator.maxTouchPoints > 0;
    
    if (state.isTouchDevice) {
        document.body.classList.add('touch-device');
    }
}

/**
 * 设置视口变化处理器
 */
function setupViewportHandler() {
    // 处理虚拟键盘弹出时的布局调整
    const viewport = window.visualViewport;
    if (viewport) {
        viewport.addEventListener('resize', handleViewportChange);
        viewport.addEventListener('scroll', handleViewportChange);
    }
    
    // 处理窗口大小变化
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updatePreview();
        }, 250);
    });
}

/**
 * 处理视口变化（虚拟键盘）
 */
function handleViewportChange() {
    const viewport = window.visualViewport;
    if (!viewport) return;
    
    // 当键盘弹出时，确保输入框可见
    const activeElement = document.activeElement;
    if (activeElement && activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
        setTimeout(() => {
            activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
}

/**
 * 设置屏幕方向变化处理器
 */
function setupOrientationHandler() {
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            updatePreview();
            // 重新计算布局
            document.body.style.display = 'none';
            document.body.offsetHeight; // 强制重排
            document.body.style.display = '';
        }, 300);
    });
}

/**
 * 绑定事件监听器
 */
function bindEvents() {
    // 请假类型选择
    elements.leaveTypeBtns.forEach(btn => {
        btn.addEventListener('click', handleLeaveTypeClick);
        btn.addEventListener('touchend', handleTouchEnd);
    });

    // 表单输入监听
    const inputs = elements.form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', debounce(updatePreview, 100));
        input.addEventListener('focus', handleInputFocus);
        input.addEventListener('blur', handleInputBlur);
    });

    // 时间变化监听
    elements.startTime.addEventListener('change', () => {
        updateDuration();
        updatePreview();
    });
    elements.endTime.addEventListener('change', () => {
        updateDuration();
        updatePreview();
    });

    // 按钮事件 - 同时支持点击和触摸
    elements.generateBtn.addEventListener('click', generateImage);
    elements.generateBtn.addEventListener('touchend', handleTouchEnd);
    
    elements.resetBtn.addEventListener('click', resetForm);
    elements.resetBtn.addEventListener('touchend', handleTouchEnd);
    
    elements.closeModal.addEventListener('click', closeModal);
    elements.closeModal.addEventListener('touchend', handleTouchEnd);
    
    elements.downloadBtn.addEventListener('click', downloadImage);
    elements.downloadBtn.addEventListener('touchend', handleTouchEnd);
    
    elements.copyBtn.addEventListener('click', copyText);
    elements.copyBtn.addEventListener('touchend', handleTouchEnd);
    
    elements.emailBtn.addEventListener('click', sendEmail);
    elements.emailBtn.addEventListener('touchend', handleTouchEnd);

    // 点击模态框外部关闭
    elements.shareModal.addEventListener('click', (e) => {
        if (e.target === elements.shareModal) {
            closeModal();
        }
    });

    // 键盘事件支持
    document.addEventListener('keydown', handleKeyDown);
    
    // 防止双击缩放
    document.addEventListener('dblclick', (e) => {
        if (state.isTouchDevice) {
            e.preventDefault();
        }
    }, { passive: false });
}

/**
 * 处理请假类型点击
 */
function handleLeaveTypeClick(e) {
    e.preventDefault();
    
    elements.leaveTypeBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    state.leaveType = e.target.dataset.type;
    
    // 显示/隐藏自定义类型输入
    if (state.leaveType === '其他') {
        elements.customTypeInput.classList.add('show');
        setTimeout(() => elements.customType.focus(), 100);
    } else {
        elements.customTypeInput.classList.remove('show');
    }
    
    updatePreview();
}

/**
 * 处理触摸结束事件
 */
function handleTouchEnd(e) {
    e.preventDefault();
    e.target.click();
}

/**
 * 处理输入框聚焦
 */
function handleInputFocus(e) {
    e.target.closest('.form-group')?.classList.add('focused');
    
    // 移动端延迟滚动确保输入框可见
    if (state.isTouchDevice) {
        setTimeout(() => {
            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }
}

/**
 * 处理输入框失焦
 */
function handleInputBlur(e) {
    e.target.closest('.form-group')?.classList.remove('focused');
}

/**
 * 处理键盘事件
 */
function handleKeyDown(e) {
    // ESC关闭模态框
    if (e.key === 'Escape' && elements.shareModal.classList.contains('show')) {
        closeModal();
    }
    
    // Ctrl/Cmd + Enter 生成图片
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        generateImage();
    }
}

/**
 * 防抖函数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 设置默认日期时间
 */
function setDefaultDateTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const endTime = new Date(tomorrow);
    endTime.setHours(18, 0, 0, 0);

    elements.startTime.value = formatDateTimeLocal(tomorrow);
    elements.endTime.value = formatDateTimeLocal(endTime);
    updateDuration();
}

/**
 * 格式化日期时间为本地格式
 */
function formatDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * 更新请假时长显示
 */
function updateDuration() {
    const start = new Date(elements.startTime.value);
    const end = new Date(elements.endTime.value);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        elements.durationDisplay.classList.remove('show');
        return;
    }

    if (end <= start) {
        elements.durationText.textContent = '结束时间必须晚于开始时间';
        elements.durationDisplay.classList.add('show');
        return;
    }

    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = Math.round(diffHours % 24);

    let durationStr = '';
    if (diffDays > 0) {
        durationStr += `${diffDays} 天`;
    }
    if (remainingHours > 0) {
        durationStr += `${diffDays > 0 ? ' ' : ''}${remainingHours} 小时`;
    }
    if (diffDays === 0 && remainingHours === 0) {
        durationStr = '不足1小时';
    }

    elements.durationText.textContent = `共计 ${durationStr}`;
    elements.durationDisplay.classList.add('show');
}

/**
 * 获取表单数据
 */
function getFormData() {
    const leaveType = state.leaveType === '其他' 
        ? elements.customType.value.trim() || '其他'
        : state.leaveType;

    return {
        applicantName: document.getElementById('applicantName').value.trim(),
        department: document.getElementById('department').value.trim(),
        approverName: document.getElementById('approverName').value.trim(),
        approverTitle: document.getElementById('approverTitle').value.trim(),
        leaveType: leaveType,
        startTime: elements.startTime.value,
        endTime: elements.endTime.value,
        leaveReason: document.getElementById('leaveReason').value.trim(),
        remarks: document.getElementById('remarks').value.trim()
    };
}

/**
 * 计算请假时长
 */
function calculateDuration(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = Math.round(diffHours % 24);

    if (diffDays === 0 && remainingHours === 0) {
        return '不足1小时';
    }

    let result = '';
    if (diffDays > 0) {
        result += `${diffDays}天`;
    }
    if (remainingHours > 0) {
        result += `${remainingHours}小时`;
    }
    return result;
}

/**
 * 格式化日期时间显示
 */
function formatDateTime(dateTimeStr) {
    const date = new Date(dateTimeStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

/**
 * 生成请假条文本
 */
function generateLeaveText(data) {
    const duration = calculateDuration(data.startTime, data.endTime);
    const deptText = data.department ? `（${data.department}）` : '';
    const titleText = data.approverTitle ? `（${data.approverTitle}）` : '';
    const remarksText = data.remarks ? `\n\n备注：${data.remarks}` : '';

    const text = `请假条

尊敬的${data.approverName}${titleText}：

    您好！

    我是${data.applicantName}${deptText}，因${data.leaveReason}，需申请${data.leaveType}。请假时间从${formatDateTime(data.startTime)}至${formatDateTime(data.endTime)}，共计${duration}。

    在请假期间，我会妥善安排好工作，确保不影响团队正常运转。如有紧急事项，可通过手机联系我。

    恳请批准！${remarksText}

此致
敬礼！

                                            请假人：${data.applicantName}
                                            日期：${formatDateTime(new Date().toISOString()).split(' ')[0]}`;

    return text;
}

/**
 * 更新预览
 */
function updatePreview() {
    const data = getFormData();
    state.formData = data;

    // 检查是否有必填字段
    if (!data.applicantName || !data.approverName || !data.startTime || !data.endTime || !data.leaveReason) {
        elements.previewContainer.innerHTML = `
            <div class="empty-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p>请完善表单信息，预览将自动更新</p>
            </div>
        `;
        return;
    }

    const duration = calculateDuration(data.startTime, data.endTime);
    const deptText = data.department ? `<span class="highlight">${escapeHtml(data.department)}</span>` : '';
    const titleText = data.approverTitle ? `（${escapeHtml(data.approverTitle)}）` : '';
    const remarksHtml = data.remarks ? `<p>备注：${escapeHtml(data.remarks)}</p>` : '';

    const previewHtml = `
        <div class="leave-card" id="leaveCard">
            <div class="card-header">
                <div class="card-title">请 假 条</div>
                <div class="card-subtitle">LEAVE APPLICATION</div>
            </div>
            <div class="card-content">
                <div class="card-salutation">尊敬的<span class="highlight">${escapeHtml(data.approverName)}</span>${titleText}：</div>
                <div class="card-body">
                    <p>您好！</p>
                    <p>我是${deptText}的<span class="highlight">${escapeHtml(data.applicantName)}</span>，因${escapeHtml(data.leaveReason)}，需申请<span class="highlight">${escapeHtml(data.leaveType)}</span>。</p>
                    <p>请假时间从<span class="highlight">${escapeHtml(formatDateTime(data.startTime))}</span>至<span class="highlight">${escapeHtml(formatDateTime(data.endTime))}</span>，共计<span class="highlight">${escapeHtml(duration)}</span>。</p>
                    <p>在请假期间，我会妥善安排好工作，确保不影响团队正常运转。如有紧急事项，可通过手机联系我。</p>
                    <p>恳请批准！</p>
                    ${remarksHtml}
                </div>
                <div class="card-footer">
                    <div class="signature">
                        <div class="signature-line">此致</div>
                        <div class="signature-line" style="margin-bottom: 20px;">敬礼！</div>
                        <div class="signature-line">请假人：<span class="highlight">${escapeHtml(data.applicantName)}</span></div>
                        <div class="signature-line">日期：${escapeHtml(formatDateTime(new Date().toISOString()).split(' ')[0])}</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    elements.previewContainer.innerHTML = previewHtml;
    state.generatedText = generateLeaveText(data);
}

/**
 * 生成图片
 */
async function generateImage() {
    const data = getFormData();
    
    // 验证必填字段
    if (!data.applicantName || !data.approverName || !data.startTime || !data.endTime || !data.leaveReason) {
        showToast('请填写完整的请假信息');
        // 滚动到第一个空字段
        const firstEmpty = elements.form.querySelector('input:invalid, textarea:invalid');
        if (firstEmpty) {
            firstEmpty.focus();
            firstEmpty.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    if (new Date(data.endTime) <= new Date(data.startTime)) {
        showToast('结束时间必须晚于开始时间');
        elements.endTime.focus();
        return;
    }

    elements.loadingOverlay.classList.add('show');

    try {
        const canvas = await renderCardToCanvas();
        state.generatedImage = canvas.toDataURL('image/png', 1.0);
        
        // 显示生成的图片
        elements.generatedImageContainer.innerHTML = `<img src="${state.generatedImage}" alt="请假条" loading="lazy">`;
        
        elements.loadingOverlay.classList.remove('show');
        elements.shareModal.classList.add('show');
        
        // 移动端禁止背景滚动
        if (state.isTouchDevice) {
            document.body.style.overflow = 'hidden';
        }
    } catch (error) {
        console.error('生成图片失败:', error);
        elements.loadingOverlay.classList.remove('show');
        showToast('图片生成失败，请重试');
    }
}

/**
 * 将卡片渲染到Canvas
 */
function renderCardToCanvas() {
    return new Promise((resolve, reject) => {
        const card = document.getElementById('leaveCard');
        if (!card) {
            reject(new Error('找不到卡片元素'));
            return;
        }

        const canvas = elements.canvas;
        const ctx = canvas.getContext('2d');
        
        // 根据设备像素比设置高分辨率
        const dpr = Math.min(window.devicePixelRatio || 1, 3);
        const width = 600;
        const height = 800;
        
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        // 白色背景
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // 顶部装饰条
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#1a365d');
        gradient.addColorStop(1, '#2c5282');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, 12);

        // 标题
        ctx.font = 'bold 36px "Noto Serif SC", serif';
        ctx.fillStyle = '#1a365d';
        ctx.textAlign = 'center';
        ctx.fillText('请 假 条', width / 2, 70);

        // 副标题
        ctx.font = '14px "Noto Sans SC", sans-serif';
        ctx.fillStyle = '#718096';
        ctx.fillText('LEAVE APPLICATION', width / 2, 95);

        // 分隔线
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(60, 115);
        ctx.lineTo(width - 60, 115);
        ctx.stroke();

        const data = state.formData;
        const duration = calculateDuration(data.startTime, data.endTime);
        const deptText = data.department ? `（${data.department}）` : '';
        const titleText = data.approverTitle ? `（${data.approverTitle}）` : '';

        // 正文内容
        let y = 160;
        const lineHeight = 32;
        const textIndent = 80;

        ctx.font = '16px "Noto Serif SC", serif';
        ctx.fillStyle = '#2d3748';
        ctx.textAlign = 'left';

        // 称呼
        ctx.fillText(`尊敬的${data.approverName}${titleText}：`, 60, y);
        y += lineHeight * 1.5;

        // 正文段落
        ctx.fillText('您好！', textIndent, y);
        y += lineHeight;

        // 主体内容
        const mainText = `我是${deptText}的${data.applicantName}，因${data.leaveReason}，需申请${data.leaveType}。`;
        wrapText(ctx, mainText, textIndent, y, width - 140, lineHeight);
        y += lineHeight * 2;

        const timeText = `请假时间从${formatDateTime(data.startTime)}至${formatDateTime(data.endTime)}，共计${duration}。`;
        wrapText(ctx, timeText, textIndent, y, width - 140, lineHeight);
        y += lineHeight * 2;

        const workText = '在请假期间，我会妥善安排好工作，确保不影响团队正常运转。如有紧急事项，可通过手机联系我。';
        wrapText(ctx, workText, textIndent, y, width - 140, lineHeight);
        y += lineHeight * 2;

        ctx.fillText('恳请批准！', textIndent, y);
        y += lineHeight;

        // 备注
        if (data.remarks) {
            y += lineHeight * 0.5;
            ctx.fillText(`备注：${data.remarks}`, textIndent, y);
            y += lineHeight;
        }

        // 结尾
        y += lineHeight * 2;
        ctx.fillText('此致', width - 180, y);
        y += lineHeight;
        ctx.fillText('敬礼！', width - 180, y);

        // 签名
        y += lineHeight * 2;
        ctx.textAlign = 'right';
        ctx.fillText(`请假人：${data.applicantName}`, width - 80, y);
        y += lineHeight;
        ctx.fillText(`日期：${formatDateTime(new Date().toISOString()).split(' ')[0]}`, width - 80, y);

        resolve(canvas);
    });
}

/**
 * 自动换行文本
 */
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const chars = text.split('');
    let line = '';
    let testLine = '';
    let lineArray = [];

    for (let n = 0; n < chars.length; n++) {
        testLine = line + chars[n];
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lineArray.push(line);
            line = chars[n];
        } else {
            line = testLine;
        }
    }
    lineArray.push(line);

    for (let k = 0; k < lineArray.length; k++) {
        ctx.fillText(lineArray[k], x, y + k * lineHeight);
    }
}

/**
 * 重置表单
 */
function resetForm() {
    elements.form.reset();
    elements.leaveTypeBtns.forEach(b => b.classList.remove('active'));
    elements.leaveTypeBtns[0].classList.add('active');
    state.leaveType = '事假';
    elements.customTypeInput.classList.remove('show');
    elements.durationDisplay.classList.remove('show');
    setDefaultDateTime();
    updatePreview();
    showToast('表单已重置');

    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 关闭模态框
 */
function closeModal() {
    elements.shareModal.classList.remove('show');
    
    // 恢复背景滚动
    document.body.style.overflow = '';
}

/**
 * 下载图片
 */
function downloadImage() {
    if (!state.generatedImage) return;

    const link = document.createElement('a');
    link.download = `请假条_${state.formData.applicantName}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = state.generatedImage;
    
    // 移动端使用新窗口打开
    if (state.isTouchDevice) {
        const newWindow = window.open();
        if (newWindow) {
            // 使用 DOM API 安全地构建页面内容，避免 XSS
            newWindow.document.title = '请假条 - 长按保存图片';
            
            const body = newWindow.document.body;
            body.style.margin = '0';
            body.style.display = 'flex';
            body.style.justifyContent = 'center';
            body.style.alignItems = 'center';
            body.style.minHeight = '100vh';
            body.style.background = '#f0f0f0';
            
            const container = newWindow.document.createElement('div');
            container.style.textAlign = 'center';
            container.style.padding = '20px';
            
            const hint = newWindow.document.createElement('p');
            hint.textContent = '长按图片保存到相册';
            hint.style.color = '#666';
            hint.style.marginBottom = '20px';
            hint.style.fontSize = '16px';
            
            const img = newWindow.document.createElement('img');
            img.src = state.generatedImage;
            img.style.maxWidth = '100%';
            img.style.borderRadius = '8px';
            img.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
            
            container.appendChild(hint);
            container.appendChild(img);
            body.appendChild(container);
            
            showToast('请长按图片保存');
        } else {
            // 如果弹窗被阻止，直接下载
            link.click();
            showToast('图片已保存');
        }
    } else {
        link.click();
        showToast('图片已保存');
    }
}

/**
 * 复制文本
 */
async function copyText() {
    try {
        await navigator.clipboard.writeText(state.generatedText);
        showToast('文本已复制到剪贴板');
    } catch (err) {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = state.generatedText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            showToast('文本已复制到剪贴板');
        } catch (e) {
            showToast('复制失败，请手动复制');
        }
        
        document.body.removeChild(textArea);
    }
}

/**
 * 发送邮件
 */
function sendEmail() {
    const data = state.formData;
    const subject = encodeURIComponent(`请假申请 - ${data.applicantName} - ${data.leaveType}`);
    const body = encodeURIComponent(state.generatedText);
    
    // 检测是否支持mailto
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
    
    // 尝试打开邮件客户端
    window.location.href = mailtoLink;
    
    // 延迟检查是否成功
    setTimeout(() => {
        showToast('已尝试打开邮件客户端');
    }, 500);
}

/**
 * 显示Toast提示
 */
function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    
    // 使用 visibilityState 确保页面可见时才显示
    if (document.visibilityState === 'hidden') {
        elements.toast.classList.remove('show');
        return;
    }
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// 初始化应用
document.addEventListener('DOMContentLoaded', init);

// 页面可见性变化处理
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // 页面重新可见时更新预览
        updatePreview();
    }
});
