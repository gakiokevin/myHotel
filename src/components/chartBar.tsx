// components/ChartBar.tsx
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip
);

interface ChartBarProps {
  data: {
    date: string;
    value: number;
    displayValue: string;
  }[];
  color: string;
  isLoading?: boolean;
}

export const ChartBar = ({ data, color, isLoading }: ChartBarProps) => {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
          <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
          <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [{
      data: data.map(item => item.value),
      backgroundColor: color,
      borderColor: color,
      borderWidth: 1,
      barPercentage: 0.8,
      categoryPercentage: 0.8,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const item = data[context.dataIndex];
            return item.displayValue;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxRotation: 0,
          minRotation: 0
        }
      },
      y: {
        beginAtZero: true,
        grid: { display: true },
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};