var datesin = function (date) {
  var d1, d2, d1prim;

  if (!date) {
    date = +(new Date());
  }

  d1 = new Date(date);
  d1.setMonth(0);
  d1.setDate(0);

  d2 = new Date(date);
  d2.setMonth(11);
  d2.setDate(30);

  d1prim = +(d1 - d2);
};

