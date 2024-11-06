import { Timeline, TimelineProps, TimelineItemProps } from 'antd';
import React, { useMemo } from 'react';

import './index.scss';

const { Item } = Timeline;

export const TzTimeline = (props: TimelineProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-timeline ${props.className || ''}`,
    };
  }, [props]);
  return <Timeline {...realProps} >
  </Timeline>;
};

export const TzTimelineItem = (props: TimelineItemProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-timeline-item ${props.className || ''}`,
    };
  }, [props]);
  return <Item {...realProps} />;
};

export interface TzTimelineNoramlType extends TimelineProps {
  timeList?: TimelineItemProps[];
}

export const TzTimelineNoraml = (props: TzTimelineNoramlType) => {
  const { timeList, ...stepsProps } = props;

  const _timeList = useMemo(() => {
    return timeList?.map((timeprops, index) => {
      return (
        <TzTimelineItem key={`${timeprops.label}_${index}`} {...timeprops} />
      );
    });
  }, [timeList]);
  return <TzTimeline {...stepsProps}>{_timeList}</TzTimeline>;
};
