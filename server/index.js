const express = require('express');
const routes = require('./routes/transaction_routes');
const app = express();
var cors = require('cors')
app.use(express.json());
app.use(cors())

app.use('/api', routes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
