import {AccessToken, RoomServiceClient, Room} from 'livekit-server-sdk';
import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.static(path.resolve(__dirname, './client/build')));

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Home');
});

app.post('/twirp/livekit.RoomService/CreateRoom', (req, res) => {
  res.send('ok');
});

const API_KEY = 'APIpwqB8nDT3FsZ';
const API_SECRET = 'VqfumSn8RQQULQbyweX5K2S0AcKdYVouNr5axTOIvfjA';

app.get('/test', (req, res) => {
  const room = '1';
  const user = 'me';

  const at = new AccessToken(API_KEY, API_SECRET, {identity: user});
  at.addGrant({roomJoin: true, room});

  // const token = at.toJwt();
  const livekitHost = 'ws://localhost:7880';
  const svc = new RoomServiceClient(livekitHost, API_KEY, API_SECRET);

// list rooms
  svc.listRooms().then((rooms: Room[]) => {
    // console.log('existing rooms', rooms);
  });

  // create a new room
  const opts = {
    name: 'myroom'
  };
  svc.createRoom(opts).then((createdRoom: Room) => {
    // console.log('room created', room);
  });

// delete a room
  svc.deleteRoom('myroom').then(() => {
    // console.log('room deleted');
  });

  res.send('ES6 is the Node way to go');
})

app.post('/token', (req, res) => {
  const {room, user} = req.body;
  if (!room || !user) {
    res.status(400).send('Enter valid room and user');
    return;
  }

  const at = new AccessToken(API_KEY, API_SECRET, {identity: user});
  at.addGrant({roomJoin: true, room});

  const token = at.toJwt();

  res.send({token, url: 'ws://localhost:7880'});
})

app.post('/room', () => {
  const livekitHost = 'http://localhost:5000';
  const svc = new RoomServiceClient(livekitHost, API_KEY, API_SECRET);

// list rooms
  svc.listRooms().then((rooms: Room[]) => {
    // console.log('existing rooms', rooms);
  });

  // create a new room
  const opts = {
    name: 'myroom',
    // timeout in seconds
    emptyTimeout: 10 * 60,
    maxParticipants: 20,
  };
  svc.createRoom(opts).then((room: Room) => {
    // console.log('room created', room);
  });

// delete a room
  svc.deleteRoom('myroom').then(() => {
    // console.log('room deleted');
  });
})

app.listen(PORT, () => {
  // console.log(`App listening on port 5000!`);
});
