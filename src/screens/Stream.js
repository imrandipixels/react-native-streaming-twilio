import React, {useState, useRef, useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  TwilioVideo,
  TwilioVideoParticipantView,
} from 'react-native-twilio-video-webrtc';

const Stream = ({route, navigation}) => {
  const {token, room, streamer} = route.params;

  const twilioRef = useRef(null);
  const [status, setStatus] = useState('');
  const [videoTracks, setVideoTracks] = useState(new Map());
  const [participants, setParticipants] = useState(new Map());

  const onParticipantAddedVideoTrack = ({participant, track}) => {
    // console.log('onParticipantAddedVideoTrack: ', participant, track);
    setParticipants(prevState =>
      prevState.set(participant.identity, {
        key: track.trackSid,
        indentifier: {
          participantSid: participant.sid,
          videoTrackSid: track.trackSid,
        },
      }),
    );

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

  useEffect(() => {
    console.log(participants, '<==========');
  }, [participants]);

  return (
    <View style={{flex: 1}}>
      <View style={{backgroundColor: 'red', height: '100%'}}>
        {participants.has(streamer) ? (
          <TwilioVideoParticipantView
            key={participants.get(streamer).key}
            trackIdentifier={participants.get(streamer).indentifier}
            style={styles.streamView}
          />
        ) : null}
        {/* <TwilioVideoParticipantView
          key={participants.get(streamer).key}
          trackIdentifier={participants.get(streamer).indentifier}
          style={styles.streamView}
        /> */}
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
  streamView: {
    width: '100%',
    height: '100%',
    backgroundColor: 'orange',
  },
});

export default Stream;
