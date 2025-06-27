const express = require('express');
const cors = require('cors');  // <-- add this
const app = express();
require('dotenv').config();

const port = process.env.PORT;
const connectDB = require('./config/db');
const router = require('./routes/index.js');
const cookieParser = require('cookie-parser');

console.log('Cloud name:', process.env.CLOUD_NAME);
console.log('API key:', process.env.CLOUD_API_KEY);
console.log('API secret:', process.env.CLOUD_API_SECRET);
console.log('JWT_SECRET :', process.env.JWT_SECRET_KEY);

const clientUrl =process.env.CLIENT_DOMAIN
app.use(cors({
  origin: clientUrl,
credentials: true ,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api', router);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
});
