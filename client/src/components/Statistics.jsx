import React, { useEffect, useState } from 'react';
import { useMonth } from '../context/MonthContext';
import '../styles/Statistics.css'
const Statistics = () => {
    const { month } = useMonth();
    const [stats, setStats] = useState({ totalSales: 0, totalSoldItems: 0, totalNotSoldItems: 0 });

    useEffect(() => {
        fetch(`http://localhost:5000/api/statistics?month=${month}`)
            .then(response => response.json())
            .then(data => setStats(data))
            .catch(error => console.error('Error fetching statistics:', error));
    }, [month]);

    return (
        <div className='statistics-content'>
            <p>Total Sales: <span className="value">${stats.totalSales}</span></p>
            <p>Total Sold Items: <span className="value"> {stats.totalSoldItems}</span></p>
            <p>Total Not Sold Items: <span className="value">{stats.totalNotSoldItems}</span></p>
        </div>
    );
};

export default Statistics;
