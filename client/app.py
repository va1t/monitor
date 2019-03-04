import psutil
import requests 

URL = "http://localhost:3001/update_node"

data = {
"memory" : psutil.virtual_memory(),
"disk" : psutil.disk_usage('/'),
"address" : psutil.net_if_addrs(),
"battery" : psutil.sensors_battery(),
"user" : psutil.users()
}

r = requests.post(URL, json=data)


print(r)