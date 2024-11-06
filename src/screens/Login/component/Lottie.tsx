import React, { useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import LottieLogo from '../../../assets/lottie/logo.json';
import Loading from '../../../assets/lottie/loading.json';
/*
const firstLoopSegment: [number, number] = [0, 300];
const secondLoopSegment: [number, number] = [300, 803];

interface LottieProps {
  animationData: any;
}

const Lottie = ({ animationData }: LottieProps) => {
  const element = useRef<HTMLDivElement>(null);
  const lottieInstance = useRef<any>();

  useEffect(() => {
    if (element.current) {
      lottieInstance.current?.destroy();
      lottieInstance.current = lottie.loadAnimation({
        container: element.current,
        renderer: 'svg',
        loop: true,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice',
        },
        animationData: animationData,
      });
    }
    lottieInstance.current.playSegments([firstLoopSegment, secondLoopSegment], true);
    return () => {
      lottieInstance.current?.destroy();
      lottieInstance.current = null;
    };
  }, [animationData]);

  return <div style={{ height: '100%', width: '100%' }} ref={element} />;
};
*/
export let LogoLottie = () => {
  return <Lottie animationData={LottieLogo} />;
};
export let LoadingLottie = () => {
  return <Lottie animationData={Loading} />;
};
export default Lottie;
