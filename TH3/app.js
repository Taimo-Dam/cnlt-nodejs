const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/myprojectdb")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

const UserSchema = new mongoose.Schema({
  name: String,
  email: String
});

const User = mongoose.model("User", UserSchema);

User.create({ name: "Alice", email: "alice@example.com" })
  .then(doc => console.log(doc))
  .catch(err => console.error(err));
const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('home', { title: 'Home', query: '', searchResults: [] });
});

app.get('/songs', (req, res) => {
  res.render('songs', { title: 'Songs', tracks: [] });
});

app.get('/albums', (req, res) => {
  res.render('albums', { title: 'Albums', albums: [] });
});

app.get('/artists', (req, res) => {
  res.render('artists', { title: 'Artists', artists: [] });
});

// search form post/get
app.get('/search', (req, res) => {
  const query = (req.query.query || '').trim();
  // sample filter data (no DB)
  const sample = [
    { name: 'Sunrise', artist: 'DJ Nova' },
    { name: 'Moonlight', artist: 'Luna' },
  ];
  const results = sample.filter(x => x.name.toLowerCase().includes(query.toLowerCase()) ||
                                     x.artist.toLowerCase().includes(query.toLowerCase()));
  res.render('home', { title: 'Search', query, searchResults: results });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`http://localhost:${port}`));