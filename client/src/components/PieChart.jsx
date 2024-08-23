import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import axios from 'axios';
import { useMonth } from '../context/MonthContext.jsx';

const CategoryPieChart = () => {
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  const { month } = useMonth(); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/category-stats?month=${month}`);
        const data = response.data;

        const labels = data.map(item => item.category);
        const counts = data.map(item => item.count);

        if (chartInstance) {
          chartInstance.destroy(); 
        }

        const ctx = chartRef.current.getContext('2d');
        const newChartInstance = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [{
              data: counts,
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              tooltip: {
                callbacks: {
                  label: (tooltipItem) => {
                    return `${tooltipItem.label}: ${tooltipItem.raw} items`;
                  }
                }
              }
            }
          }
        });

        setChartInstance(newChartInstance);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [month]);

  return (
    <div style={{width:'600px',height:'500px'}}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default CategoryPieChart;
