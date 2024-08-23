import { createContext, useState, useContext } from 'react';

const MonthContext = createContext();

export const MonthProvider = ({ children }) => {
    const [month, setMonth] = useState(3);

    return (
        <MonthContext.Provider value={{ month, setMonth }}>
            {children}
        </MonthContext.Provider>
    );
};

export const useMonth = () => useContext(MonthContext);
