import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from 'react';
import classNames from 'classnames';
import './GraphListSpace.scss';
import { TzSpace } from '../tz-space';
import { Resources } from '../../Resources';
import EllipsisPopover from '../ellipsisPopover/ellipsisPopover';
import { translations } from '../../translations/translations';

const mockData = [
  {
    num: 0,
    color: 'linear-gradient(233deg, #7C97FF 0%, #5C79FF 100%)',
    img: Resources.KubeServer,
    imgDes: 'server',
    txt: translations.kubeScan_serviceNum,
  },
  {
    num: 0,
    color: 'linear-gradient(90deg, #59CFFF 0%, #74D7FF 100%)',
    img: Resources.KubeNodes,
    imgDes: 'nodes',
    txt: translations.kubeScan_nodesNum,
  },
  {
    num: '0',
    color: 'linear-gradient(81deg, #52D4AD 0%, #5BEFBC 100%)',
    img: Resources.KubeLoophole,
    imgDes: 'loophole',
    txt: translations.kubeScan_vulnerabilitiesNum,
  },
];

const KubeSpace = (props?: any, ref?: any) => {
  const {
    assignData = [],
    assignType = [],
  }: { assignData: any[] | undefined; assignType: any[] | undefined } = props;

  const [overviewData, setOverviewData] = useState(mockData);

  useEffect(() => {
    if (assignData.length) {
      setOverviewData(assignData);
    }
  }, []);

  const setItme = useCallback(
    (iKey: number, item: number) => {
      const items = overviewData.slice(0);
      items[iKey].num = item;
      setOverviewData(items);
    },
    [overviewData]
  );

  const fetchData = useCallback(() => {
    assignType.map((t) => {
      setItme(t.ikey, t.num);
      return t;
    });
  }, [assignType]);

  useEffect(() => {
    fetchData();
  }, [fetchData, assignType]);

  const SpaceItems = useMemo(() => {
    return overviewData.map((t) => {
      return (
        <div
          className="space-item-case"
          style={{ background: t.color }}
          key={t.imgDes}
        >
          <div className="df dfjc dfdc">
            <span className="num-txt">{t.num}</span>
            <span className="des-txt">
              <EllipsisPopover>{t.txt}</EllipsisPopover>
            </span>
          </div>
          <div className="img-case">
            <img alt={t.imgDes} src={t.img} />
          </div>
        </div>
      );
    });
  }, [overviewData]);

  useImperativeHandle(
    ref,
    () => {
      return {
        show() {
        },
      };
    },
    []
  );

  return (
    <>
      <div className={classNames('graph-space-case', 'noScrollbar')}>
        <TzSpace align="center" size={[22, 20]} wrap={false}>
          {SpaceItems}
        </TzSpace>
      </div>
    </>
  );
};

export default forwardRef(KubeSpace);
