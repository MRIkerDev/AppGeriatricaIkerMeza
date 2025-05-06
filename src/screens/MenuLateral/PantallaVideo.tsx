// PantallaInicioApp.tsx
import React, { useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Video from 'react-native-video';

const PantallaVideo = ({ navigation }: any) => {
  const videoRef = useRef(null);
  const [hasFinished, setHasFinished] = useState(false);

  const handleEnd = () => {
    if (!hasFinished) {
      setHasFinished(true);
      navigation.navigate('Inicio');
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={require('../assets/introprado.mp4')}
        style={styles.backgroundVideo}
        resizeMode="cover"
        onEnd={handleEnd}
        paused={false}
        repeat={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundVideo: {
    width: '100%',
    height: '100%',
  },
});

export default PantallaVideo;
