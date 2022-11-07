#include <iostream>
#include <memory>
#include <vector>
#include <string>
#include <thread>
#include <sstream>
#include <unistd.h>
#include <pthread.h>
#include <vector>
#include <map>
#include <algorithm>
#include <stdlib.h>

#include "IAgoraRtmService.h"

using namespace std;

string APP_ID = "01c84bffc1d14fe3a6796d4e0726a4cb";
string Token = "00601c84bffc1d14fe3a6796d4e0726a4cbIADf4pe+VKgzGaAMX5AdFe7x/taY0zIX1Kf+TOelP5GSdj6umAcAAAAAEACH+UbwGQNkYwEA6AMAAAAA";
string AGORA_CHANNEL = "skippy-brett";
string USER_ID = "81";
bool flag = false;

class RtmEventHandler: public agora::rtm::IRtmServiceEventHandler {
public:
RtmEventHandler() {}
~RtmEventHandler() {}
// The user logs in successfully
virtual void onLoginSuccess() override {
    flag = true;
    cout << "on login success"<< endl;
}
// The user fails to log in
virtual void onLoginFailure(agora::rtm::LOGIN_ERR_CODE errorCode) override {
      cout << "on login failure: errorCode = "<< errorCode << endl;
     }
 // The user logs out successfully
 virtual void onLogout(agora::rtm::LOGOUT_ERR_CODE errorCode) override {
     cout << "on logout" << endl;
     }
 // The user's connection state changes
 virtual void onConnectionStateChanged(agora::rtm::CONNECTION_STATE state,
             agora::rtm::CONNECTION_CHANGE_REASON reason) override {
     cout << "on connection state changed: state = " << state << endl;
     }
 // The system gets the result of a sent peer-to-peer message
 virtual void onSendMessageResult(long long messageId,
             agora::rtm::PEER_MESSAGE_ERR_CODE state) override {
     cout << "on send message messageId: " << messageId << " state: " << state << endl;
     }
 // The user receives a peer-to-peer message
 virtual void onMessageReceivedFromPeer(const char *peerId,
             const agora::rtm::IMessage *message) override {
     cout << "on message received from peer: peerId = " << peerId
         << " message = " << message->getText() << endl;
     }
 };

class ChannelEventHandler: public agora::rtm::IChannelEventHandler {
public:
  ChannelEventHandler(string channel) {
      channel_ = channel;
 }
 ~ChannelEventHandler() {}
 // The user joins the channel successfully
 virtual void onJoinSuccess() override {
     cout << "on join channel success" << endl;
 }
 // The user fails to join the channel
 virtual void onJoinFailure(agora::rtm::JOIN_CHANNEL_ERR errorCode) override{
     cout << "on join channel failure: errorCode = " << errorCode << endl;
 }
 // The user leaves the channel
 virtual void onLeave(agora::rtm::LEAVE_CHANNEL_ERR errorCode) override {
     cout << "on leave channel: errorCode = "<< errorCode << endl;
 }
 // The user receives a channel message
 virtual void onMessageReceived(const char* userId,
                     const agora::rtm::IMessage *msg) override {
     cout << "receive message from channel: "<< channel_.c_str()
          << " user: " << userId << " message: " << msg->getText()
          << endl;
 }
 // The system sends a notification when the user joins the channel
 virtual void onMemberJoined(agora::rtm::IChannelMember *member) override {
     cout << "member: " << member->getUserId() << " joined channel: "
          << member->getChannelId() << endl;
 }
 // The system sends a notification when the user leaves the channel
 virtual void onMemberLeft(agora::rtm::IChannelMember *member) override {
     cout << "member: " << member->getUserId() << " lefted channel: "
          << member->getChannelId() << endl;
 }
 // The system gets the list of users in the channel
 virtual void onGetMembers(agora::rtm::IChannelMember **members,
                 int userCount,
                 agora::rtm::GET_MEMBERS_ERR errorCode) override {
     cout << "list all members for channel: " << channel_.c_str()
          << " total members num: " << userCount << endl;
     for (int i = 0; i < userCount; i++) {
         cout << "index[" << i << "]: " << members[i]->getUserId();
     }
 }
 // The system gets the result of a sent channel message
 virtual void onSendMessageResult(long long messageId,
                 agora::rtm::CHANNEL_MESSAGE_ERR_CODE state) override {
     cout << "send messageId: " << messageId << " state: " << state << endl;
 }
 private:
     string channel_;
 };

