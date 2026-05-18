
export type HandwritingStyle = 'shoujin' | 'round' | 'cursive';

export interface DiaryEntry {
  id: string;
  content: string;
  date: string;
  style: HandwritingStyle;
  rotate: number; // For slight vintage misalignment
}
