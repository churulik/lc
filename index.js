"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const livekit_server_sdk_1 = require("livekit-server-sdk");
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use(express_1.default.static(path_1.default.resolve(__dirname, './client/build')));
app.use(express_1.default.urlencoded({
    extended: true,
}));
app.use(express_1.default.json());
app.get('/h', (req, res) => {
    res.send('ES6 is the Node way to go');
});
app.post('/twirp/livekit.RoomService/CreateRoom', (req, res) => {
    res.send('ok');
});
const API_KEY = 'APIpwqB8nDT3FsZ';
const API_SECRET = 'VqfumSn8RQQULQbyweX5K2S0AcKdYVouNr5axTOIvfjA';
app.get('/test', (req, res) => {
    const room = '1';
    const user = 'me';
    const at = new livekit_server_sdk_1.AccessToken(API_KEY, API_SECRET, { identity: user });
    at.addGrant({ roomJoin: true, room });
    // const token = at.toJwt();
    const livekitHost = 'wss://demo.livekit.cloud';
    const svc = new livekit_server_sdk_1.RoomServiceClient(livekitHost, API_KEY, API_SECRET);
    // list rooms
    svc.listRooms().then((rooms) => {
        // console.log('existing rooms', rooms);
    });
    // create a new room
    const opts = {
        name: 'myroom'
    };
    svc.createRoom(opts).then((createdRoom) => {
        // console.log('room created', room);
    });
    // delete a room
    svc.deleteRoom('myroom').then(() => {
        // console.log('room deleted');
    });
    res.send('ES6 is the Node way to go');
});
app.post('/token', (req, res) => {
    const { room, user } = req.body;
    if (!room || !user) {
        res.status(400).send('Enter valid room and user');
        return;
    }
    const at = new livekit_server_sdk_1.AccessToken(API_KEY, API_SECRET, { identity: user });
    at.addGrant({ roomJoin: true, room });
    const token = at.toJwt();
    res.send({ token, url: 'wss://demo.livekit.cloud' });
});
app.post('/room', () => {
    const livekitHost = 'http://localhost:5000';
    const svc = new livekit_server_sdk_1.RoomServiceClient(livekitHost, API_KEY, API_SECRET);
    // list rooms
    svc.listRooms().then((rooms) => {
        // console.log('existing rooms', rooms);
    });
    // create a new room
    const opts = {
        name: 'myroom',
        // timeout in seconds
        emptyTimeout: 10 * 60,
        maxParticipants: 20,
    };
    svc.createRoom(opts).then((room) => {
        // console.log('room created', room);
    });
    // delete a room
    svc.deleteRoom('myroom').then(() => {
        // console.log('room deleted');
    });
});
app.listen(PORT, () => {
    // console.log(`App listening on port 5000!`);
});
//# sourceMappingURL=index.js.map
