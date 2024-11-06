import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;
import './index.scss';
import classNames from 'classnames';
import Link from 'antd/lib/typography/Link';
import Paragraph from 'antd/lib/typography/Paragraph';
import Title from 'antd/lib/typography/Title';

export type TzTypography = typeof Typography & {
  className?: string;
};

type TypographyProps = TzTypography & {
  Text: typeof Text;
  Link: typeof Link;
  Title: typeof Title;
  Paragraph: typeof Paragraph;
};

const TzTypography = React.forwardRef<HTMLElement, TypographyProps>(
  (props, ref) => {
    const componentClassName = classNames('tz-typography', props?.className);
    return <Typography {...props} ref={ref} className={componentClassName} />;
  }
) as TypographyProps;

TzTypography.Text = Text;
TzTypography.Link = Link;
TzTypography.Title = Title;
TzTypography.Paragraph = Paragraph;

export default TzTypography;
