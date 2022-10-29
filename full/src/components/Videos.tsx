import React from "react";

import {
    IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";
import { AgoraVideoPlayer, ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-react";

export const Videos = (props: {
    users: IAgoraRTCRemoteUser[];
    tracks: [IMicrophoneAudioTrack, ICameraVideoTrack];
}) => {
    const { users, tracks } = props;
    
    return (
        <div>
        <div id="videos">
        <AgoraVideoPlayer className='vid' videoTrack={tracks[1]} />
        {users.length > 0 &&
            users.map((user) => {
                if (user.videoTrack) {
                    return (
                        <AgoraVideoPlayer className='vid' videoTrack={user.videoTrack} key={user.uid} />
                        );
                    } else return null;
                })}
                </div>
                </div>
                );
            };