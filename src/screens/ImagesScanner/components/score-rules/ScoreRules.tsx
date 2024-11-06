import React from 'react';
import EllipsisPopover from '../../../../components/ellipsisPopover/ellipsisPopover';
import { Resources } from '../../../../Resources';
import { translations } from '../../../../translations/translations';

interface IProps {
  children?: any;
}

const ScoreRules = (props: IProps) => {
  return (
    <div className="rule-case">
      <table className={'rules-table'}>
        <tr>
          <th>{translations.scoring_item}</th>
          <th>{translations.scoring_sub_item}</th>
          <th>{translations.score_deduction_value}</th>
          <th>{translations.maximum_points_deducted_for_this_item}</th>
        </tr>
        <tr>
          <td rowSpan={5}>
            <div >
              {translations.scanner_images_vulnerabilities}
            </div>
          </td>
          <td>
            <div>
              {translations.there_are_high_risk_vulnerabilities}
            </div>
          </td>

          <td>
            <div>25</div>
          </td>

          <td rowSpan={5}>
            <div>50</div>
          </td>
        </tr>
        <tr>
          <td>
            <div>
              {translations.vulnerability_exists}
            </div>
          </td>

          <td>
            <div>20</div>
          </td>
        </tr>
        <tr>
          <td>
            <div>
              {translations.there_are_medium_risk_vulnerabilities}
            </div>
          </td>

          <td>
            <div>15</div>
          </td>
        </tr>
        <tr>
          <td>
            <div>
              {translations.low_risk_vulnerability_exists}
            </div>
          </td>

          <td>
            <div>10</div>
          </td>
        </tr>
        <tr>
          <td>
            <div>
              {translations.unknown_vulnerability}
            </div>
          </td>
          <td>
            <div>5</div>
          </td>
        </tr>
        <tr>
          <td>
            {translations.scanner_images_sensitive}
          </td>
          <td>
            {translations.a_sensitive_file}
          </td>
          <td>
            5
          </td>
          <td>
            10
          </td>
        </tr>
        <tr>
          <td rowSpan={4}>
            {translations.malicious_threat}
          </td>
          <td>
            {translations.imageReject_has_malicious}
          </td>

          <td>40
          </td>
          <td rowSpan={4}>
            40
          </td>
        </tr>
        <tr>
          <td>
            {translations.unStandard.str65('9 - 10')}
          </td>
          <td>
            40
          </td>
        </tr>

        <tr>
          <td>
            {translations.unStandard.str65('6 - 8')}
          </td>
          <td>
            30
          </td>
        </tr>

        <tr>
          <td>
            {translations.unStandard.str65('4 - 6')}
          </td>
          <td>
            20
          </td>
        </tr>

      </table>
      <div className="foot-case">
        <span className="tit-txt">
          <img src={Resources.Bells} alt="!" className="bell" />
          {translations.score_description}
        </span>
        <span className="cont-txt">{translations.unStandard.str66}</span>
        <span className="cont-txt">{translations.unStandard.str67}</span>
        <span className="cont-txt">{translations.unStandard.str68}</span>
        <span className="cont-txt">{translations.unStandard.str69}</span>
      </div>
    </div>
  );
};

export default ScoreRules;
