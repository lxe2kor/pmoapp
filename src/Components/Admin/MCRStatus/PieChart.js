import React, { useMemo } from 'react';
import {Chart, ArcElement, Tooltip, Legend} from 'chart.js'
import { Pie } from 'react-chartjs-2';

const PieChart = ({ result1, result2 }) => {
    Chart.register(ArcElement, Tooltip, Legend);

  const chartData = useMemo(() => {
    if (!result1 || !result2) return null;


    const billedCount = result1.filter(employee => employee.hours === '156').length;
    const partiallyBilledCount = result1.filter(employee => employee.hours < '156' && employee.hours > '0').length;
    const unbilledCount = result2.length;

    const totalCount = result1.length + result2.length;
    const billedPercent = (billedCount / totalCount) * 100;
    const partiallyBilledPercent = (partiallyBilledCount / totalCount) * 100;
    const unbilledPercent = (unbilledCount / totalCount) * 100;

    return {
      labels: ['Billed ' + billedPercent.toPrecision(4) + '%', 'Partially Billed ' + partiallyBilledPercent.toPrecision(4) + '%', 'Unbilled ' + unbilledPercent.toPrecision(4) + '%'],
      datasets: [
        {
          data: [billedPercent, partiallyBilledPercent, unbilledPercent],
          backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384'],
          hoverBackgroundColor: ['#36A2EB', '#FFCE56', '#FF6384']
        }
      ]
    };
  }, [result1, result2]);

  if (!chartData) {
    return null;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        enabled: true
      }
    }
  };

  return (
    <div className="col-md-6 border p-3">
        <div style={{ height: '450px', margin: '-5px auto' }}>
            <Pie data={chartData} options={options} />
        </div>
    </div>
  );
};

export default PieChart;
