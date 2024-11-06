import { translations } from '../../translations/translations';
import { OprBasicType, OprStopType } from './hooks/useLearnOpr';

type TLearningStatus = {
  label: string;
  type: string;
  oprKeys: (OprBasicType | OprStopType)[];
};
export const LEARNING_STATUS: TLearningStatus[] = [
  { label: translations.not_yet_learned, type: 'not_yet_learned', oprKeys: ['study'] },
  { label: translations.currently_learning, type: 'currently_learning', oprKeys: ['stop'] },
  { label: translations.not_effective, type: 'not_effective', oprKeys: ['study', 'enable'] },
  { label: translations.effective, type: 'effective', oprKeys: ['study', 'deactivate'] },
];
