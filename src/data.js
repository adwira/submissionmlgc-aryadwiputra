const { Firestore } = require('@google-cloud/firestore');
const pathKey = "./src/serviceKey.json"

async function store_data(id, data) {
    try{

        const db = new Firestore({
            databaseId: 'adwira-fs-db',
              projectId: 'submissionmlgc-aryadwiputra',
              keyFilename: './src/serviceKey.json'
            });

          const predictionsCollections = db.collection('predictions');

          console.log("berhasil disimpan");
          return predictionsCollections.doc(id).set(data);
    } catch(error){
        console.log(error);
    }
    // Membuat Collection root-level
}

module.exports = store_data;    