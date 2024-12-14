const crypto = require('crypto');
const { store_data } = require('./data');
const { loadModel, predict } = require('./inference');

const preditResult = async (req, h) => {
    
    try {
        
        // Periksa apakah ada file yang diupload
        const { image } = req.payload;
        if (!image) {
            const response = h.response({
                status: "fail",
                message: "Gambar tidak ditemukan"
            });
            response.code(400);
            return response;
        }

        // Periksa ukuran file
        if (image.length >= 1000000) {
            const response = h.response({
                status: "fail",
                message: "Ukuran file terlalu besar. Maksimum 1MB"
            });
            response.code(413);
            return response;
        }

        // Generate ID
        const id = crypto.randomBytes(8).toString('hex');
        const currentTime = new Date().toISOString();

        // Proses prediksi
        const model = await loadModel();
        const predictions = await predict(model, image);

        if (predictions && predictions.length > 0) {
            const result = predictions[0] > 0.5 ? 1 : 0;

            if (result === 0) {
                const response = h.response({
                    status: "success",
                    message: "Model is predicted successfully",
                    data: {
                        id: id,
                        result: "Non-cancer",
                        suggestion: "Penyakit kanker tidak terdeteksi.",
                        createdAt: currentTime,
                    },
                });
                response.code(200);
                return response;
            } else {
                const response = h.response({
                    status: "success",
                    message: "Model is predicted successfully",
                    data: {
                        id: id,
                        result: "Cancer",
                        suggestion: "Segera periksa ke dokter!",
                        createdAt: currentTime,
                    }
                });
                response.code(200);
                return response;
            }
        }

        const response = h.response({
            status: "fail",
            message: "Terjadi kesalahan dalam melakukan prediksi"
        });
        response.code(400);
        return response;

    } catch (error) {
        console.error('Error:', error);
        const response = h.response({
            status: "error",
            message: "Terjadi kesalahan internal server"
        });
        response.code(500);
        return response;
    }
};

const getAll = (req, h) => {
    // implementasi getAll
}

module.exports = { preditResult, getAll }