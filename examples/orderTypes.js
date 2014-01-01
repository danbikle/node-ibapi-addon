// In this example, we will submit orders through different ways
var addon = require('../build/Release/NodeIbapiAddon');
var obj = new addon.NodeIbapi();
var ibcontract = require('../lib/contract');

obj.connect('127.0.0.1',7496,0);

var orderId = -1;
var counter = 0;
var validOrderId = -1;
var once = false;
var ready = false;
var clientError;
var srvError;

var time = process.hrtime();
var diff = process.hrtime(time);
var funqueue = []; // function queue

var addReqId = function () {
  obj.reqIds(1);
}

while(obj.isConnected()) {
  diff = process.hrtime(time);
  
  // timed function queue
  if (diff[1] > 21000000) {
    time = process.hrtime();
    if (funqueue[0] != null) {
      (funqueue.shift())();
    }
  }

  obj.checkMessages();
  obj.processMsg();
  clientError = obj.getWinError();
  srvError = obj.getError();

  if (clientError[0] != "") {
    console.log('Client error');
  }
  if (srvError[0] != -1) {
    console.log('Error: ' + srvError[0].toString() + ' - ' + 
      srvError[1].toString() + ' - ' + srvError[2].toString());
  }

 // retrieve validOrderId
  validOrderId = obj.getNextOrderId();
  if (validOrderId < 0 && !once) {
    once = true;
    funqueue.push(addReqId);
  }
  if (validOrderId > 0 && !ready) {
      ready = true;
      orderId = validOrderId;
  }
  
  // submit an order through fully described contract
  if (counter == 100000 && ready) {
    console.log('Next valid order Id: %d',orderId);
    console.log("Placing order for MSFT");
    var msftContract = ibcontract.createContract();
    msftContract.symbol = 'MSFT';
    msftContract.secType = 'STK';
    msftContract.exchange = 'SMART';
    msftContract.primaryExchange = 'NASDAQ';
    msftContract.currency = 'USD';

    obj.placeOrder(orderId,msftContract,"BUY", 1000, "LMT", 0.11);
    orderId = orderId + 1;
  } 
  if (counter == 200000 && ready) {
    console.log('canceling order: %d', orderId-1);
    obj.cancelOrder(orderId-1);
  }

  // submit an order through Contract ID from IB Contract Specifications
  if (counter == 250000 && ready) {
    console.log('Next valid order Id: %d',orderId);
    console.log("Placing order for MSFT using conId");
    var msftContract = ibcontract.createContract();
    msftContract.conId = 272093; // you can look this up from Contract Details in TWS
    msftContract.exchange = 'SMART';

    obj.placeOrder(orderId,msftContract,"BUY", 1000, "LMT", 0.11);
    orderId = orderId + 1;
  }
  if (counter == 290000 && ready) {
    console.log('canceling order: %d', orderId-1);
    obj.cancelOrder(orderId-1);
  }

  if (counter == 500000 && ready) {
    counter = 0;
  }
  counter = counter + 1;
}