import React, { useMemo } from 'react';
import { getCssVariable } from '@/utils/getCssVariable';
import { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';

const CustomersChart = () => {
  const options: ApexOptions = useMemo(
    () => ({
      series: [
        {
          name: '',
          data: [3844, 3855, 3841, 3867, 3822, 3843, 3821, 3841, 3856, 3827, 3843],
        },
      ],
      chart: {
        sparkline: {
          enabled: !0,
        },
      },
      colors: [getCssVariable('--bs-primary')],
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
        min: 3820,
        max: 3870,
        tickAmount: 4,
        labels: {
          show: false,
        },
      },
      stroke: {
        width: 2,
        curve: 'smooth',
      },
      markers: {
        size: 0,
      },
    }),
    []
  );

  return <Chart options={options} series={options.series} type="line" height={60} />;
};

export default React.memo(CustomersChart);
