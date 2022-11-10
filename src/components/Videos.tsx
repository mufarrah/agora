import React from "react";

import {
    IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";
import { AgoraVideoPlayer } from "agora-rtc-react";

export const Videos = (props: {
    users: IAgoraRTCRemoteUser[];
}) => {
    const { users } = props;
    
    return (
        <div>
        <div id="videos">
        {users.length > 0 &&
            users.map((user) => {
                if (user.videoTrack) {
                    return ( //THIS RETURNS ONLY ROBOT CAMERAS
                        <AgoraVideoPlayer className='vid' videoTrack={user.videoTrack} key={user.uid} />
                        );
                    } else return null;
                })}
                
                </div>
                </div>
                );
            };