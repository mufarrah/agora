import React, { useState } from "react";
import useClient from "../hooks/useClient";

import Button from 'react-bootstrap/Button';

export const Controls = (props: { setStart: any, setInCall: any}) => {
    const client = useClient();
    const { setStart, setInCall } = props;

    const leaveChannel = async () => {
        await client.leave();
        client.removeAllListeners();
        setStart(false);
        setInCall(false);
    };
    
    return (
        <div className="controls" style={{display:"flex",justifyContent:"center",width:"100%"}}>
        {<Button className='btn-danger' onClick={() => leaveChannel()}>Leave</Button>}
        </div>
        );
    };