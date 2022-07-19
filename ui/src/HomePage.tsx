import {FC, useEffect, useRef, useState} from 'react';
import axios from 'axios';
import {AudioRenderer, LiveKitRoom, useParticipant, VideoRenderer} from '@livekit/react-components';
import {createLocalTracks, Room} from 'livekit-client';
import {Box, Flex, Grid, HStack, Icon, VStack, Text, IconButton} from '@chakra-ui/react';
import {Mic, MicOff, Power, Video, VideoOff } from 'react-feather';

const CustomParticipantView = ({participant}: any) => {
  const {cameraPublication, isLocal} = useParticipant(participant);
  if (!cameraPublication || !cameraPublication.isSubscribed || !cameraPublication.track || cameraPublication.isMuted) {
    return null;
  }
  return (
    <Box w="95%" pos="relative" left="50%" transform="translateX(-50%)">
      <VideoRenderer track={cameraPublication.track} isLocal={isLocal} objectFit="contain" width="100%" height="100%"/>
    </Box>
  );
};

const ControlButton = ({ariaLabel, color, icon, onClick}: any) => (
  <IconButton
    aria-label={ariaLabel}
    colorScheme={color || 'blue'}
    icon={<Icon as={icon} color="white"/>}
    onClick={onClick}
    isRound
    size="lg"
  />
);

const ControlsView = ({room}: any) => {
  // const {unpublishTrack} = useParticipant(room.localParticipant);
  const [mic, setMic] = useState(room.localParticipant.isMicrophoneEnabled);
  const [cam, setCam] = useState(room.localParticipant.isCameraEnabled);

  const onToggleMic = () => {
    const enabled = room.localParticipant.isMicrophoneEnabled;
    room.localParticipant.setMicrophoneEnabled(!enabled);
    setMic(!enabled)
  };
  const onToggleVideo = () => {
    const enabled = room.localParticipant.isCameraEnabled;
    room.localParticipant.setCameraEnabled(!enabled);
    setCam(!enabled);
  };
  const onPowerOff = () => {
    room.disconnect();
  };

  return (
    <HStack justify="center" spacing="20px" py="12px" position="fixed" bottom={0} width="100%" background={'rgba(0,0,0,0.2)'}>
      <ControlButton
        ariaLabel="mic"
        icon={mic ? Mic : MicOff}
        onClick={onToggleMic}
      />
      <ControlButton
        ariaLabel="camera"
        icon={cam ? Video : VideoOff}
        onClick={onToggleVideo}
      />
      <ControlButton
        ariaLabel="exit"
        color="red"
        icon={Power}
        onClick={onPowerOff}
      />
    </HStack>
  );
};

const RoomStatusView = ({children}: any) => (
  <VStack w="100%" h="100%" align="center" justify="center">
    <Text
      textStyle="v2.h5-mono"
      color="white"
      textTransform="uppercase"
      letterSpacing="0.05em">{children}</Text>
  </VStack>
);

const StageView = ({roomState}: any) => {
  const {room, participants, audioTracks, isConnecting, error} = roomState;
  const gridRef = useRef<any>(null);
  const [gridTemplateColumns, setGridTemplateColumns] = useState('1fr');

  useEffect(() => {
    const gridEl = gridRef.current;
    if (!gridEl || participants.length === 0) return;

    const totalWidth = gridEl.clientWidth;
    const numCols = Math.ceil(Math.sqrt(participants.length));
    const colSize = Math.floor(totalWidth / numCols);
    setGridTemplateColumns(`repeat(${numCols}, minmax(50px, ${colSize}px))`);
  }, [participants]);

  if (isConnecting) {
    return <RoomStatusView>Connecting...</RoomStatusView>;
  }
  if (error) {
    return <RoomStatusView>Error: {error.message}</RoomStatusView>;
  }
  if (!room) {
    return <RoomStatusView>Room closed</RoomStatusView>;
  }

  return (
    <Flex direction="column" justify="center" h="100%" bg="black">
      <Grid
        ref={gridRef}
        __css={{
          display: 'grid',
          aspectRatio: '1.77778',
          overflow: 'hidden',
          background: 'black',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          'gridTemplateColumns': gridTemplateColumns
        }}>
        {audioTracks.map((track: any) => (
          <AudioRenderer track={track} isLocal={false} key={track.sid}/>
        ))}
        {participants.map((participant: any) => (
          <CustomParticipantView
            key={participant.sid}
            participant={participant}
            showOverlay={true}
            aspectWidth={16}
            aspectHeight={9}
          />
        ))}
      </Grid>
      <ControlsView room={room}/>
    </Flex>
  );
};

const handleConnected = async (room: Room) => {
  console.log('connected to room', room)

  const tracks = await createLocalTracks({
    audio: true,
    video: true,
  })
  tracks.forEach((track) => {
    room.localParticipant.publishTrack(track, {simulcast: true});
  })
};

const HomePage: FC = () => {
  const [url, setUrl] = useState<string>();
  const [token, setToken] = useState<string>();

  useEffect(() => {


    // const wss = new WebSocket(`wss://${host}/websocket`);
    // wss.onopen = () => console.log('wss open');
    // wss.onclose = () => console.log('wss close');

    axios.post('/api/token', {user: `me_${Date.now()}`, room: '333444'})
      .then(({data: {token, url}}) => {
        setUrl(url);
        setToken(token);
      });
  }, []);

  if (!url || !token) {
    return null;
  }

  return (
    <>
      <button onClick={() => {
        const host = window.location.host;
        const ws = new WebSocket(`ws://${host}/websocket`);
        ws.onopen = () => console.log('ws open');
        ws.onclose = () => console.log('ws close');
      }}>WS</button>
      <LiveKitRoom
        url={url}
        token={token}
        stageRenderer={StageView}
        onConnected={handleConnected}
      />
    </>
  );
};

export default HomePage;
