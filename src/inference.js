const tfjs = require('@tensorflow/tfjs-node');

function loadModel() {
  const modelUrl = "https://storage.googleapis.com/adwira-bucket/models/model.json";
  return tfjs.loadGraphModel(modelUrl);
}   

async function predict(model, imageBuffer) {
    const tensor = tfjs.node
      .decodeJpeg(imageBuffer)  
      .resizeNearestNeighbor([224, 224])
      .expandDims()
      .toFloat();
    const prediction = model.predict(tensor);
    const score = await prediction.data();
    const confidenceScore = Math.max(...score) * 100;
    return model.predict(tensor).data();
  }
   
  module.exports = { loadModel, predict };