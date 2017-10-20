'use strict';let save = (() => {var _ref = _asyncToGenerator(



























  function* () {
    const key = `test-key${Date.now()}.jpg`;
    const buffer = readFile("./test/assets/image.jpg");
    const mimeType = 'image/jpeg';

    try {
      const res = yield storage.save(key, buffer, mimeType);
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  });return function save() {return _ref.apply(this, arguments);};})();function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}const fs = require('fs');const path = require('path');const createStorage = require('./index');function readFile(relPath) {return fs.readFileSync(path.join(__dirname, relPath));}const storage = createStorage({ gcs: { projectId: 'bloggsta-181813', bucket: 'bloggsta-181813.appspot.com', credentials: { "type": "service_account", "project_id": "bloggsta-181813", "private_key_id": "b20861ad2714b9ced259900bf09e4e86a7fc9d59", "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDJM5aW6qa26X0K\nZ6HZ8npuxEnPFjULEsTtB+hgF0snyLOYJJz1aq4fVFuFBQF/oHft1iQX8rZwo2E1\nbs5p3Z9lXuyFZaob2kBm/vf9s7ocu9n8Roy4jR1OKdH+VtZ7GVwKoPaLbIH1TJhd\nyxf+pXOhxXt3Ynm3+0lvoAGeUbJEItQqU7PCUSThxeauhL8cUCHooNKowIP08gk9\nYNYFMecZexk0cq0g27mlmu2BukwrZRST/yD+0wkI24wKZIuVlCF28QPi8EFjx579\nOz93osXFwaCh8L90P9Px7bPBDlL5rhj7gFrrYduSNorOUV9932Jnd58j3P1vdqWr\nSLm5+D1JAgMBAAECggEAA1sMm9Endtw92zTNVb+XptIEqg3kh5WEMAYe5/GA2Hwe\nV8FKK6us+/fIPk8SXUsPFhBtrb7WlrgBQeBzD93QwPwZNUzAm0EuX1QNXlGewS7L\nrfY37Zy1sun/tgkhmVzb4W1eB9P+1FlIHrzhCXhiFfWXDngs9EFaBW2/HF0Xc76R\nxeXXlObiQvpxFx3fsK4+MAJGZ451lVuMkeTZwZr61tEEDWohqbkbZfDHuf6N/B5y\noNP8JN6Xi/brHxyOp2+xCvryEjb89JFapu9bdhnwelQdG5ypQZi/NzFGtAwbByZX\naDu9c5tOsUpMzYlh6WfvTh6YGT9NVII463l3alWRewKBgQDztIKIxfMfeU2Cg5X0\nYMLXpk1OvGo/niITOkD3AZp4jAaNwts96LSj2BjYWaiaKzWBCVUNEAbPok9M1NNi\noNbw5bIZzfOkxYW/p0iRhyJG4O7DHCRFilF/qUqSOpiNLy26RELQ0+/7BMng9ZGt\n2321sVSvnWiG5hN8A5wZ0VNEXwKBgQDTWiM7eMO9UbJHpoy78PG2H9X1rgGjJsKk\nwSR/K3QaOtQYJHxBcxpK0yBesGJUwoazDnObZTDKWxxkJSFjGq2inHGX5CHVuKSQ\naMi7soOXlk968fjl1xGHOR5poBiiA5vyWDnHq5O4hMKqzmBv2OUWbeH2HMlooT26\nq860ZOufVwKBgQDTpLkUNOzOMZdZuBL7dyjfBULwFPskop0vG5EdslvHQrvSUx35\npuVxwRLamQquUMYXeNZPENMJcQjzTYUCi3H/JUvF0zE7sHpWFd4U3EmtSlywPvlV\nFylt98SWN6MSQZ2xvORV3Sj1U5RK9Jj+ZrbGmulT1hzXwmm7cpsXZM2uewKBgEcq\n7vozrBWv0Mx3tKQEeh/NkIpt0XdSsfAwaU25IBtE++41OvH/BDd16Ex6MGJCLoFU\nuHD3HfrFu0WtixSIAzfiXg27b/k7d454+j7Z2Z3Nq23G1Pzv8qMKBMekdSb4+CYe\ntzYY/GEBs1s4qxh+fIWU8qWhA+ELinG1MKFl6kF5AoGBAIGdGR5LZfycIDsW5jaN\nlpwBg8N2n9u/t4PvJh/TmlOGwGmXSTUwT0qujfTKenHnkaFAq+feTOhn1/dhcByc\nKPiEb8muuz1mJH09EIhTfQF6JDExyfn09jC221xVfJvM74L/IZ1m19Vh+wvTqjfr\nqzba76sqLMM22UqpAq15CzEf\n-----END PRIVATE KEY-----\n", "client_email": "bloggsta-181813@appspot.gserviceaccount.com", "client_id": "118371750447561856145", "auth_uri": "https://accounts.google.com/o/oauth2/auth", "token_uri": "https://accounts.google.com/o/oauth2/token", "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs", "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/bloggsta-181813%40appspot.gserviceaccount.com" } } });save();