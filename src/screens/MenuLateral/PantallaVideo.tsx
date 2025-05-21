
import { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { width } = Dimensions.get('window');

interface VideoInfo {
  id: string
  title: string
  description: string
  source: any
  thumbnail?: string
}

const videosData: VideoInfo[] = [
  {
    id: '1',
    title: 'Introducción a la Geriatría',
    description:
      'Este video proporciona una introducción a los conceptos básicos de la geriatría y la importancia de la atención especializada para adultos mayores.',
    source: require('../assets/introprado.mp4'),
  },
  {
    id: '2',
    title: 'Cuidados Básicos del Adulto Mayor',
    description:
      'Aprenda sobre los cuidados esenciales que requieren los adultos mayores para mantener una buena calidad de vida y prevenir complicaciones de salud.',
    source: require('../assets/consejos.mp4'),
  },
  {
    id: '3',
    title: 'Prevención de Caídas',
    description:
      'Las caídas son una de las principales causas de lesiones en adultos mayores. Este video muestra técnicas para prevenir caídas y crear un entorno seguro.',
    source: require('../assets/prevencion.mp4'),
  },
];

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const PantallaVideo = () => {
  const videoRef = useRef<any>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoInfo>(videosData[0]);
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);


  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showControls && !paused) {
      timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (timer) {clearTimeout(timer);}
    };
  }, [showControls, paused]);


  useFocusEffect(
    useCallback(() => {
      setPaused(false);
      return () => {
        setPaused(true);
      };
    }, []),
  );

  const handleLoad = (meta: any) => {
    setDuration(meta.duration);
    setLoading(false);
  };

  const handleProgress = (progress: any) => {
    setCurrentTime(progress.currentTime);
  };

  const handleEnd = () => {
    setPaused(true);
    setCurrentTime(0);
    videoRef.current?.seek(0);
  };

  const handleSliderChange = (value: number) => {
    videoRef.current?.seek(value);
    setCurrentTime(value);
  };

  const togglePlayPause = () => {
    setPaused(!paused);
    setShowControls(true);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    setVolume(isMuted ? 1.0 : 0.0);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleVideoPress = () => {
    setShowControls(!showControls);
  };

  const handleSelectVideo = (video: VideoInfo) => {
    setSelectedVideo(video);
    setCurrentTime(0);
    setPaused(false);
    setLoading(true);
  };

  const forward10Seconds = () => {
    const newTime = Math.min(currentTime + 10, duration);
    videoRef.current?.seek(newTime);
    setCurrentTime(newTime);
  };

  const backward10Seconds = () => {
    const newTime = Math.max(currentTime - 10, 0);
    videoRef.current?.seek(newTime);
    setCurrentTime(newTime);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0A2463" barStyle="light-content" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.videoContainer, isFullscreen && styles.fullscreenContainer]}>
          <TouchableOpacity activeOpacity={1} onPress={handleVideoPress} style={styles.videoWrapper}>
            <Video
              ref={videoRef}
              source={selectedVideo.source}
              style={styles.video}
              resizeMode={isFullscreen ? 'contain' : 'cover'}
              onLoad={handleLoad}
              onProgress={handleProgress}
              onEnd={handleEnd}
              paused={paused}
              repeat={false}
              volume={volume}
              muted={isMuted}
            />

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4D96FF" />
              </View>
            )}

            {showControls && (
              <View style={styles.controlsOverlay}>
                <View style={styles.topControls}>
                  <TouchableOpacity onPress={toggleMute} style={styles.controlButton}>
                    <Ionicons
                      name={isMuted ? 'volume-mute' : 'volume-high'}
                      size={24}
                      color="#fff"
                      style={styles.controlIcon}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={toggleFullscreen} style={styles.controlButton}>
                    <Ionicons
                      name={isFullscreen ? 'contract' : 'expand'}
                      size={24}
                      color="#fff"
                      style={styles.controlIcon}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.centerControls}>
                  <TouchableOpacity onPress={backward10Seconds} style={styles.controlButton}>
                    <Ionicons name="play-back" size={36} color="#fff" style={styles.controlIcon} />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseButton}>
                    <Ionicons name={paused ? 'play' : 'pause'} size={40} color="#fff" style={styles.playPauseIcon} />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={forward10Seconds} style={styles.controlButton}>
                    <Ionicons name="play-forward" size={36} color="#fff" style={styles.controlIcon} />
                  </TouchableOpacity>
                </View>

                <View style={styles.bottomControls}>
                  <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                  <Slider
                    style={styles.progressBar}
                    minimumValue={0}
                    maximumValue={duration}
                    value={currentTime}
                    onValueChange={handleSliderChange}
                    minimumTrackTintColor="#4D96FF"
                    maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                    thumbTintColor="#4D96FF"
                  />
                  <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.videoInfoContainer}>
          <Text style={styles.videoTitle}>{selectedVideo.title}</Text>
          <Text style={styles.videoDescription}>{selectedVideo.description}</Text>
        </View>

        <View style={styles.playlistContainer}>
          <View style={styles.playlistHeader}>
            <Ionicons name="list" size={22} color="#0A2463" style={styles.playlistIcon} />
            <Text style={styles.playlistTitle}>Videos Disponibles</Text>
          </View>

          {videosData.map((video) => (
            <TouchableOpacity
              key={video.id}
              style={[styles.playlistItem, selectedVideo.id === video.id && styles.playlistItemActive]}
              onPress={() => handleSelectVideo(video)}
              activeOpacity={0.7}
            >
              <View style={styles.playlistItemThumbnail}>
                <Ionicons
                  name={selectedVideo.id === video.id ? 'play-circle' : 'videocam'}
                  size={24}
                  color={selectedVideo.id === video.id ? '#4D96FF' : '#6B7280'}
                  style={styles.thumbnailIcon}
                />
              </View>
              <View style={styles.playlistItemInfo}>
                <Text
                  style={[styles.playlistItemTitle, selectedVideo.id === video.id && styles.playlistItemTitleActive]}
                >
                  {video.title}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  header: {
    backgroundColor: '#0A2463',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    marginBottom: 16,
  },
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    aspectRatio: undefined,
    height: '100%',
  },
  videoWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: '#000',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'space-between',
    padding: 16,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlButton: {
    padding: 8,
  },
  controlIcon: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  playPauseButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  playPauseIcon: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  progressBar: {
    flex: 1,
    marginHorizontal: 10,
    height: 40,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  videoInfoContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A2463',
    marginBottom: 8,
  },
  videoDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  playlistContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  playlistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  playlistIcon: {
    marginRight: 8,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A2463',
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  playlistItemActive: {
    backgroundColor: '#EFF6FF',
  },
  playlistItemThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  thumbnailIcon: {},
  playlistItemInfo: {
    flex: 1,
  },
  playlistItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  playlistItemTitleActive: {
    color: '#4D96FF',
    fontWeight: '600',
  },
  playlistItemDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default PantallaVideo;
