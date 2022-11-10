import React from "react";
import { Button, ListGroup } from "react-bootstrap";


export const ChannelForm = (props: {
    setInCall: React.Dispatch<React.SetStateAction<boolean>>;
    setChannelName: React.Dispatch<React.SetStateAction<string>>;
    credentials: { appId: string; robots: string[]; ips: string[]; channel: string[]; token: string[]; uid: number; };
    setToken: React.Dispatch<React.SetStateAction<string>>;
    setIp: React.Dispatch<React.SetStateAction<string>>;
}) => {
    const { setInCall, setChannelName, credentials, setToken, setIp } = props;
    
    return (
        <div>
        <ListGroup as="ul">
        {credentials.channel.map((channel, index) => {
            const token = credentials.token[index];
            const ip = credentials.ips[index];
            return (
                <ListGroup.Item as="li" key={index}
                onClick={(e) => {
                    setChannelName(channel)
                    setInCall(true)
                    setToken(token)
                    setIp(ip)
                }}
                >
                    <Button>{credentials.robots[index]}</Button>
                </ListGroup.Item>
                );
        })}
        </ListGroup>
        </div>
        );
    };