import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import axios from 'axios';
import { useMonth } from '../context/MonthContext.jsx'; 
import '../styles/PriceRangeList.css'
import CategoryPieChart from './PieChart.jsx';

const PriceRangeChart = () => {
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  const { month } = useMonth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/price-range-stats?month=${month}`);
        const data = response.data;

        const labels = data.map((item) => item.range);
        const counts = data.map((item) => item.count);

        if (chartInstance) {
          chartInstance.destroy(); 
        }

        const ctx = chartRef.current.getContext('2d');
        const newChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: `Number of Items Sold in ${getMonthName(month)}`,
                data: counts,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });

        setChartInstance(newChartInstance);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [month]); 

  const getMonthName = (monthNumber) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[monthNumber - 1];
  };

  return (
    <div className='range'>
    <div style={{width:'800px'}} className='price-range'>
        <h1>Dashboard</h1>
    <canvas className='bar-chart' ref={chartRef}></canvas>
      
    </div>
    <div className="pie-chart"><CategoryPieChart/></div>
    </div>
  );
};

export default PriceRangeChart;
