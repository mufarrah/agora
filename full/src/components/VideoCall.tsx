import React, { useEffect, useState } from "react";
import { Videos } from "./Videos";
import { Controls } from "./Controls";
import useClient from "../hooks/useClient";
import { appId } from "../hooks/useClient";
import { RtmChannel } from 'agora-rtm-sdk'
import { useSignalingClient } from "../hooks/useClient";

import {
    IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";
import {
    createMicrophoneAndCameraTracks,
    UID
} from "agora-rtc-react";



const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();

export const VideoCall = (props: {
    setInCall: React.Dispatch<React.SetStateAction<boolean>>;
    channelName: string;
    token: string;
    ip: string;
    ws: WebSocket;
    setWs: React.Dispatch<React.SetStateAction<WebSocket>>;
}) => {
    const { setInCall, channelName, token, ip} = props;
    const [users, setUsers] = useState<IAgoraRTCRemoteUser[]>([]);
    const [start, setStart] = useState<boolean>(false);
    const [latency, setLatency] = useState<{}>({});
    const [inputLatency, setInputLatency] = useState<{}>({
        "Browser to Robot": 0, 
        "Round Trip": 0, 
        "One Way": 0});
        const client = useClient();
        const { ready, tracks } = useMicrophoneAndCameraTracks();
        const [ws, setWs] = useState<WebSocket>();
        useEffect(() => {
            
            // function to initialise the SDK
            let init = async (name: string) => {
                client.on("user-published", async (user, mediaType) => {   
                    await client.subscribe(user, mediaType);
                    console.log("subscribe success");
                    if (mediaType === "video") {
                        setUsers((prevUsers: any) => {
                            return [...prevUsers, user];
                        });
                    }
                    // if (mediaType === "audio") {
                    //     user.audioTrack?.play();
                    // }
                    
                });
                client.on("user-unpublished", (user, type) => {
                    console.log("unpublished", user, type);
                    // if (type === "audio") {
                    //     user.audioTrack?.stop();
                    // }
                    if (type === "video") {
                        setUsers((prevUsers: any[]) => {
                            return prevUsers.filter((User: { uid: UID; }) => User.uid !== user.uid);
                        });
                    }
                });
                
                client.on("user-left", (user) => {
                    console.log("leaving", user);
                    setUsers((prevUsers: any[]) => {
                        return prevUsers.filter((User: { uid: UID; }) => User.uid !== user.uid);
                    });
                });
                
                await client.join(appId, name, token, null);
                if (tracks) await client.publish([tracks[0], tracks[1]]);
                setStart(true);
                
            };
            
            if (ready && tracks) {
                console.log("init ready");
                init(channelName);
                
            }
            
            
            setWs(null);
        }, [channelName, client, ready, tracks, ip]);
        
        useEffect(() => {
            let newChannel: RtmChannel;
            const connect = async () => {
                try {
                    const response2 = await fetch(`https://uldizaax95.execute-api.us-west-1.amazonaws.com/token?channel=${channelName}&userid=8&mode=rtm`);
                    const tokenNew = await response2.text();
                    await useSignalingClient.login({uid:"8",token: tokenNew});
                    const channel = useSignalingClient.createChannel(channelName);
                    await channel.join();
                    await channel.sendMessage({ text: "++ testing msg ++" });
                    newChannel = channel;
                    channel.on('ChannelMessage', ({ text }, senderId) => {
                        console.log("text ++++: ", text);
                        console.log("senderId ++++: ", senderId);
                        if (text === "++ testing msg ++") {
                            console.log("5 ++++: ", text);
                        }
                    });
                } catch (error) {
                    console.log("error: ", error);
                }
            }
            connect();
            return () => {
                console.log("+++++: ", newChannel);
                if(newChannel) {
                    newChannel.leave();
                    useSignalingClient.logout();
                }
            }
        }, [channelName]);
        
        useEffect(() => {
            const interval = setInterval(() => {
                if(ws===undefined || ws===null) {
                    // setWs(new WebSocket("ws://"+ip+":8888"));
                    setWs(new WebSocket("ws://73.24.21.34:8888"));
                } else {
                    // MESSAGE TO SERVER
                    const pingTime = new Date().getTime();
                    const apiCall = {
                        "op": "call_service",
                        "service": "ping_status",
                        "args": {
                            "Ping_time": pingTime
                        }
                    }
                    //SENDING THE MESSAGE
                    ws.send(JSON.stringify(apiCall));
                    ws.onmessage = (event) => {
                        const data = JSON.parse(event.data);
                        const pongTime = new Date().getTime();
                        setInputLatency({
                            "Browser to Robot": Math.trunc(data.values.Pong_time*1000) - pingTime , 
                            "Round Trip": pongTime - pingTime, 
                            "One Way": (pongTime - pingTime)/2});
                        }
                    }
                }, 2000);
                return () => {
                    clearInterval(interval);
                    if (ws!=null) {
                        ws.close();
                    }
                }
            }, [ip,ws]);
            
            
            
            setInterval(() => {
                setLatency(client.getRemoteVideoStats());
            }, 2000);
            
            return (
                <div className="App">
                {ready && tracks && (
                    <Controls tracks={tracks} setStart={setStart} setInCall={setInCall} />
                    )}
                    {start && tracks && <Videos users={users} tracks={tracks} />}
                    <ul className="latency">
                    {Object.keys(latency).map((key) => {
                        return (
                            <li key={key}>
                            <strong>Camera {key}:</strong> {latency[key].end2EndDelay}
                            <br />
                            </li>
                            );
                        })}
                        {Object.keys(inputLatency).map((key) => {
                            return (
                                <li key={key}>
                                <strong>{key}:</strong> {inputLatency[key]}
                                <br />
                                </li>
                                );
                            })}
                            </ul>
                            </div>
                            );
                        };
                        
                        // browser to robot pong_time-ping 
                        // roundtrip pong-ping 
                        // oneway roundtrip/2
                        
                        //{
                        //  "op": "service_response", 
                        //  "service": "ping_status", 
                        //  "values": {"
                        //              Pong_time": 1666212079.0887294, 
                        //              "ms_to_robot": 166304088.72938156}, 
                        //              "result": true
                        //          }
                        //}