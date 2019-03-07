import psutil
import requests 
import threading
import datetime
import time

URL = "http://localhost:3001/update_node"

def update_node():
    threading.Timer(1.0, update_node).start()
    data = {
        "cpu": {
            "percent" : psutil.cpu_percent(interval=None, percpu=True),
            "cores" : psutil.cpu_count(logical=False),
            "logical_cores" : psutil.cpu_count(),
            "freq" : psutil.cpu_freq(percpu=True)
        },
        "user" : psutil.users()[0][0],
        "memory" : {
            "total" : psutil.virtual_memory()[0],
            "available" : psutil.virtual_memory()[1],
            "percent" : psutil.virtual_memory()[2],
            "used" : psutil.virtual_memory()[3]
        },
        "id" : psutil.net_if_addrs()['Ethernet'][0][1],
        "network" : {
            "ip" : psutil.net_if_addrs()['Ethernet'][1][1],
            "mac" : psutil.net_if_addrs()['Ethernet'][0][1],
            "stats" : psutil.net_if_stats()
        },
        "disk": {
            "total" : psutil.disk_usage('/')[0],
            "used" : psutil.disk_usage('/')[1],
            "free" : psutil.disk_usage('/')[2],
            "percent" : psutil.disk_usage('/')[3]
        },
        "battery_percent" : "None",
        "uid" : '116652641507820213849'
    }
    if psutil.sensors_battery() is None:
        data["battery_percent"] = 'None'
    else:
        data["battery_percent"] = psutil.sensors_battery()[0]

    r = requests.post(URL, json=data)
    ts = time.time()
    print(datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S') + ': ' + str(r))

# update_node()
update_node()