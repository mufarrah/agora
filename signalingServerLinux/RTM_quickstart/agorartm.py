# Imports
import requests
import json
import os
import subprocess

# Credentials
UID = '81'
CHANNEL_NAME = 'skippy-brett'
FILE_NAME = './build/rtmQuickstart'

# Main 
def initWork():
    credentials = 'https://uldizaax95.execute-api.us-west-1.amazonaws.com/token?channel=' + CHANNEL_NAME + '&userid=' + UID + '&mode=rtm'
    r = requests.get(credentials)
    token = r.text
    for filename in os.listdir(os.getcwd()):
    	proc = subprocess.Popen([FILE_NAME, filename, token, UID, CHANNEL_NAME])
    	proc.wait()
    
if __name__ == '__main__':
    initWork()

