import React from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import ChartOne from '../components/Charts/ChartOne';
import ChartThree from '../components/Charts/ChartThree';
import ChartTwo from '../components/Charts/ChartTwo';

const Chart: React.FC = () => {
  return (
    <>
      <Breadcrumb pageName="Chart" />

      <div className="">
        <ChartTwo />
        <ChartOne />
        <ChartThree />
      </div>
    </>
  );
};

export default Chart;