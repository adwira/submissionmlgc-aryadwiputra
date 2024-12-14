const {Firestore} = require('@google-cloud/firestore');

async function getAllData() {
    try {
        const db = new Firestore({
            databaseId: 'adwira-fs-db',
            projectId: 'submissionmlgc-aryadwiputra',
            keyFilename: './src/serviceKey.json' 
        });
        
        const predictCollection = db.collection('predictions');
        const snapshot = await predictCollection.get();
        
        // Convert ke array of documents
        const data = [];
        snapshot.forEach(doc => {
            data.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return data;
        
    } catch (error) {
        console.error('Error getting documents:', error);
        throw error;
    }
}

module.exports = getAllData;