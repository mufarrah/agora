import { ClientConfig, createClient, UID } from "agora-rtc-react";
import AgoraRTM from "agora-rtm-sdk";

const config: ClientConfig = { 
    mode: "rtc", codec: "h264",
};

export const appId: string = "01c84bffc1d14fe3a6796d4e0726a4cb"; //ENTER APP ID HERE

const useClient = createClient(config);

export default useClient;

export const useSignalingClient = AgoraRTM.createInstance(appId);


// let client = await AgoraRTM.createInstance(appId);
// await client.login({ uid, token });

// const channel = client.createChannel(name);
// await channel.join();

// await channel.sendMessage({ text });

// await channel.leave();
// await client.logout();