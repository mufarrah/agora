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
    const [latency, setLatency] = useState<{}>({});let pingTime = 0;
    const [agoraChannel, setAgoraChannel] = useState<RtmChannel>();
    const [signalingLatency, setSignalingLatency] = useState<{}>({
        "Browser to Robot": 0, 
        "Round Trip": 0, 
        "One Way": 0
    });
    const [inputLatency, setInputLatency] = useState<{}>({
        "Browser to Robot": 0, 
        "Round Trip": 0, 
        "One Way": 0});
        const client = useClient();
        const { ready, tracks } = useMicrophoneAndCameraTracks();
        const [ws, setWs] = useState<WebSocket>();
        
        //AGORA CAMERAS
        useEffect(() => {
            
            // function to initialise the SDK
            let init = async (name: string) => {
                client.on("user-published", async (user, mediaType) => {   
                    await client.subscribe(user, mediaType);
                    console.log("subscribe success");
                    if (mediaType === "video") {
                        setUsers((prevUsers: any) => { //THIS CONTAINS ONLY ROBOT CAMERAS
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
        
        
        // FUNCTION TO CONNECT TO CERTAIN CHANNEL
        const agoraSignaling_connect = async () => {
            try{
                await useSignalingClient.login({uid:channelName, token: token});
                const channel = useSignalingClient.createChannel(channelName);
                await channel.join();
                setAgoraChannel(channel);
            } catch (error) {
                console.log(error);
            }
        }
        
        // FUNCTION TO SEND MESSAGE TO CERTAIN CHANNEL
        const agoraSignaling_sendMessage = () => {
            try{
                // MESSAGE TO SERVER
                pingTime = new Date().getTime();
                const apiCall = {
                    "op": "call_service",
                    "service": "ping_status",
                    "args": {
                        "Ping_time": pingTime
                    }
                }
                const message = useSignalingClient.createMessage({
                    text: JSON.stringify(apiCall)
                });
                
                // SENDING THE MESSAGE
                console.log("++ Sending message ++");
                agoraChannel.sendMessage(message);
                // agoraChannel.removeAllListeners();
            } catch (error) {
                console.log(error);
            }
        }
        
        //AGORA SIGNALING
        useEffect(() => {
            if ( agoraChannel===undefined || agoraChannel===null ) {
                agoraSignaling_connect();
            } else {
                
                agoraSignaling_sendMessage();
                //RECIEVING MESSAGES
                agoraChannel.on('ChannelMessage', ({ text }, senderId) => {
                    console.log('++ Message received: ++', text, ' || from user ', senderId);
                    const recived = JSON.parse(text!);
                    const pongTime = new Date().getTime();
                    setSignalingLatency({
                        "Browser to Robot": Math.trunc(recived.values.Pong_time) - pingTime,
                        "Round Trip": pongTime - pingTime,
                        "One Way": (pongTime - pingTime)/2
                    });
                    agoraSignaling_sendMessage();
                    // setTimeout(() => { newChannel.removeAllListeners(); }, 1000);
                });
                agoraChannel.on('MemberJoined', () => {
                    agoraSignaling_sendMessage();
                });
                agoraChannel.on('MemberLeft', () => {
                    setSignalingLatency({
                        "Browser to Robot": 0,
                        "Round Trip": 0,
                        "One Way": 0
                    });
                });
            }
            
            return () => {
                if(agoraChannel) {
                    agoraChannel.leave();
                    useSignalingClient.logout();
                    setAgoraChannel(null);
                }
            }
        }, [agoraChannel]);
        
        
        //WEB SOCKET
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
                        },
                    }
                    //SENDING THE MESSAGE
                    ws.send(JSON.stringify(apiCall));
                    ws.onmessage = (event) => {
                        const data = JSON.parse(event.data);
                        const pongTime = new Date().getTime();
                        setInputLatency({
                            "Browser to Robot": Math.trunc(data.values.Pong_time*1000) - pingTime , 
                            "Round Trip": pongTime - pingTime, 
                            "One Way": (pongTime - pingTime)/2});setLatency
                        }
                    }
                }, 500);
                return () => {
                    clearInterval(interval);
                    if (ws!=null) {
                        ws.close();
                    }
                }
            }, [ip,ws]);
            
            
            
            setInterval(() => {
                setLatency(client.getRemoteVideoStats());
            }, 500);
            
            
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
                        })}</ul>
                        <ul className="latency">
                        <strong>WS Latency:</strong>
                        {Object.keys(inputLatency).map((key) => {
                            return (
                                <li key={key}>
                                <strong>{key}:</strong> {inputLatency[key]}
                                <br />
                                </li>
                                );
                                
                            })}</ul> <ul className="latency">
                            <strong>Signaling Latency:</strong>
                            {Object.keys(signalingLatency).map((key) => {
                                return (
                                    <li key={key}>
                                    <strong>{key}:</strong> {signalingLatency[key]}
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