class Quickstart {
   public:
   // A constructor that creates an IRtmService instance
   Quickstart() {
       eventHandler_.reset(new RtmEventHandler());
       agora::rtm::IRtmService* p_rs = agora::rtm::createRtmService();
       rtmService_.reset(p_rs, [](agora::rtm::IRtmService* p) {
           p->release();
       });

        if (!rtmService_) {
            cout << "Failed to create  service! Check your App ID" << endl;
            //exit(0);
       }

        if (rtmService_->initialize(APP_ID.c_str(), eventHandler_.get())) {
            cout << "Failed to initialize  service!" << endl;
            //exit(0);
         }
      }
     // A destructor that releases an IRtmService instance
     ~Quickstart() {
         rtmService_->release();
     }

     public:
         // Log in to Signaling
         bool login() {
                 if (rtmService_->login(Token.c_str(), USER_ID.c_str())) {
                     cout << "login failed!" << endl;
                     return false;
                 }
                 cout << "login didn't failed" << endl;
                 return true;
         }
         // Log out of Signaling
         void logout() {
             rtmService_->logout();
             cout << "log out!" << endl;
         }
         // Start a group chat
         void groupChat(const std::string& channel) {
             string msg;
             channelEvent_.reset(new ChannelEventHandler(channel));
             agora::rtm::IChannel * channelHandler =
                 rtmService_->createChannel(channel.c_str(), channelEvent_.get());
             if (!channelHandler) {
                 cout << "create channel failed!" << endl;
             }
                channelHandler->join();
         }
         // Send a peer-to-peer message
         void sendMessageToPeer(std::string peerID, std::string msg) {
             agora::rtm::IMessage* rtmMessage = rtmService_->createMessage();
             rtmMessage->setText(msg.c_str());
             int ret = rtmService_->sendMessageToPeer(peerID.c_str(),
                                             rtmMessage);
             rtmMessage->release();
             if (ret) {
                 cout << "send message to peer failed! return code: " << ret
                     << endl;
             }
         }
         // Send a channel message
         void sendMessageToChannel(agora::rtm::IChannel * channelHandler,
                                 string &msg) {
             agora::rtm::IMessage* rtmMessage = rtmService_->createMessage();
             rtmMessage->setText(msg.c_str());
             channelHandler->sendMessage(rtmMessage);
             rtmMessage->release();
         }
         private:
             std::unique_ptr<agora::rtm::IRtmServiceEventHandler> eventHandler_;
             std::unique_ptr<ChannelEventHandler> channelEvent_;
             std::shared_ptr<agora::rtm::IRtmService> rtmService_;
         };

int main(int argc, const char * argv[]) {
    int index = 1; //AMOUNT OF INSTANCES
    std::vector<std::unique_ptr<Quickstart>> FunctionList;
    std::vector<bool> loginStatus;
    for (int i = 0; i < index; i++) {
    std::unique_ptr<Quickstart> tmp;
    tmp.reset(new Quickstart());
    FunctionList.push_back(std::move(tmp));
    loginStatus.push_back(false);
    }
        while(true) {
            if (!loginStatus[index-1]) {
                if (!FunctionList[index-1]->login())
                    continue;
                loginStatus[index-1] = true;
            }
            if (flag){
                FunctionList[index-1]->groupChat(AGORA_CHANNEL);
                flag = false;
                }
        }
    exit(0);
}