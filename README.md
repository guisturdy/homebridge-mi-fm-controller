A homebridge plugin let you can control XiaoMi Gateway FM.

### Feature

* Switch on / off.
* Control volume.

### Installation

```
sudo npm install -g homebridge-mi-fm-controller
```

### Configuration

```
{
    "accessories": [
        {
            "accessory": "XiaoMiFMController",
            "name": "FM",
            "ip": "YOU_GATEWAY_IP",
            "token": "YOU_GATEWAY_TOKEN"
        }
    ]
}
```

