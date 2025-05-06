import React from 'react';
import { View, Text, Button } from 'react-native';
const Home = ({ navigation }: any) => {
 return (
 <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
 <Text>Pantalla Principal</Text>
 <Button
 title="Ir a la segunda pantalla"
 onPress={() => navigation.navigate('Second')}
 />
 </View>
 );
}
export default  Home;