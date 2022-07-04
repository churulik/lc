"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const livekit_server_sdk_1 = require("livekit-server-sdk");
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.get('/', (req, res) => {
    // if this room doesn't exist, it'll be automatically created when the first
    // client joins
    const roomName = 'name-of-room';
    // identifier to be used for participant.
    // it's available as LocalParticipant.identity with livekit-client SDK
    const participantName = 'user-name';
    const at = new livekit_server_sdk_1.AccessToken('api-key', 'secret-key', {
        identity: participantName,
    });
    at.addGrant({ roomJoin: true, room: roomName });
    const token = at.toJwt();
    console.log('access token', token);
    const livekitHost = 'https://my.livekit.host';
    const svc = new livekit_server_sdk_1.RoomServiceClient(livekitHost, 'api-key', 'secret-key');
    // list rooms
    svc.listRooms().then((rooms) => {
        console.log('existing rooms', rooms);
    });
    // create a new room
    const opts = {
        name: 'myroom',
        // timeout in seconds
        emptyTimeout: 10 * 60,
        maxParticipants: 20,
    };
    svc.createRoom(opts).then((room) => {
        console.log('room created', room);
    });
    // delete a room
    svc.deleteRoom('myroom').then(() => {
        console.log('room deleted');
    });
    res.send('ES6 is the Node way to go');
});
app.listen(3000, () => {
    console.log(`App listening on port 3000!`);
});
