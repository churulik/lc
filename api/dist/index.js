"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const livekit_server_sdk_1 = require("livekit-server-sdk");
const express_1 = __importDefault(require("express"));
const express_ws_1 = __importDefault(require("express-ws"));
const app = (0, express_1.default)();
const expressWsInstance = (0, express_ws_1.default)(app);
const PORT = process.env.PORT || 5000;
app.use(express_1.default.urlencoded({
    extended: true,
}));
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('Welcome');
});
const API_KEY = 'APIpwqB8nDT3FsZ';
const API_SECRET = 'VqfumSn8RQQULQbyweX5K2S0AcKdYVouNr5axTOIvfjA';
app.post('/api/token', (req, res) => {
    const { room, user } = req.body;
    if (!room || !user) {
        res.status(400).send('Enter valid room and user');
        return;
    }
    const at = new livekit_server_sdk_1.AccessToken(API_KEY, API_SECRET, { identity: user });
    at.addGrant({ roomJoin: true, room });
    const token = at.toJwt();
    const protocol = req.headers.origin && req.headers.origin.startsWith('https://') ? 'wss' : 'ws';
    res.send({ token, url: `${protocol}://${req.headers['x-forwarded-host']}:7880` });
});
app.post('/api/room', () => {
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
//# sourceMappingURL=index.js.map