import NetInfo from '@react-native-community/netinfo';

export const hayInternet = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return (state.isConnected !== null ? state.isConnected : false) &&
         (state.isInternetReachable !== null ? state.isInternetReachable : false);
};