/**
 * @format
 */

import 'react-native-gesture-handler';  // Esto va en la parte superior
import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);