const { Firestore } = require('@google-cloud/firestore');
 
async function store_data(id, data) {
  const db = new Firestore({
databaseId: 'adwira-fs-db',
  projectId: 'submissionmlgc-aryadwiputra',
  keyFilename: './src/serviceKey.json'
});
 
  const predictCollection = db.collection('predictions');
  return predictCollection.doc(id).set(data);
}
 
module.exports = store_data;