var file     = require('./lib/weatherfile');
var synaptic = require('synaptic');
var n = -1, i, numBack = 72, numForward = 24, steepness = 0.0425;

var stream  = file.getStream();
var network = new synaptic.Architect.Perceptron(numBack * 3, numBack * 2, numBack, 1);
var trainer = new synaptic.Trainer(network);

var teachData = [];
var tempSigmoid = sigmoid(steepness)
var tempLogit = logit(steepness)

stream.on('data', function(_data) {
  var prev;
  n++;
  prev = teachData[n-numForward];
  teachData[n] = {
    input: [],
    data: _data.slice()
  };

  if (n > numBack) {
    for (i = numBack-1; i >= 0; i--) {
      teachData[n].input.unshift(parseFloat(teachData[i].data[7])); // Hum
      teachData[n].input.unshift(parseFloat(teachData[i].data[8])); // Temp
      teachData[n].input.unshift(parseFloat(teachData[i].data[11])); // Abs press
    }
  }

  if (prev) {
    prev.outputRaw = [_data[8]];
    prev.output = [tempSigmoid(_data[8])];
  }
});

function sigmoid (k) {
  return function(num) {
    return 1 / (1 + Math.pow(Math.E, -k * num));
  };
}
function logit (k) {
  return function(n) {
    return Math.round(-Math.log(1 / n - 1) / k * 10) / 10;
  };
}

//
var rate = 0.1, runs = 1;
var sumDiff = [];

function avgDiff () {
  var res = 0.0, n = sumDiff.length;
  while (n) {
    res += sumDiff[--n];
  }
  return res / sumDiff.length;
}

function medianDiff () {
  return sumDiff.slice().sort()[Math.floor(sumDiff.length/2)];
}

stream.on('finish', function() {
  var trainingSet = teachData.filter(function(d) {
    return d.output && d.input.length;
  });
  while (runs) {
    runs--;
    trainingSet.forEach(function(d, idx, arr) {
      var output    = network.activate(d.input);
      var predicted = tempLogit(output[0]);
      var actual    = tempLogit(d.output[0]);
      var diff      = Math.abs(predicted - actual);
      sumDiff.push(diff);
      network.propagate(rate, d.output);

      //console.log('\033[2J');
      if (idx % 100 === 0) {
        console.log('------------------------------------');
        console.log('Index:       ' + idx);
        console.log('Predicted:   ' + predicted);
        console.log('Actual:      ' + actual);
        console.log('Diff:        ' + diff);
        console.log('Avg diff:    ' + avgDiff());
        console.log('Med diff:    ' + medianDiff());
        console.log('------------------------------------');
        sumDiff = [];
      }
    });
  }
});

  //console.log(trainingSet[0].input);

  //trainer.train(trainingSet);

  //mNet = new convnetjs.MagicNet(
  //  trainingSet.map(function(d) { return {w: d.input}; }),
  //  trainingSet.map(function(d) { return {w: d.output}; }), 
  //  {
  //    train_ratio: 0.7,
  //    num_folds: 1,
  //    num_candidates: 50,
  //    num_epochs: 20,
  //    ensemble_size: 20
  //  }
  //);
  //mNet.onFinishBatch(function() {
  //  console.log('hihihi');
  //  //var output = mNet.predict(teachData[100].input);
  //  //console.log(output, teachData[100].output);
  //});

  //setTimeout(function() {
  //  var output = network.activate(teachData[0].input);
  //  console.log(output);
  //});
  //console.log('Finished');

//layer_defs.push({
//  type: 'input',
//  out_sx: 1,
//  out_depth: 2
//});
//layer_defs.push({
//  type: 'fc',
//  num_neurons: 5,
//  activation: 'sigmoid'
//});
//layer_defs.push({
//  type: 'regression',
//  num_neurons: 1
//});
//
//net.makeLayers(layer_defs);
//
//x = new convnetjs.Vol([0.5, -1.3]);
//trainer = new convnetjs.SGDTrainer(
//  net,
//  {
//    learning_rate: 0.01,
//    momentum: 0.0,
//    batch_size: 1,
//    l2_decay: 0.0001
//  }
//);
//trainer.train(x, [0.7]);
//
//prediction = net.forward(x);
//
