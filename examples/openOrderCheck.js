// In this example, we will try to place a limit order and to 
//  receive the orderStatus, as well as to poll for openOrders.

var addon = require('../ibapi'),
  messageIds = addon.messageIds,
  contract = addon.contract,
  order = addon.order;

var api = new addon.NodeIbapi();
var orderId = -1;

var msftContract = contract.createContract();
msftContract.symbol = 'MSFT';
msftContract.secType = 'STK';
msftContract.exchange = 'SMART';
msftContract.primaryExchange = 'NASDAQ';
msftContract.currency = 'USD';

var placeThatOrder = function () {
    console.log('Next valid order Id: %d',orderId);
    console.log("Placing order for MSFT");
    var oldId = orderId;
    orderId = orderId + 1;
    setImmediate(api.placeSimpleOrder.bind(
      api, oldId, msftContract, "BUY", 1000, "LMT", 0.11, 0.11));
};
var cancelPrevOrder = function (prevOrderId) {
  console.log('canceling order: %d', prevOrderId);
  setImmediate(api.cancelOrder.bind(api, prevOrderId));
};

var handleValidOrderId = function (message) {
  orderId = message.orderId;
  console.log('next order Id is ' + orderId);
  setInterval(placeThatOrder, 1000);
};

var handleServerError = function (message) {
  console.log('Error: ' + message.id.toString() + '-' +
              message.errorCode.toString() + '-' +
              message.errorString.toString());
};

var handleClientError = function (message) {
  console.log('clientError');
  console.log(JSON.stringify(message));
};

var handleDisconnected = function (message) {
  console.log('disconnected');
  process.exit(1);
};

var handleOrderStatus = function (message) {
  console.log('OrderStatus: ');
  console.log(JSON.stringify(message));
  if (message.status == "PreSubmitted")
    cancelPrevOrder(message.orderId);
};

var handleOpenOrder = function (message) {
  console.log('OpenOrder: ');
  console.log(JSON.stringify(message));
};

var handleOpenOrderEnd = function (message) {
  console.log('OpenOrderEnd: ');
  console.log(JSON.stringify(message));
};

api.handlers[messageIds.nextValidId] = handleValidOrderId;
api.handlers[messageIds.svrError] = handleServerError;
api.handlers[messageIds.clientError] = handleClientError;
api.handlers[messageIds.disconnected] = handleDisconnected;
api.handlers[messageIds.orderStatus] = handleOrderStatus;
api.handlers[messageIds.openOrder] = handleOpenOrder;
api.handlers[messageIds.openOrderEnd] = handleOpenOrderEnd;

var connected = api.connect('127.0.0.1', 7496, 0);

if (connected) {
  api.beginProcessing();
}
