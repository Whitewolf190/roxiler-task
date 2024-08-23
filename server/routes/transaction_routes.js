const express = require('express');
const router = express.Router();
const connectDB = require("../config/db");

router.get('/seed', async (req, res) => {
    let client;
    try {
      const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
      const data = response.data;
  
      client = await connectDB();
      const db = client.db('transaction_db');
      const collection = db.collection('transactions');
  
      await collection.insertMany(data);
  
      res.status(200).json({ message: 'Database seeded successfully!' });
    } catch (error) {
      console.error('Error seeding the database:', error);
      res.status(500).json({ message: 'Failed to seed database' });
    } 
  });

router.get('/list', async (req, res) => {
    try {
      const client = await connectDB();
      const db = client.db('transaction_db');
      const collection = db.collection('transactions');
  
      const { search = '', page = 1, perPage = 1, month = 1 } = req.query;
  
      const pageNumber = parseInt(page, 10) || 1;
      const itemsPerPage = parseInt(perPage, 10) || 1;
      const monthNumber = parseInt(month, 10) || 1;
  
      const query = {
        $expr: { $eq: [{ $month: { $toDate: "$dateOfSale" } }, monthNumber] }
      };
  
      
      const allTransactions = await collection.find(query).toArray();
      
      const filteredTransactions = search
        ? allTransactions.filter((transaction) =>
            [transaction.title, transaction.description, transaction.price.toString(), transaction.category]
              .some(field => field.toLowerCase().includes(search.toLowerCase()))
          )
        : allTransactions;
  
  
      const transactionsToReturn = filteredTransactions.length > 0 ? filteredTransactions : allTransactions;
  
      
      const startIndex = (pageNumber - 1) * itemsPerPage;
      const paginatedTransactions = transactionsToReturn.slice(startIndex, startIndex + itemsPerPage);
  
      res.status(200).json({
        transactions: paginatedTransactions,
        totalTransactions: transactionsToReturn.length,
        totalPages: Math.ceil(transactionsToReturn.length / itemsPerPage),
        currentPage: pageNumber,
        perPage: itemsPerPage,
      });
    } catch (error) {
      console.error('Error listing transactions:', error);
      res.status(500).json({ message: 'Failed to retrieve transactions' });
    }
  });


router.get('/statistics',async (req, res) => {
    try {
        const client = await connectDB();
        const db = client.db('transaction_db');
        const collection = db.collection('transactions');

        const { month = 3 } = req.query;
        const monthNumber = parseInt(month, 10) || 3;

        const pipeline = [
            {
                $match: {
                    $expr: { $eq: [{ $month: { $toDate: "$dateOfSale" } }, monthNumber] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: { $cond: [{ $eq: ["$sold", true] }, "$price", 0] } },
                    soldItemsCount: { $sum: { $cond: [{ $eq: ["$sold", true] }, 1, 0] } },
                    notSoldItemsCount: { $sum: { $cond: [{ $eq: ["$sold", false] }, 1, 0] } }
                }
            }
        ];


        const [stats] = await collection.aggregate(pipeline).toArray();

        res.status(200).json({
            totalSales: stats ? stats.totalSales : 0,
            totalSoldItems: stats ? stats.soldItemsCount : 0,
            totalNotSoldItems: stats ? stats.notSoldItemsCount : 0
        });
    } catch (error) {
        console.error("Statistics API Error:", error);
        res.status(500).json({ message: "Failed to retrieve statistics" });
    }
});

router.get('/price-range-stats', async (req, res) => {
    try {
        const client = await connectDB();
        const db = client.db('transaction_db');
        const collection = db.collection('transactions');

        const { month = 3 } = req.query;
        const monthNumber = parseInt(month, 10) || 3;

        const priceRanges = [
            { range: '0-100', min: 0, max: 100 },
            { range: '101-200', min: 101, max: 200 },
            { range: '201-300', min: 201, max: 300 },
            { range: '301-400', min: 301, max: 400 },
            { range: '401-500', min: 401, max: 500 },
            { range: '501-600', min: 501, max: 600 },
            { range: '601-700', min: 601, max: 700 },
            { range: '701-800', min: 701, max: 800 },
            { range: '801-900', min: 801, max: 900 },
            { range: '901-above', min: 901, max: Infinity }
        ];

        const pipeline = [
            {
                $match: {
                    $expr: { $eq: [{ $month: { $toDate: "$dateOfSale" } }, monthNumber] }
                }
            },
            {
                $facet: priceRanges.reduce((acc, range) => {
                    acc[range.range] = [
                        {
                            $match: {
                                price: { $gte: range.min, $lt: range.max === Infinity ? Number.MAX_SAFE_INTEGER : range.max }
                            }
                        },
                        {
                            $count: "count"
                        }
                    ];
                    return acc;
                }, {})
            }
        ];

        const result = await collection.aggregate(pipeline).toArray();
        const stats = result[0];

        const response = priceRanges.map(range => ({
            range: range.range,
            count: stats[range.range][0] ? stats[range.range][0].count : 0
        }));

        res.status(200).json(response);
    } catch (error) {
        console.error("Error retrieving price range statistics:", error);
        res.status(500).json({ message: "Failed to retrieve price range statistics" });
    }
});

router.get('/category-stats', async (req, res) => {
    try {
        const client = await connectDB();
        const db = client.db('transaction_db');
        const collection = db.collection('transactions');

        const { month = 3 } = req.query;
        const monthNumber = parseInt(month, 10) || 3;

        const pipeline = [
            {
                $match: {
                    $expr: { $eq: [{ $month: { $toDate: "$dateOfSale" } }, monthNumber] }
                }
            },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            }
        ];


        const result = await collection.aggregate(pipeline).toArray();

  
        const response = result.map(item => ({
            category: item._id,
            count: item.count
        }));

        res.status(200).json(response);
    } catch (error) {
        console.error("Error retrieving category statistics:", error);
        res.status(500).json({ message: "Failed to retrieve category statistics" });
    }
});



module.exports = router;
