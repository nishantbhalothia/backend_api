const express = require('express');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

const port = process.env.PORT || 4000;
const router = require('./routes/index');

// Connect to DB
async function connectToDB() {
    try {
        await mongoose.connect(`${process.env.DB_CONNECT}/${process.env.DATABASE_NAME}`, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to DB');
    } catch (error) {
        console.error('DB Connection error:', error);
    }
}

connectToDB();



// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// Import Routes
app.use('/', router);


// error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}
);