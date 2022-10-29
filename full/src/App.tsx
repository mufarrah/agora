import React, { useEffect, useState } from "react";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { VideoCall } from "./components/VideoCall";
import { ChannelForm } from "./components/ChannelForm";

const App = () => {
  const [inCall, setInCall] = useState(false);
  const [ws, setWs] = useState<WebSocket>(null);
  const [channelName, setChannelName] = useState("");
  const [credentials, setCredentials] = useState<{
    appId: string;
    robots: string[];
    ips: string[];
    channel: string[];
    token: string[];
    uid: number;
  }>();
  const [ip, setIp] = useState("");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string>();

  const capitalizeFirstLowercaseRest = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  useEffect(() => {
    //GETING CREDENTIALS OF ROBOTS
    const getCredentials = async () => {
      try{
        const skippies = await (await fetch(process.env.REACT_APP_SMC_SKIPPIES!)).json();
        const localCredentials =
        {
          appId: process.env.appId,
          robots: [] as string[],
          ips: [] as string[],
          channel: [] as string[],
          token: [] as string[],
          uid: 0,
        };
        for (let i = 0; i < skippies.length; i++) {
          localCredentials.channel.push(skippies[i].agora_channel);
          localCredentials.robots.push(capitalizeFirstLowercaseRest(skippies[i].name));
          localCredentials.ips.push(skippies[i].ip_address);
        }
        for (let i = 0; i < localCredentials.channel.length; i++) {
          const response = await fetch(process.env.REACT_APP_AGORA_TOKEN! + localCredentials.channel[i]);
          const token = await response.text();
          localCredentials.token.push(token);         
        }
        setCredentials(localCredentials);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    }
    getCredentials();
  }, []);
  if (loading) return <div> <h1 className="display-1 text-center text-" > Loading... </h1></div>;
  return (
    <div>
    <br></br>
    <h1 className="display-1 text-center" >SMC &amp; AGORA</h1>
    {inCall ? (
      <VideoCall setInCall={setInCall} channelName={channelName} token={token} ip={ip} ws={ws} setWs={setWs} />
      ) : (
        <ChannelForm credentials={credentials} setInCall={setInCall} setChannelName={setChannelName} setToken={setToken} setIp={setIp} />
        )}
        </div>
        );
      };
      
      export default App;