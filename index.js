var miio = require('miio');
var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  
  homebridge.registerAccessory("homebridge-mi-fm-controller", "XiaoMiFMController", XiaoMiFMController);
}

function XiaoMiFMController(log, config) {
  this.log = log;
  this.name = config["name"];
  this.syncInterval = config["interval"] || 3000;
  
  this.device = { call: ()=>Promise.reject('device not init yet') }

  miio.device({ address: config["ip"], token: config["token"] })
    .then(d=> this.device = d)
    .catch(err => console.log('get device failed:', err));

  this.service = new Service.Lightbulb(this.name);
  
  this.onState = this.service
    .getCharacteristic(Characteristic.On)
    .on('set', this.setState.bind(this))

  this.volume = this.service
    .getCharacteristic(Characteristic.Brightness)
    .on('set', this.setVolume.bind(this))

  if (this.syncInterval > 0) {
    this.syncTimer = setInterval(() => {
        this._stateSync();
    }, this.syncInterval);
  }
}

XiaoMiFMController.prototype.setState = function(value, callback) {
  this.device.call('play_fm', [ value ? 'on' : 'off' ])
    .then(res => {
      callback()
    })
    .catch(err=>{
      this.log('play_fm failed:', err)
      callback()
    });
}

XiaoMiFMController.prototype.setVolume = function(value, callback) {
  this.device.call('volume_ctrl_fm', [ value.toString() ])
    .then(res => callback())
    .catch(err=>{
      this.log('volume_ctrl_fm failed:', err)
      callback()
    });
}

XiaoMiFMController.prototype.getPropFm = function(){
  return this.device.call('get_prop_fm', [])
    .catch(err=>{
      this.log('get_prop_fm failed:', err)
      return {}
    })
}

XiaoMiFMController.prototype._stateSync = function(){
  this.getPropFm().then(prop=>{
    this.volume.updateValue(+prop['current_volume'] || 0)
    this.onState.updateValue(prop['current_status'] == 'run')
  })
}

XiaoMiFMController.prototype.getServices = function() {
  return [this.service];
}