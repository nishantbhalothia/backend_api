const mongoose = require('mongoose');

module.exports.db = async () => {
    try {
        mongoose.connection.on('connected', () => console.log('MongoDB connected'));
        mongoose.connection.on('open', () => console.log('open'));
        mongoose.connection.on('disconnected', () => console.log('disconnected'));
        mongoose.connection.on('reconnected', () => console.log('reconnected'));
        mongoose.connection.on('disconnecting', () => console.log('disconnecting'));
        mongoose.connection.on('close', () => console.log('close'));


        const connectionInstance = await mongoose.connect(`${process.env.DB_CONNECT}/${process.env.DATABASE_NAME}`)
        .then(() => console.log('Connected to DB'))
        .catch((err) => console.error('DB Connection error:', err));
        

    } catch (error) {
        console.error('DB Connection error:', error);
    }
};
