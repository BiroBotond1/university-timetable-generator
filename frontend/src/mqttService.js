import mqtt from 'mqtt';
import store from './store/index'

const initializeClient = () => {
  const client =  mqtt.connect("mqtt://localhost:9001");

  client.subscribe("timetable/generation", (err) => {
    if (err) {
      console.error(`Subscribe error: ${err}`);
    } else {
      console.log("subscribed to")
    }
  });
  
  client.on('connect', () => {
    console.log('Connected to MQTT broker');
  });
  
  client.on('error', (err) => {
    console.error('Connection error: ', err);
    this.client.end();
  });
  
  client.on('message', (topic, message) => {
    if(topic !== "timetable/generation") {
      return;
    }
    const messObject = JSON.parse(message);
    if(messObject.running) {
      store.commit('IsGenerating');
    }
    else
    {
      store.commit('GenerationDone');
    }
  })
}

export default initializeClient;