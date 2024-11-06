import { keys, pick } from "lodash";
import { translations } from "../../translations/translations";
import { CiStatusEnum, statusSelectEnum } from "../ImagesScanner/ImagesCI/CI";

export const STATUSOP_ENUM = [
    {
      label: translations.confirm_modal_isopen,
      value: 'open',
    },
    {
      label: translations.deflectDefense_disabled,
      value: 'disable',
    },
    {
      label: translations.deflectDefense_ready,
      value: 'ready',
    },
  ]

export const MODEOP_ENUM = keys(pick(statusSelectEnum, [CiStatusEnum.alert, CiStatusEnum.block])).map(key => ({
    label: statusSelectEnum[key].label,
    value: key,
}))
  