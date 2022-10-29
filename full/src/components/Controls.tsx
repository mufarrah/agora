import React, { useState } from "react";
import useClient from "../hooks/useClient";
import { useSignalingClient } from "../hooks/useClient";

import Button from 'react-bootstrap/Button';

export const Controls = (props: {tracks: any, setStart: any, setInCall: any}) => {
    const client = useClient();
    const { tracks, setStart, setInCall } = props;
    const [trackState, setTrackState] = useState({ video: true, audio: true });
    
    const mute = async (type: "audio" | "video") => {
        if (type === "audio") {
            await tracks[0].setEnabled(!trackState.audio);
            setTrackState((ps) => {
                return { ...ps, audio: !ps.audio };
            });
        } else if (type === "video") {
            await tracks[1].setEnabled(!trackState.video);
            setTrackState((ps) => {
                return { ...ps, video: !ps.video };
            });
        }
    };
    
    const leaveChannel = async () => {
        await client.leave();
        client.removeAllListeners();
        tracks[0].close();
        tracks[1].close();
        setStart(false);
        setInCall(false);
    };
    
    return (
        <div className="controls">
        <Button className={trackState.audio ? "on" : ""}
        onClick={() => mute("audio")}>
        {trackState.audio ? "MuteAudio" : "UnmuteAudio"}
        </Button>
        <Button className={trackState.video ? "on" : ""}
        onClick={() => mute("video")}>
        {trackState.video ? "MuteVideo" : "UnmuteVideo"}
        </Button>
        {<Button className='btn-danger' onClick={() => leaveChannel()}>Leave</Button>}
        </div>
        );
    };