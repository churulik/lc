import {FC, useEffect, useRef, useState} from 'react';
import axios from 'axios';
import {AudioRenderer, LiveKitRoom, useParticipant, VideoRenderer} from '@livekit/react-components';
import {createLocalTracks, Room} from 'livekit-client';
import {Box, Button, Flex, Grid, HStack, Icon, VStack, Text} from '@chakra-ui/react';
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

const ControlButton = ({icon, onClick, children}: any) => (
  <Button onClick={onClick} py="0.5rem" px="1rem">
    <HStack spacing="0.5rem">
      <Icon as={icon} w="1rem" h="1rem" color="white"/>
      <Text
        textTransform="uppercase"
        textStyle="v2.caption-mono"
        color="white"
        display="unset">{children}</Text>
    </HStack>
  </Button>
);

const ControlsView = ({room}: any) => {
  // const {unpublishTrack} = useParticipant(room.localParticipant);

  const onToggleMic = () => {
    const enabled = room.localParticipant.isMicrophoneEnabled;
    room.localParticipant.setMicrophoneEnabled(!enabled);
  };
  const onToggleVideo = () => {
    const enabled = room.localParticipant.isCameraEnabled;
    room.localParticipant.setCameraEnabled(!enabled);
  };
  const onPowerOff = () => {
    room.disconnect();
  };

  return (
    <HStack justify="center" spacing="0.8rem" pt="3.375rem">
      <ControlButton
        icon={room.localParticipant.isMicrophoneEnabled ? Mic : MicOff}
        onClick={onToggleMic}>
        {room.localParticipant.isMicrophoneEnabled ? 'Mute' : 'Unmute'}
      </ControlButton>
      <ControlButton
        icon={room.localParticipant.isCameraEnabled ? Video : VideoOff}
        onClick={onToggleVideo}>
        {room.localParticipant.isCameraEnabled ? 'Stop Video' : 'Start Video'}
      </ControlButton>
      <ControlButton
        icon={Power}
        onClick={onPowerOff}>Disconnect</ControlButton>
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

function StageView({roomState}: any) {
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
}

async function handleConnected(room: Room) {
  console.log('connected to room', room)

  const tracks = await createLocalTracks({
    audio: true,
    video: true,
  })
  tracks.forEach((track) => {
    room.localParticipant.publishTrack(track, {simulcast: true});
  })
}

const HomePage: FC = () => {
  const [url, setUrl] = useState<string>();
  const [token, setToken] = useState<string>();

  useEffect(() => {
    axios.post('/token', {user: 'me', room: '1'})
      .then(({data: {token, url}}) => {
        setUrl(url);
        setToken(token);
      });
  }, []);

  if (!url || !token) {
    return null;
  }

  return (
    <LiveKitRoom
      url={url}
      token={token}
      stageRenderer={StageView}
      onConnected={(room) => { handleConnected(room) }}
    />
  );
};

export default HomePage;
