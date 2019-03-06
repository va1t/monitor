import psutil
import requests 
import threading
import datetime
import time

URL = "http://localhost:3001/update_node"

def update_node():
    threading.Timer(1.0, update_node).start()
    data = {
    "memory" : psutil.virtual_memory(),
    "disk" : psutil.disk_usage('/'),
    "address" : psutil.net_if_addrs(),
    "battery" : psutil.sensors_battery(),
    "user" : psutil.users()
    }
    r = requests.post(URL, json=data)
    ts = time.time()
    print(datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S') + ': ' + str(r))

update_node()