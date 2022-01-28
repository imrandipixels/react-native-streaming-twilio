import React, {useState, useRef, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {
  TwilioVideo,
  TwilioVideoLocalView,
  TwilioVideoParticipantView,
} from 'react-native-twilio-video-webrtc';

const Room = ({route, navigation}) => {
  const {token, room} = route.params;
  const twilioRef = useRef(null);
  const [status, setStatus] = useState('disconnected');
  const [videoTracks, setVideoTracks] = useState(new Map());
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [participants, setParticipants] = useState(new Map());

  const onParticipantAddedVideoTrack = ({participant, track}) => {
    // console.log('onParticipantAddedVideoTrack: ', participant, track);

    setVideoTracks(
      new Map([
        ...videoTracks,
        [
          track.trackSid,
          {participantSid: participant.sid, videoTrackSid: track.trackSid},
        ],
      ]),
    );
  };

  const onMuteButtonPress = () => {
    twilioRef.current
      .setLocalAudioEnabled(!isAudioEnabled)
      .then(isEnabled => setIsAudioEnabled(isEnabled));
  };

  const onRoomDidConnect = ({roomName, error}) => {
    console.log('onRoomDidConnect: ', roomName);

    setStatus('connected');
  };

  const onRoomDidDisconnect = ({roomName, error}) => {
    console.log('[Disconnect]ERROR: ', error);

    setStatus('disconnected');
  };

  const onRoomDidFailToConnect = error => {
    console.log('[FailToConnect]ERROR: ', error);

    setStatus('disconnected');
  };

  useEffect(() => {
    twilioRef.current.connect({
      accessToken: token,
      roomName: room,
    });
  }, [token, room]);

  return (
    <View style={{flex: 1}}>
      <View style={{backgroundColor: 'red', height: '100%'}}>
        <TwilioVideoLocalView
          style={styles.localView}
          enabled={true}
          scaleType="fill"
        />
      </View>

      <TwilioVideo
        ref={twilioRef}
        onRoomDidConnect={onRoomDidConnect}
        onRoomDidDisconnect={onRoomDidDisconnect}
        onRoomDidFailToConnect={onRoomDidFailToConnect}
        onParticipantAddedVideoTrack={onParticipantAddedVideoTrack}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  localView: {
    width: '100%',
    height: '100%',
    backgroundColor: 'orange',
  },
});

export default Room;
