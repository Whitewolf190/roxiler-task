import React, { useState, useEffect } from "react";
import { useMonth } from "../context/MonthContext";
import "../styles/TransactionsList.css";
import MonthSelector from "./MonthSelector";
import Statistics from "./Statistics";
const TransactionsList = () => {
  const { month, setMonth } = useMonth();
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(5); 

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/list?month=${month}&search=${search}&page=${page}&perPage=${perPage}`
        );
        const data = await response.json();
        setTransactions(data.transactions);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, [month, search, page, perPage]);

  // const handleMonthChange = (event) => {
  //     setMonth(parseInt(event.target.value, 10));
  //     setPage(1); // Reset to first page when month changes
  // };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div className="table-data">
      <div className="table-content">
      <h1 className="table-heading">Transactions List</h1>
     <span className="statistics"><Statistics/></span>
      </div>

     <div className="table-search">
     <input
        className="search"
        type="text"
        placeholder="Search transactions..."
        value={search}
        onChange={handleSearchChange}
        
      />
    <span className="month_span"><MonthSelector/></span>
     </div>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <tr key={transaction._id}>
                <td>{transaction.title}</td>
                <td>{transaction.description}</td>
                <td>${transaction.price}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No transactions found</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="table-content">
        <div className="table-pageContent">
          <p>Page:{page}</p>
          <p>PerPage:{perPage}</p>
        </div>
        <div className="table-buttons">
          <button className="prev" onClick={handlePreviousPage} disabled={page === 1}>
            Previous
          </button>
          <button className="next" onClick={handleNextPage} disabled={page === totalPages}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionsList;
