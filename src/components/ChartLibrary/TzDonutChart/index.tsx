import React, { useRef, useEffect} from 'react';
import { getUid } from '../../../helpers/until';
import './index.scss';
export interface ChartData {
  title: string;
  value: number;
  fillColor?: string;
}

interface TzDonutChartProps {
  height?: number;
  width?: number;
  className?:string;
  data: ChartData[]|undefined;
  onClick?:()=>void
}

const TzDonutChart = (props: TzDonutChartProps) => {
  let chartId=useRef('c_'+getUid())
  useEffect(() => {
    const data = props?.data;
    if (!data||data.length===0) return;
    $(`#${ chartId.current}`).children().remove()
    let chart = new (window as any).G2.Chart({
      container: chartId.current,
      autoFit: true,
      height: props.height|| 300,
      theme: {
        colors10: data.map(item => item?.fillColor)
      }
    });
    chart.coordinate('theta', {
      radius: 1,
      innerRadius: 0.8
    });
    let innerView = chart.createView();
    chart.data(data);
    chart.legend(false);
    chart.tooltip(false);
    let p=data.reduce((sum,item)=>sum+=item.value,0)===0?'0%':(data[1].value*100/data.reduce((sum,item)=>sum+=item.value,0)).toFixed(0)+'%'
    innerView.annotation()
      .text({
        position: ['50%', '50%'],
        content:p ,
        style: {
          fontSize: 18,
          fill: data[1].fillColor,
          textAlign: 'center'
        },
      });
    chart
      .interval()
      .position('value')
      .adjust('stack')
      .color('title')
      .style({
        opacity: 1,
        lineCap: 'round'
      });
    chart.render();
  }, [props]);
  return (
    <>
      <div id={chartId.current} style={{width:'70px'}} onClick={()=>{
        props?.onClick&&props?.onClick()
      }}></div>
    </>
  );
};
export default TzDonutChart;