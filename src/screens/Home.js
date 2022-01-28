import axios from 'axios';
import React, {useState, useEffect} from 'react';
import {
  Alert,
  Button,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  checkMultiple,
  request,
  requestMultiple,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';
import API from '../utils/API';

const Home = ({navigation}) => {
  const [username, setusername] = useState(null);
  const [room, setRoom] = useState(null);

  const checkPermissions = callback => {
    const ios = [PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.MICROPHONE];
    const android = [
      PERMISSIONS.ANDROID.CAMERA,
      PERMISSIONS.ANDROID.RECORD_AUDIO,
    ];
    checkMultiple(Platform.OS === 'ios' ? ios : android).then(statuses => {
      const [CAMERA, AUDIO] = Platform.OS === 'ios' ? ios : android;
      if (
        statuses[CAMERA] === RESULTS.UNAVAILABLE ||
        statuses[AUDIO] === RESULTS.UNAVAILABLE
      ) {
        Alert.alert('Error', 'Hardware does not support video calls');
      } else if (
        statuses[CAMERA] === RESULTS.BLOCKED ||
        statuses[AUDIO] === RESULTS.BLOCKED
      ) {
        Alert.alert('Error', 'Permission to access hardware was blocked!');
      } else {
        if (
          statuses[CAMERA] === RESULTS.DENIED &&
          statuses[AUDIO] === RESULTS.DENIED
        ) {
          requestMultiple(Platform.OS === 'ios' ? ios : android).then(
            newStatuses => {
              if (
                newStatuses[CAMERA] === RESULTS.GRANTED &&
                newStatuses[AUDIO] === RESULTS.GRANTED
              ) {
                callback && callback();
              } else {
                Alert.alert('Error', 'One of the permissions was not granted');
              }
            },
          );
        } else if (
          statuses[CAMERA] === RESULTS.DENIED ||
          statuses[AUDIO] === RESULTS.DENIED
        ) {
          request(statuses[CAMERA] === RESULTS.DENIED ? CAMERA : AUDIO).then(
            result => {
              if (result === RESULTS.GRANTED) {
                callback && callback();
              } else {
                Alert.alert('Error', 'Permission not granted');
              }
            },
          );
        } else if (
          statuses[CAMERA] === RESULTS.GRANTED ||
          statuses[AUDIO] === RESULTS.GRANTED
        ) {
          callback && callback();
        }
      }
      console.log('Camera', statuses[CAMERA]);
      console.log('Microphone', statuses[AUDIO]);
    });
  };

  const onJoinRoom = async () => {
    if (room && username) {
      try {
        const response = await API.post('/create-room', {
          streamerName: username,
          roomName: room,
        });
        if (response.status === 200) {
          console.log(response.data, '<========');
          navigation.navigate('Room', {token: response.data, room});
        }
      } catch (e) {
        console.log(e, '<===========');
      }
    } else {
      Alert.alert('Error', 'Please provide a username and room name.');
    }
  };

  const onJoinStream = async () => {
    if (username && room) {
      try {
        const response = await API.get('/join-room', {
          params: {userName: username, roomName: room},
        });
        if (response.status === 200) {
          // console.log(response.data);
          navigation.navigate('Stream', {
            token: response.data.token,
            room,
            streamer: response.data.streamer,
          });
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      Alert.alert('Error', 'Please provide a username and room name.');
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.header}>Hello User</Text>
        <TextInput
          style={styles.input}
          placeholder="User Name"
          placeholderTextColor="black"
          value={username}
          onChangeText={setusername}
        />
        <TextInput
          style={styles.input}
          placeholder="Room Name"
          placeholderTextColor="black"
          value={room}
          onChangeText={setRoom}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Button title="Create Room" color="black" onPress={onJoinRoom} />
          <Text>/</Text>
          <Button title="Join Room" color="black" onPress={onJoinStream} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'yellow',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    alignSelf: 'center',
  },
  input: {
    margin: 14,
    height: 40,
    paddingLeft: 8,
    borderWidth: 1,
  },
});

export default Home;
