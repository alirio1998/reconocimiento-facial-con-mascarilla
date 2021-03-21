let video;
let extractor;
let calificador;
let imgMascarilla=0;
let imgSinMascarilla=0;
let error=0;

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('models'),
    faceapi.nets.faceExpressionNet.loadFromUri('models')
  ]).then(startVideo)
  
  function startVideo() {

    video = createCapture(VIDEO);
    video.parent("contenedorVideo");
    extractor = ml5.featureExtractor("MobileNet", modeloListo);
    console.log(extractor);
    calificador = extractor.classification(video, videoListo);
    cargarBotones();
}



function modeloListo() {
    select("#estadoModelo").html("Modelo cargado!");
}
function videoListo() {
    select("#estadoVideo").html("Video cargado!");
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
  
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
      console.log(detections);
      
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      faceapi.draw.drawDetections(canvas, resizedDetections)
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
      
    }, 100)
}
function cargarBotones() {
    var botonSin = select("#btnNoMascarilla");
    botonSin.mousePressed(function () {
        calificador.addImage("sin_mascarilla");
        select("#sumaSinMascarilla").html(imgSinMascarilla++);
    });
    var botonCon = select("#btnConMascarilla");
    botonCon.mousePressed(function () {
        calificador.addImage("con_mascarilla");
        select("#sumaConMascarilla").html(imgMascarilla++);
    });

    var botonEntrenar = select("#btnEntrenar");
    botonEntrenar.mousePressed(function () {
        /*
        imgMascarilla = select("#selectMascarilla").value();
        imgSinMascarilla = select("#selectNoMascarilla").value();
        console.log(imgSinMascarilla);
        cargarImgConMascarilla(imgMascarilla);
        cargarImgSinMascarilla(imgSinMascarilla);
        */
        calificador.train(function(vError){
            if(vError){
                error = vError;
                select("#error").html("Error "+error);
            }else{
                select("#error").html("Entrenamiento terminado con un error de "+error);

            }
        });
    });
    var botonPredecir = select("#btnPredecir");
    botonPredecir.mousePressed(function () {
        calificador.classify(muestraResultado);
    });

}

function cargarImgConMascarilla(valor){
    const maskImageCount = valor;


            const trainImagesContainer = document.querySelector('.train-images');
            // Add mask images to the DOM and give them a class of `mask-img`
            for (let i = 1; i <= maskImageCount; i++) {
                const newImage = document.createElement('IMG');
                newImage.setAttribute('crossorigin', `anonymous`);
                newImage.setAttribute('src', `images/con_mascarilla/asian_mask${i}.jpg`);
                newImage.classList.add('con-mascarilla-img');
                trainImagesContainer.appendChild(newImage);
            }
            const maskImages = document.querySelectorAll('.con-mascarilla-img');

            maskImages.forEach(img => {
                extractor.classification(img);
                calificador.addImage("con_mascarilla");
                
            });
}
function cargarImgSinMascarilla(valor){
    const noMaskImageCount = valor;


            const trainImagesContainer = document.querySelector('.train-images');
            // Add no mask images to the DOM and give them a class of `no-mask-img`
            for (let i = 1; i <= noMaskImageCount; i++) {
                const newImage = document.createElement('IMG');
                newImage.setAttribute('crossorigin', `anonymous`);
                newImage.setAttribute('src', `images/sin_mascarilla/${i}.jpg`);
                newImage.classList.add('sin-mascarilla-img');
                trainImagesContainer.appendChild(newImage);
            }
            const noMaskImages = document.querySelectorAll('.sin-mascarilla-img');
            noMaskImages.forEach(img => {

                extractor.classification(img);
                calificador.addImage("sin_mascarilla");
            });

 
}

function muestraResultado(err, res) {
    console.log(res);
    console.log(err);
    calificador.classify(muestraResultado);
    select("#resultado").html(res);
}