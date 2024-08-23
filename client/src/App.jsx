import './App.css'

import MonthSelector from "./components/MonthSelector"
import PriceRangeChart from './components/PriceRangeChart'
import Statistics from './components/Statistics'
import TransactionsList from "./components/TransactionsList"
import { MonthProvider } from "./context/MonthContext"

function App() {

  return (
    <>
    <MonthProvider>
    <TransactionsList/>
    <PriceRangeChart/>
    </MonthProvider>
    
    </>
  )
}

export default App
