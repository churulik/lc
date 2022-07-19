import {AccessToken, RoomServiceClient, Room} from 'livekit-server-sdk';
import express from 'express';
import expressWs from 'express-ws';

const app = express();
const expressWsInstance = expressWs(app);
const PORT = process.env.PORT || 5000;

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

app.get('/api', (req, res) => {
  res.send('Welcome');
});

const API_KEY = 'APIpwqB8nDT3FsZ';
const API_SECRET = 'VqfumSn8RQQULQbyweX5K2S0AcKdYVouNr5axTOIvfjA';

app.post('/api/token', (req, res) => {
  const {room, user} = req.body;
  if (!room || !user) {
    res.status(400).send('Enter valid room and user');
    return;
  }

  const at = new AccessToken(API_KEY, API_SECRET, {identity: user});
  at.addGrant({roomJoin: true, room});

  const token = at.toJwt();
  const protocol = req.headers.origin && req.headers.origin.startsWith('https://') ? 'wss' : 'ws';
  res.send({token, url: `${protocol}://${req.headers['x-forwarded-host']}:7880`});
});

app.post('/api/room', () => {
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
});

expressWsInstance.app.ws('/websocket', (ws, req) => {
  ws.on('message', (msg) => {
    console.log(msg);
  });
  console.log('socket init websocket');
});

expressWsInstance.app.ws('/api/websocket', (ws, req) => {
  ws.on('message', (msg) => {
    console.log(msg);
  });
  console.log('socket init websocket');
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}...`));
