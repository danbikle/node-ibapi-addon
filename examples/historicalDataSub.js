// In this example, we will request and receive a historical market data

var addon = require('../ibapi');
var obj = new addon.NodeIbapi();
var ibcontract = require('../lib/contract');

var orderId = -1;
var processIbMsg = function () {
  obj.processIbMsg();
}
var addReqId = function () {
  obj.addReqId(1);
}
var doReqFunc = function () {
  obj.doReqFunc();
}
var msftContract = ibcontract.createContract();
msftContract.symbol = 'MSFT';
msftContract.secType = 'STK';
msftContract.exchange = 'SMART';
msftContract.primaryExchange = 'NASDAQ';
msftContract.currency = 'USD';

var subscribeMsft = function () {
  obj.reqHistoricalData(1,msftContract,"20131001 00:00:00","10 D","1 hour","MIDPOINT","1","1");
}

obj.on('connected', function () {
  console.log('connected');
  setInterval(processIbMsg,0.1);
  obj.funcQueue.push(addReqId);
  obj.funcQueue.push(subscribeMsft);
})
.once('nextValidId', function (data) {
  orderId = data.orderId;
  console.log('nextValidId: ' + orderId);
  setInterval(doReqFunc,100);
})
.on('clientError', function (clientError) {
  console.log('Client error' + clientError.id.toString());
})
.on('svrError', function (svrError) {
  console.log('Error: ' + svrError.id.toString() + ' - ' + 
    svrError.errorCode.toString() + ' - ' + svrError.errorString.toString());
})
.on('historicalData', function (data) {
  if (data.date.toString().indexOf("finished") < 0) {
  console.log(data.date + ' - ' + data.open + ' - ' + data.high + ' - ' +
    data.low + ' - ' + data.close + ' - ' + data.volume + ' - ' +
    data.barCount + ' - ' + data.WAP + ' - ' + data.hasGaps
    )
  }
  else {
    console.log('End of Historical Data');
  }

})
.on('disconnected', function () {
  console.log('disconnected');
  process.exit(1);
})

obj.connectToIb('127.0.0.1',7496,0);