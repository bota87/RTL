var request = require('request-promise');
var common = require('../../common');
var logger = require('../logger');
var options = {};

exports.listPayments = (req, res, next) => {
  options = common.getOptions();
  options.url = common.getSelLNServerUrl() + '/pay/listPayments';
  request(options).then((body) => {
    logger.info({fileName: 'Payments', msg: 'Payment List Received: ' + JSON.stringify(body.payments)});
    if(!body || body.error) {
      res.status(500).json({
        message: "Payments List Failed!",
        error: (!body) ? 'Error From Server!' : body.error
      });
    } else {
      if ( body &&  body.payments && body.payments.length > 0) {
        body.payments.forEach(payment => {
          payment.created_at_str =  (!payment.created_at) ? '' : common.convertTimestampToDate(payment.created_at);
        });
        body.payments = common.sortDescByKey(body.payments, 'created_at');
      }
      res.status(200).json(body.payments);
    }
  })
  .catch(function (err) {
    return res.status(500).json({
      message: "Payments List Failed!",
      error: err.error
    });
  });
};

exports.decodePayment = (req, res, next) => {
  options = common.getOptions();
  options.url = common.getSelLNServerUrl() + '/pay/decodePay/' + req.params.invoice;
  request(options).then((body) => {
    logger.info({fileName: 'Payments', msg: 'Payment Decode Received: ' + JSON.stringify(body)});
    if(!body || body.error) {
      res.status(500).json({
        message: "Payment Request Decode Failed!",
        error: (!body || search_idx > -1) ? 'Error From Server!' : body.error
      });
    } else {
      body.created_at_str =  (!body.created_at) ? '' : common.convertTimestampToDate(body.created_at);
      body.expire_at_str =  (!body.created_at || !body.expiry) ? '' : common.convertTimestampToDate(body.created_at + body.expiry);
      res.status(200).json(body);
    }
  })
  .catch(function (err) {
    return res.status(500).json({
      message: "Payment Request Decode Failed!",
      error: err.error
    });
  });
};

exports.postPayment = (req, res, next) => {
  options = common.getOptions();
  options.url = common.getSelLNServerUrl() + '/pay';
  options.body = req.body;
  request.post(options).then((body) => {
    logger.info({fileName: 'Payments', msg: 'Payment Post Response: ' + JSON.stringify(body)});
    if(!body || body.error) {
      res.status(500).json({
        message: "Payment Post Failed!",
        error: (!body) ? 'Error From Server!' : body.error
      });
    } else {
      res.status(201).json(body);
    }
  })
  .catch(function (err) {
    return res.status(500).json({
      message: "Payment Post Failed!",
      error: err.error
    });
  });
};
