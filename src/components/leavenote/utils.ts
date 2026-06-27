/**
 * LeaveNote 组件 - 工具函数
 */

export const formatDateTimeLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const getDefaultDates = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const endTime = new Date(tomorrow);
  endTime.setHours(18, 0, 0, 0);

  return {
    startTime: formatDateTimeLocal(tomorrow),
    endTime: formatDateTimeLocal(endTime),
  };
};

export const formatDisplayTime = (timeStr: string) => {
  if (!timeStr) return "";
  const date = new Date(timeStr);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
