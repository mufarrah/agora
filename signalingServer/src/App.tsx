import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import AgoraRTM, { RtmChannel } from 'agora-rtm-sdk';

function App() {
  
  const useSignalingClient = AgoraRTM.createInstance('01c84bffc1d14fe3a6796d4e0726a4cb');
  
  useEffect(() => {
    const credentials = {
      uid: '79',
      appId: '01c84bffc1d14fe3a6796d4e0726a4cb',
      channelName: 'skippy-brett'
    }
    
    let newChannel: RtmChannel;
    
    const connect = async () => {
      try {
        const response2 = await fetch(`https://uldizaax95.execute-api.us-west-1.amazonaws.com/token?channel=${credentials.channelName}&userid=${credentials.uid}&mode=rtm`);
        const tokenNew = await response2.text();
        await useSignalingClient.login({uid:credentials.uid,token: tokenNew});
        const channel = useSignalingClient.createChannel(credentials.channelName);
        await channel.join();
        newChannel = channel;
        channel.on('ChannelMessage', async ({ text }, senderId) => {
          const recived = JSON.parse(text!);
          const pongTime = new Date().getTime();
          const apiCall = {
            "op": "service_response",
            "service": "ping_status",
            "values": {
              "Pong_time": pongTime,
              "ms_to_robot": pongTime - parseInt(recived.args.Ping_time),
            },
            "result": "true"
          }
          const message = useSignalingClient.createMessage({
            text: JSON.stringify(apiCall)
          });
          if(newChannel) {
            console.log("++ Sending message ++");
            await newChannel.sendMessage(message);
          }
          console.log('++ Message received: ++', text, ' || from user ', senderId);
        });
      } catch (error) {
        console.log("Error : ", error);
      }
    }
    connect();
    return () => {
      console.log("++ Channel Name +++: ", newChannel);
      if(newChannel) {
        newChannel.leave();
        useSignalingClient.logout();
      }
    }
  }, [useSignalingClient]);
  
  return (
    <div className="App">
    <header className="App-header">
    <img src={logo} className="App-logo" alt="logo" />
    <p>
    Edit <code>src/App.tsx</code> and save to reload.
    </p>
    <a
    className="App-link"
    href="https://reactjs.org"
    target="_blank"
    rel="noopener noreferrer"
    >
    Learn React
    </a>
    </header>
    </div>
    );
  }
  
  export default App;
  

  