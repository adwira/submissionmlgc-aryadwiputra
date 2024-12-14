    const Hapi = require('@hapi/hapi');
    const crypto = require('crypto');
    const  store_data = require('./data');
    const getAllData = require('./getData')
    const { loadModel, predict } = require('./inference');

    const init = async () => {
        const server = Hapi.server({
            port: process.env.PORT || 8080,
            host: '0.0.0.0',
            routes: {
                cors: {
                    origin: ['https://frontend-dot-submissionmlgc-aryadwiputra.lm.r.appspot.com/'],
                },
            },
        });

        server.route({
            method: 'POST',
            path: '/predict',
            handler: async (req, h) => {
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
                            message: "Payload content length greater than maximum allowed: 1000000"
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
                            // Simpan hasil ke Firestore
                            const colData = {
                              id : id,
                              result: 'Non-cancer',
                              suggestion: 'Penyakit kanker tidak terdeteksi.',
                              createdAt: currentTime,
                            };
                            await store_data(id, colData);

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
                            response.code(201);
                            return response;
                        } else {
                            // Simpan hasil ke Firestore
                            const colData = {
                              id : id,
                              result: 'Cancer',
                              suggestion: 'Segera periksa ke dokter!',
                              createdAt: currentTime,
                            };
                            await store_data(id, colData);

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
                            response.code(201);
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
                        status: "fail",
                        message: "Terjadi kesalahan dalam melakukan prediksi"
                    });
                    response.code(400);
                    return response;
                }
            },
            options: {
              payload: { 
                  allow: ['multipart/form-data'],
                  multipart:true,
                  maxBytes: 100000000
              }
          } 
        });

        server.route({
          method : 'GET',
            path : '/predict/histories',
            handler : async (req, h) => {
              const historiesData = await getAllData();

              const formatHistoriesData = [];
              console.log(historiesData);

              historiesData.forEach(doc => {
                const data = doc.data();
                formatHistoriesData.push({
                  id: doc.id,
                  history:{
                    result: data.result,
                    createdAt: data.createdAt,
                    suggestion: data.suggestion,
                    id: doc.id
                  }
                })
              });

              const response = h.response({
                status:'success',
                data: formatHistoriesData
              })
              response.code(200)
              return response
            },
        })
        await server.start();
        console.log(`Server berjalan pada ${server.info.uri}`);
    };

    process.on('unhandledRejection', (err) => {
        console.log(err);
        process.exit(1);
    });

    init();