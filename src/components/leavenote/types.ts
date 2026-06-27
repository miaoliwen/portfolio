/**
 * LeaveNote 组件 - 类型定义
 */

export interface FormData {
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

export const leaveTypeKeys = ["personal", "sick", "annual", "compensatory", "marriage", "maternity", "bereavement", "other"] as const;
