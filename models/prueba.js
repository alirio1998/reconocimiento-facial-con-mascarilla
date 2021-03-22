let video;
let extractor;
let calificador;
const maskImageCount = 50;
const noMaskImageCount = 50;
let error=0;
async function setup() {
    console.log("entrenando");
    const trainImagesContainer = document.querySelector('.train-images');
    // Add mask images to the DOM and give them a class of `mask-img`
    for (let i = 1; i <= maskImageCount; i++) {
        const newImage = document.createElement('IMG');
        newImage.setAttribute('crossorigin', `anonymous`);
        newImage.setAttribute('src', `images/con_mascarilla/asian_mask${i}.jpg`);
        newImage.classList.add('con-mascarilla-img');
        trainImagesContainer.appendChild(newImage);
    }
    // Add no mask images to the DOM and give them a class of `no-mask-img`
    for (let i = 1; i <= noMaskImageCount; i++) {
        const newImage = document.createElement('IMG');
        newImage.setAttribute('crossorigin', `anonymous`);
        newImage.setAttribute('src', `images/sin_mascarilla/${i}.jpg`);
        newImage.classList.add('sin-mascarilla-img');
        trainImagesContainer.appendChild(newImage);
    }
    noCanvas();
    video = createCapture(VIDEO);
    video.parent("contenedorVideo");
    extractor = await ml5.featureExtractor("MobileNet", modeloListo);
    console.log(extractor);
    calificador = await trainClassifier(extractor);

    //calificador = extractor.classification(video, videoListo);
    cargarBotones();
}
function modeloListo() {
    select("#estadoModelo").html("Modelo cargado!");
}
function videoListo() {
    select("#estadoVideo").html("Video cargado!");
}
window.onload = async () => {




};
function cargarBotones() {

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
            // Predict class for the test image
    const testImage = document.getElementById('test-img');
    const tfTestImage = tf.browser.fromPixels(testImage);
    const logits = extractor.infer(tfTestImage, 'conv_preds');
    console.log(logits);
    const prediction = calificador.predictClass(logits);
    console.log(prediction);
    // Add a border to the test image to display the prediction result
    if (prediction.label == 1) { // no mask - red border
        testImage.classList.add('con-mascarilla');
    } else { // has mask - green border
        testImage.classList.add('sin-mascarilla');
    }
        
    });

}
function muestraResultado(err, res) {
    console.log(res);
    console.log(err);
    calificador.classify(muestraResultado);
    select("#resultado").html(res);
}

async function trainClassifier(mobilenetModule) {
    // Create a new KNN Classifier
    const classifier = knnClassifier.create();

    // Train using mask images
    const maskImages = document.querySelectorAll('.con-mascarilla-img');

    maskImages.forEach(img => {
        const tfImg = tf.browser.fromPixels(img);
        const logits = mobilenetModule.infer(tfImg, 'conv_preds');
        classifier.addExample(logits, 1); // has mask
    });
    // Train using no mask images
    const noMaskImages = document.querySelectorAll('.sin-mascarilla-img');
    noMaskImages.forEach(img => {
        const tfImg = tf.browser.fromPixels(img);
        const logits = mobilenetModule.infer(tfImg, 'conv_preds');
        classifier.addExample(logits, 0); // no mask
    });
    console.log(classifier);
    return classifier;
}
