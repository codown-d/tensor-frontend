import { keys } from 'lodash';
import { translations } from '../../../../translations/translations';

export const SCOPE_KINDS_ENUM: Record<string, string> = {
  scene: translations.object_type,
  cluster: translations.compliances_cronjobs_selectCluster,
  hostname: translations.vulnerabilityDetails_nodeName,
  namespace: translations.scanner_listColumns_namespace,
  resource: translations.resources,
  pod: 'Pod',
  container: translations.onlineVulnerability_innerShapeMeaning,
  registry: translations.library,
  repo: translations.scanner_detail_image + 'repo',
  tag: translations.image_tag,
};
export const SCOPE_KINDS = keys(SCOPE_KINDS_ENUM).map((key) => ({
  label: SCOPE_KINDS_ENUM[key],
  value: key,
}));
