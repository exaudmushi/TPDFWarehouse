import React, { useMemo } from 'react';
import { getCssVariable } from '@/utils/getCssVariable';
import { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';

const OrdersChart = () => {
  const options: ApexOptions = useMemo(
    () => ({
      series: [
        {
          name: '',
          data: [36, 77, 52, 90, 74, 35, 55, 23, 47, 10, 63],
        },
      ],
      chart: {
        sparkline: {
          enabled: !0,
        },
      },
      colors: [getCssVariable('--bs-primary')],
      plotOptions: {
        bar: {
          borderRadius: 2,
          columnWidth: '60%',
        },
      },
      xaxis: {
        type: 'datetime',
        categories: [
          'Jan 01 2025',
          'Jan 02 2025',
          'Jan 03 2025',
          'Jan 04 2025',
          'Jan 05 2025',
          'Jan 06 2025',
          'Jan 07 2025',
          'Jan 08 2025',
          'Jan 09 2025',
          'Jan 10 2025',
          'Jan 11 2025',
        ],
      },
      yaxis: {
        min: 0,
        max: 90,
        tickAmount: 4,
        labels: {
          show: false,
        },
      },
    }),
    []
  );

  return <Chart options={options} series={options.series} type="bar" height={60} />;
};

export default React.memo(OrdersChart);
