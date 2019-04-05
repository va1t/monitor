import psutil
import requests 
import threading
import datetime
import time
import clr
import os 

URL = "http://10.62.207.147:3001/update_node"
openhardwaremonitor_hwtypes = ['Mainboard','SuperIO','CPU','RAM','GpuNvidia','GpuAti','TBalancer','Heatmaster','HDD']
openhardwaremonitor_sensortypes = ['Voltage','Clock','Temperature','Load','Fan','Flow','Control','Level','Factor','Power','Data','SmallData']
dir_path = os.path.dirname(os.path.realpath(__file__))
cpu_temps = {}


def initialize_openhardwaremonitor():

    file = dir_path + "\OpenHardwareMonitorLib.dll"
    clr.AddReference(file)

    from OpenHardwareMonitor import Hardware

    handle = Hardware.Computer()
    handle.MainboardEnabled = True
    handle.CPUEnabled = True
    handle.RAMEnabled = True
    handle.GPUEnabled = True
    handle.HDDEnabled = True
    handle.Open()
    return handle

def fetch_stats(handle):
    for i in handle.Hardware:
        i.Update()
        for sensor in i.Sensors:
            parse_sensor(sensor)
        for j in i.SubHardware:
            j.Update()
            for subsensor in j.Sensors:
                parse_sensor(subsensor)

def parse_sensor(sensor):
        if sensor.Value is not None:
            if type(sensor).__module__ == 'OpenHardwareMonitor.Hardware':
                sensortypes = openhardwaremonitor_sensortypes
                hardwaretypes = openhardwaremonitor_hwtypes
            else:
                return
            if(hardwaretypes[sensor.Hardware.HardwareType] == 'CPU'):
                if sensor.SensorType == sensortypes.index('Temperature'):
                    if sensor.Hardware.Name in cpu_temps:
                        cpu_temps[sensor.Hardware.Name][sensor.Name] = { 'value': sensor.Value, 'index': sensor.Index}
                    else:
                        cpu_temps[sensor.Hardware.Name] = {}
                        cpu_temps[sensor.Hardware.Name][sensor.Name] = { 'value': sensor.Value, 'index': sensor.Index}

def update_node():
    threading.Timer(1.0, update_node).start()
    
    network = psutil.net_if_addrs()
    network_array = []
    for key in network:
        network_array.append(network[key])

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
        "id" : network_array[0][0][1],
        "network" : {
            "ip" : network_array[0][1][1],
            "mac" : network_array[0][0][1],
            "stats" : network
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
    
    #Open Hardware Monitor Start
    HardwareHandle = initialize_openhardwaremonitor()
    fetch_stats(HardwareHandle)
    data["cpu"]["temps"] = cpu_temps
    r = requests.post(URL, json=data)
    ts = time.time()
    print(datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S') + ': ' + str(r))

update_node()
