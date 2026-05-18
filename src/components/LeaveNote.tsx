/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { FileText, Eye, Clock, Download, Copy, Mail, RotateCcw, Image as ImageIcon, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/src/lib/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FormData {
  applicantName: string;
  department: string;
  approverName: string;
  approverTitle: string;
  leaveType: string;
  customType: string;
  startTime: string;
  endTime: string;
  leaveReason: string;
  remarks: string;
}

const leaveTypeKeys = ["personal", "sick", "annual", "compensatory", "marriage", "maternity", "bereavement", "other"] as const;

export default function LeaveNote() {
  const { language, t } = useLanguage();
  const isZh = language === "zh";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get leave types based on current language
  const leaveTypes = leaveTypeKeys.map(key => t.leaveNote.leaveTypes[key as keyof typeof t.leaveNote.leaveTypes]);

  const [formData, setFormData] = useState<FormData>({
    applicantName: "",
    department: "",
    approverName: "",
    approverTitle: "",
    leaveType: "",
    customType: "",
    startTime: "",
    endTime: "",
    leaveReason: "",
    remarks: "",
  });

  // Set default leave type when language changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      leaveType: t.leaveNote.leaveTypes.personal,
    }));
  }, [language, t.leaveNote.leaveTypes]);

  // Helper function to check if leave type is "Other"
  const isOtherLeaveType = useCallback((type: string) => {
    return type === t.leaveNote.leaveTypes.other;
  }, [t.leaveNote.leaveTypes]);

  // Theme state for preview and image generation
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  // Set default date time on mount
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const endTime = new Date(tomorrow);
    endTime.setHours(18, 0, 0, 0);

    const formatDateTimeLocal = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setFormData((prev) => ({
      ...prev,
      startTime: formatDateTimeLocal(tomorrow),
      endTime: formatDateTimeLocal(endTime),
    }));
  }, []);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateDuration = useCallback(() => {
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return "";
    }

    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = Math.round(diffHours % 24);

    if (diffDays === 0 && remainingHours === 0) {
      return isZh ? "不足1小时" : "Less than 1 hour";
    }

    let result = "";
    if (diffDays > 0) {
      result += `${diffDays}${isZh ? "天" : " days"}`;
    }
    if (remainingHours > 0) {
      result += `${diffDays > 0 ? " " : ""}${remainingHours}${isZh ? "小时" : " hours"}`;
    }
    return result;
  }, [formData.startTime, formData.endTime, isZh]);

  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return "";
    const date = new Date(dateTimeStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return isZh
      ? `${year}年${month}月${day}日 ${hours}:${minutes}`
      : `${year}/${month}/${day} ${hours}:${minutes}`;
  };

  const generateLeaveText = useCallback(() => {
    const duration = calculateDuration();
    const leaveType = isOtherLeaveType(formData.leaveType) ? formData.customType || t.leaveNote.leaveTypes.other : formData.leaveType;
    const deptText = formData.department ? `（${formData.department}）` : "";
    const titleText = formData.approverTitle ? `（${formData.approverTitle}）` : "";
    const remarksText = formData.remarks ? `\n\n${isZh ? "备注" : "Remarks"}：${formData.remarks}` : "";

    if (isZh) {
      return `请假条

尊敬的${formData.approverName}${titleText}：

    您好！我是${formData.department ? formData.department + "的" : ""}${formData.applicantName}${deptText}，因${formData.leaveReason}，需要申请${leaveType}。

    请假时间从${formatDateTime(formData.startTime)}至${formatDateTime(formData.endTime)}，共计${duration}。

    在此期间，我会妥善安排好工作交接，确保不影响团队正常运转。如有紧急情况，可通过手机联系我。

    恳请批准！${remarksText}

此致
敬礼！

申请人：${formData.applicantName}
日期：${new Date().toLocaleDateString("zh-CN")}`;
    } else {
      return `Leave Application

Dear ${formData.approverName}${titleText},

    I am ${formData.applicantName}${deptText} from ${formData.department || "our company"}. I am writing to request ${leaveType.toLowerCase()} leave due to ${formData.leaveReason}.

    The requested leave period is from ${formatDateTime(formData.startTime)} to ${formatDateTime(formData.endTime)}, totaling ${duration}.

    I will ensure proper handover of my responsibilities to minimize any impact on the team. You can reach me by phone for any urgent matters.

    Thank you for your consideration.${remarksText}

Sincerely,

${formData.applicantName}
${new Date().toLocaleDateString("en-US")}`;
    }
  }, [formData, calculateDuration, isZh]);

  const generateImage = async () => {
    if (!formData.applicantName || !formData.approverName || !formData.leaveReason) {
      alert(isZh ? "请填写必填项" : "Please fill in required fields");
      return;
    }

    setIsGenerating(true);

    const canvas = canvasRef.current;
    if (!canvas) {
      setIsGenerating(false);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsGenerating(false);
      return;
    }

    // Set canvas size
    canvas.width = 800;
    canvas.height = 1000;

    // Theme colors
    const bgColor = isDarkTheme ? "#1f1f21" : "#ffffff";
    const textColor = isDarkTheme ? "#ffffff" : "#1d1d1f";
    const textSecondary = isDarkTheme ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)";
    const textTertiary = isDarkTheme ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)";
    const dividerColor = isDarkTheme ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Top gradient line
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "#0071e3");
    gradient.addColorStop(1, "#2997ff");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, 4);

    // Content area
    const padding = 60;
    let y = padding + 20;

    // Title
    ctx.fillStyle = textColor;
    ctx.font = "400 36px 'Noto Serif SC', Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText(isZh ? "请假条" : "Leave Application", canvas.width / 2, y);
    y += 50;

    // Subtitle
    ctx.fillStyle = textSecondary;
    ctx.font = "12px Inter, sans-serif";
    ctx.fillText(isZh ? "LEAVE APPLICATION" : "OFFICIAL DOCUMENT", canvas.width / 2, y);
    y += 60;

    // Divider line
    ctx.strokeStyle = dividerColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(canvas.width - padding, y);
    ctx.stroke();
    y += 40;

    // Content
    const text = generateLeaveText();
    ctx.fillStyle = textTertiary;
    ctx.font = "16px 'Noto Serif SC', Georgia, serif";
    ctx.textAlign = "left";

    const lines = text.split("\n");
    const lineHeight = 32;
    const maxWidth = canvas.width - padding * 2;

    for (const line of lines) {
      if (y > canvas.height - padding) break;

      if (line.trim() === "") {
        y += lineHeight;
        continue;
      }

      if (line.startsWith("    ")) {
        // Indented paragraph
        const words = line.trim().split("");
        let currentLine = "    ";
        for (const word of words) {
          const testLine = currentLine + word;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && currentLine !== "    ") {
            ctx.fillText(currentLine, padding, y);
            y += lineHeight;
            currentLine = "    " + word;
          } else {
            currentLine = testLine;
          }
        }
        ctx.fillText(currentLine, padding, y);
        y += lineHeight;
      } else if (line.startsWith("申请人") || line.startsWith("日期") || line.startsWith("Dear") || line.startsWith("Sincerely")) {
        // Right-aligned signature
        ctx.textAlign = "right";
        ctx.fillStyle = textSecondary;
        ctx.fillText(line, canvas.width - padding, y);
        ctx.textAlign = "left";
        ctx.fillStyle = textTertiary;
        y += lineHeight;
      } else {
        ctx.fillText(line, padding, y);
        y += lineHeight;
      }
    }

    // Generate image
    const dataUrl = canvas.toDataURL("image/png");
    setGeneratedImage(dataUrl);
    setShowModal(true);
    setIsGenerating(false);
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.download = `leave-note-${Date.now()}.png`;
    link.href = generatedImage;
    link.click();
  };

  const copyText = () => {
    const text = generateLeaveText();
    navigator.clipboard.writeText(text);
    alert(isZh ? "已复制到剪贴板" : "Copied to clipboard");
  };

  const sendEmail = () => {
    const subject = isZh ? "请假申请" : "Leave Application";
    const body = generateLeaveText();
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const resetForm = () => {
    setFormData({
      applicantName: "",
      department: "",
      approverName: "",
      approverTitle: "",
      leaveType: "事假",
      customType: "",
      startTime: "",
      endTime: "",
      leaveReason: "",
      remarks: "",
    });
  };

  const duration = calculateDuration();
  const previewTextPrimary = isDarkTheme ? "text-white/90" : "text-gray-900";
  const previewTextSecondary = isDarkTheme ? "text-white/70" : "text-gray-600";
  const previewTextMuted = isDarkTheme ? "text-white/50" : "text-gray-500";
  const previewTitleStrong = isDarkTheme ? "text-white" : "text-gray-900";
  const previewBorder = isDarkTheme ? "border-white/10" : "border-black/10";
  const previewEmptyText = isDarkTheme ? "text-white/40" : "text-gray-500";

  return (
    <section id="leave-note" className="py-20 md:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4">
            {isZh ? "专业 · 规范 · 高效" : "Professional · Standard · Efficient"}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            {isZh ? "智能请假条生成器" : "Smart Leave Note Generator"}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {isZh
              ? "一键生成规范、专业的请假条，支持导出图片和文本分享"
              : "Generate professional leave notes with one click, export as image or text"}
          </p>
        </motion.div>

        {/* Form Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Form Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  {isZh ? "表单信息" : "Form Information"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Applicant Info */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      {isZh ? "请假人姓名" : "Applicant Name"}
                      <span className="text-primary ml-1">*</span>
                    </Label>
                    <Input
                      value={formData.applicantName}
                      onChange={(e) => handleInputChange("applicantName", e.target.value)}
                      placeholder={isZh ? "请输入您的姓名" : "Your name"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isZh ? "所属部门" : "Department"}</Label>
                    <Input
                      value={formData.department}
                      onChange={(e) => handleInputChange("department", e.target.value)}
                      placeholder={isZh ? "如：技术部" : "e.g. Engineering"}
                    />
                  </div>
                </div>

                {/* Approver Info */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      {isZh ? "审批人姓名" : "Approver Name"}
                      <span className="text-primary ml-1">*</span>
                    </Label>
                    <Input
                      value={formData.approverName}
                      onChange={(e) => handleInputChange("approverName", e.target.value)}
                      placeholder={isZh ? "请输入审批人姓名" : "Approver's name"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isZh ? "审批人职位" : "Approver Title"}</Label>
                    <Input
                      value={formData.approverTitle}
                      onChange={(e) => handleInputChange("approverTitle", e.target.value)}
                      placeholder={isZh ? "如：部门经理" : "e.g. Manager"}
                    />
                  </div>
                </div>

                {/* Leave Type */}
                <div className="space-y-2">
                  <Label>
                    {isZh ? "请假类型" : "Leave Type"}
                    <span className="text-primary ml-1">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {leaveTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => handleInputChange("leaveType", type)}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${
                          formData.leaveType === type
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  {isOtherLeaveType(formData.leaveType) && (
                    <Input
                      value={formData.customType}
                      onChange={(e) => handleInputChange("customType", e.target.value)}
                      placeholder={isZh ? "请输入请假类型" : "Enter leave type"}
                      className="mt-2"
                    />
                  )}
                </div>

                {/* Date Time */}
                <div className="space-y-2">
                  <Label>
                    {isZh ? "请假时间" : "Leave Period"}
                    <span className="text-primary ml-1">*</span>
                  </Label>
                  <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-2 items-center">
                    <Input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange("startTime", e.target.value)}
                    />
                    <span className="text-muted-foreground text-center hidden sm:block">
                      {isZh ? "至" : "to"}
                    </span>
                    <Input
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange("endTime", e.target.value)}
                    />
                  </div>
                  {duration && (
                    <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 px-3 py-2 rounded-md">
                      <Clock className="w-4 h-4" />
                      <span>
                        {isZh ? "共计" : "Total"} {duration}
                      </span>
                    </div>
                  )}
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <Label>
                    {isZh ? "请假事由" : "Reason"}
                    <span className="text-primary ml-1">*</span>
                  </Label>
                  <Textarea
                    value={formData.leaveReason}
                    onChange={(e) => handleInputChange("leaveReason", e.target.value)}
                    placeholder={isZh ? "请详细描述请假原因..." : "Describe your reason..."}
                    rows={3}
                  />
                </div>

                {/* Remarks */}
                <div className="space-y-2">
                  <Label>{isZh ? "备注（选填）" : "Remarks (Optional)"}</Label>
                  <Input
                    value={formData.remarks}
                    onChange={(e) => handleInputChange("remarks", e.target.value)}
                    placeholder={isZh ? "其他需要说明的事项" : "Additional notes"}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preview Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    {isZh ? "实时预览" : "Live Preview"}
                  </CardTitle>
                  {/* Theme Toggle */}
                  <button
                    onClick={() => setIsDarkTheme(!isDarkTheme)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors text-sm"
                    title={isZh ? "切换主题" : "Toggle Theme"}
                  >
                    {isDarkTheme ? (
                      <>
                        <Moon className="w-4 h-4" />
                        <span className="hidden sm:inline">{isZh ? "深色" : "Dark"}</span>
                      </>
                    ) : (
                      <>
                        <Sun className="w-4 h-4" />
                        <span className="hidden sm:inline">{isZh ? "浅色" : "Light"}</span>
                      </>
                    )}
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`${isDarkTheme 
                  ? "bg-gradient-to-br from-[#2a2a2c] to-[#1f1f21] text-white/90" 
                  : "bg-gradient-to-br from-[#f5f5f7] to-[#ffffff] text-gray-900"
                } rounded-lg p-6 md:p-8 relative overflow-hidden transition-colors duration-300`}>
                  {/* Top gradient line */}
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary to-primary/70" />

                  {formData.applicantName ? (
                    <div className={`font-serif ${previewTextPrimary} leading-relaxed whitespace-pre-wrap`}>
                      <div className={`text-center mb-6 pb-4 border-b ${previewBorder}`}>
                        <h3 className="text-2xl font-normal mb-1">
                          {isZh ? "请假条" : "Leave Application"}
                        </h3>
                        <p className={`text-xs ${previewTextMuted} tracking-widest uppercase`}>
                          {isZh ? "Leave Application" : "Official Document"}
                        </p>
                      </div>

                      <div className="space-y-4 text-sm md:text-base">
                        <p className={`font-semibold ${previewTitleStrong}`}>
                          {isZh ? "尊敬的" : "Dear "}
                          {formData.approverName || "..."}
                          {formData.approverTitle ? `（${formData.approverTitle}）` : ""}
                          {isZh ? "：" : ","}
                        </p>

                        <p className="pl-4">
                          {isZh ? "您好！我是" : "I am "}
                          {formData.department ? `${formData.department}${isZh ? "的" : " from "}` : ""}
                          {formData.applicantName || "..."}
                          {formData.department ? `（${formData.department}）` : ""}
                          {isZh ? "，因" : ", writing to request "}
                          {formData.leaveReason ? `${isZh ? "" : "leave due to "}${formData.leaveReason}` : "..."}
                          {isZh ? "，需要申请" : "."}
                          {isZh && (
                            <>
                              {isOtherLeaveType(formData.leaveType) ? formData.customType || t.leaveNote.leaveTypes.other : formData.leaveType}
                              {"。"}
                            </>
                          )}
                        </p>

                        {(formData.startTime || formData.endTime) && (
                          <p className="pl-4">
                            {isZh
                              ? `请假时间从${formData.startTime ? formatDateTime(formData.startTime) : "..."}至${formData.endTime ? formatDateTime(formData.endTime) : "..."}，共计${duration || "..."}。`
                              : `Leave period: ${formData.startTime ? formatDateTime(formData.startTime) : "..."} to ${formData.endTime ? formatDateTime(formData.endTime) : "..."}, totaling ${duration || "..."}.`}
                          </p>
                        )}

                        <p className={`pl-4 ${previewTextSecondary}`}>
                          {isZh
                            ? "在此期间，我会妥善安排好工作交接，确保不影响团队正常运转。如有紧急情况，可通过手机联系我。"
                            : "I will ensure proper handover of my responsibilities. You can reach me by phone for urgent matters."}
                        </p>

                        <p className="pl-4">
                          {isZh ? "恳请批准！" : "Thank you for your consideration."}
                        </p>

                        {formData.remarks && (
                          <p className={`pl-4 ${previewTextSecondary}`}>
                            {isZh ? "备注：" : "Remarks: "}
                            {formData.remarks}
                          </p>
                        )}

                        <div className={`text-right mt-8 space-y-1 ${previewTextSecondary} text-sm`}>
                          <p>
                            {isZh ? "申请人：" : "Sincerely,"} {formData.applicantName || "..."}
                          </p>
                          <p>{new Date().toLocaleDateString(isZh ? "zh-CN" : "en-US")}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`text-center py-12 ${previewEmptyText}`}>
                      <FileText className="w-16 h-16 mx-auto mb-4 opacity-40" />
                      <p>{isZh ? "请完善表单信息，预览将自动更新" : "Fill in the form to see preview"}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={resetForm} className="flex-1">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {isZh ? "重置" : "Reset"}
                  </Button>
                  <Button onClick={generateImage} disabled={isGenerating} className="flex-1">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    {isGenerating
                      ? isZh ? "生成中..." : "Generating..."
                      : isZh ? "生成图片" : "Generate Image"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Result Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isZh ? "分享请假条" : "Share Leave Note"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {generatedImage && (
              <div className="rounded-lg overflow-hidden border">
                <img src={generatedImage} alt="Generated leave note" className="w-full" />
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" onClick={downloadImage} className="flex flex-col items-center gap-2 h-auto py-4">
                <Download className="w-5 h-5" />
                <span className="text-xs">{isZh ? "保存图片" : "Download"}</span>
              </Button>
              <Button variant="outline" onClick={copyText} className="flex flex-col items-center gap-2 h-auto py-4">
                <Copy className="w-5 h-5" />
                <span className="text-xs">{isZh ? "复制文本" : "Copy Text"}</span>
              </Button>
              <Button variant="outline" onClick={sendEmail} className="flex flex-col items-center gap-2 h-auto py-4">
                <Mail className="w-5 h-5" />
                <span className="text-xs">{isZh ? "邮件发送" : "Email"}</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
