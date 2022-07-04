const express = require('express');

const app = express();
const PORT = process.env.PORT || 5000;

// app.use(
//   express.urlencoded({
//     extended: true,
//   })
// );
//
// app.use(express.json());

app.get('/', (req, res) => {
  res.send('ES6 is the Node way to go');
});

app.listen(PORT, () => {
  // console.log(`App listening on port 5000!`);
});
