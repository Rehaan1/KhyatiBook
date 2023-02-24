require('dotenv').config()
const cors = require('cors')
const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.use(cors())

mongoose.set("strictQuery", false);
// connect to MongoDB using mongoose
mongoose.connect(process.env.MONGODB_DB_URI, { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Could not connect to MongoDB', err));

// define mongoose schema
const bookRankSchema = new mongoose.Schema({
  bookName: { type: String, required: true },
  bookRank: { type: Number, required: true }
});

// define mongoose model
const BookRank = mongoose.model('BookRank', bookRankSchema);

// api endpoint to get all books and their ranks
app.get('/books', async (req, res) => {
    const books = await BookRank.find().sort({ bookRank: 1 }).limit(10);;
    res.send(books);
  });

// api endpoint to post a book and its rank
app.post('/books', async (req, res) => {
    const { bookName, bookRank } = req.body;

  // check if bookRank already exists
  const existingBook = await BookRank.findOne({ bookRank });

  if (existingBook) {
    // increment the ranks of all books with the same rank or higher
    await BookRank.updateMany({ bookRank: { $gte: bookRank } }, { $inc: { bookRank: 1 } });

    // create a new book with the given rank
    await BookRank.create({ bookName, bookRank });
  } else {
    // create a new book with the given rank
    await BookRank.create({ bookName, bookRank });
  }

  const books = await BookRank.find().sort({ bookRank: 1 }).limit(10);
  res.send(books);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
