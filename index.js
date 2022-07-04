import {AccessToken, RoomServiceClient, Room} from 'livekit-server-sdk';
import express from 'express';

const app = express();

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

app.get('/', (req, res) => {
  res.send('ES6 is the Node way to go');
});

app.listen(5000, () => {
  // console.log(`App listening on port 5000!`);
});
