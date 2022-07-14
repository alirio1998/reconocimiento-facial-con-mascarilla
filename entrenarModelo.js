// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Image Classification using Feature Extraction with MobileNet. Built with p5.js
This example uses a callback pattern to create the clasificador
=== */

let featureExtractor;
let clasificador;
let video;
let loss;
let imgMascarilla=0;
let imgSinMascarilla=0;
let imgNadie=0;

async function faceDetect() {
  /*
  imageUpload.src='images/con_mascarilla/asian_mask'+idImg+'.jpg';
  idImg++;
  if(idImg>200){
    idImg = 1;
  }
  */
  imageUpload.src='images/desconocido.jpg';
    image = video;
    container.append(image);
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks();

    const results = detections;

    if(results.length>0){
      results.forEach((result, i) => {
        console.log(detections[0].detection.box);
        extractFaceFromBox(image, detections[0].detection.box);
        //const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
        //drawBox.draw(canvas)
      })
    }else{
      const canvas = document.getElementById('face');
      canvas.src = 'images/desconocido.jpg';
      
      videoDetect.append(canvas);
    }
    console.log(results);
  
};

async function extractFaceFromBox(inputImage, box){ 

  const regionsToExtract = [
      new faceapi.Rect( box.x, box.y , box.width , box.height)
  ]
                      
  let faceImages = await faceapi.extractFaces(inputImage, regionsToExtract)
  
  if(faceImages.length == 0){
      console.log('Face not found')
  }
  else
  {
    const canvas = document.getElementById('face');
      faceImages.forEach(cnv =>{      

          canvas.src = cnv.toDataURL();
              
      })
      videoDetect.append(canvas);
  }   
}    

function imageReady() {
  image(video, 0, 0, width, height);
}
function setup() {
   noCanvas();
  // Crea el video
  console.log(document.location.origin);
 // video = createCapture(VIDEO);
  //video.parent("contenedorVideo");
  video = document.getElementById('stream');
  video.src=''+document.location.origin+':81/stream';
  // extrae modelo MobileNet
  featureExtractor = ml5.featureExtractor("MobileNet", modeloListo);

  // crea un nuevo calificador
  const options = { numLabels: 2 };
  clasificador = featureExtractor.classification();
  // activa los botones
  botones();
}
function modeloListo() {
    
    // modelos precargados
    clasificador.load('https://alirio1998.github.io/reconocimiento-facial-con-mascarilla/models/model.json', customModelReady);
    var elemento = document.querySelector('#contenidoBotones');
    elemento.className = "show";

    
}

 function customModelReady() {
        select("#estadoModelo").html("Modelo cargado!");
        clasificar();
    };
function videoListo() {
    select("#estadoVideo").html("Video cargado!");
}


// Clasificar el resultado
function clasificar() {
        const img = document.querySelector('img');
        clasificador.classify(img, gotResults);
}

// funciones de botones
function botones() {
    var botonSin = select("#btnNoMascarilla");
    botonSin.mousePressed(function () {
      const img = document.querySelector('img');
        clasificador.addImage(img, "sin_mascarilla");
        select("#sumaSinMascarilla").html((imgSinMascarilla += 1));
    });
    var botonCon = select("#btnConMascarilla");
    botonCon.mousePressed(function () {
      const img = document.querySelector('img');
        clasificador.addImage(img, "con_mascarilla");
        select("#sumaConMascarilla").html((imgMascarilla += 1));
    });
    var botonNadie = select("#btnNadie");
    botonNadie.mousePressed(function () {
      const img = document.querySelector('img');
        clasificador.addImage(img, "nadie");
        select("#nadie").html((imgNadie += 1));
    });

  // entrenamiento del modelo
  var botonEntrenar = select("#btnEntrenar");
  botonEntrenar.mousePressed(entrenar);

  // Boton predecir
  var botonPredecir = select("#btnPredecir");
  botonPredecir.mousePressed(clasificar);

  // Guardar modelo
  var guardarBtn = select("#btnGuardar");
  guardarBtn.mousePressed(function() {
    clasificador.save("https://alirio1998.github.io/reconocimiento-facial-con-mascarilla/models/");
  });


/*
  // Load model
  var loadBtn = select("#load");
  loadBtn.changed(function() {
    clasificador.load(loadBtn.elt.files, function() {
      select("#modelStatus").html("Custom Model Loaded!");
    });
  });
  */
}

async function entrenar(mobilenetModule) {

  clasificador.train(function(perdida) {
    if (perdida) {
      error = perdida;
      select("#error").html("Perdida "+error);
    } else {
      select("#error").html("Entrenamiento terminado con perdida de "+error);
    }
  });

}
// Muestra los resultados
function gotResults(err, results) {
  // muestra los errores
  if (err) {
    console.log(err);
  }
  if (results && results[0]) {
    console.log(results);
    var val = Math.trunc(results[0].confidence.toFixed(2) * 100 );
    select("#resultado").html(results[0].label);
    select("#coincidencia").html(`${val }%`);
    var elemento = document.querySelectorAll("img");
    if (results[0].label == "sin_mascarilla") { // sin mascarilla bode rojo
      elemento[0].className = "sin-mascarilla";
    } else if(results[0].label == "con_mascarilla"){ // con mascarilla borde verde
      elemento[0].className = "con-mascarilla";
    } else if(results[0].label == "nadie"){ // con mascarilla borde verde
      elemento[0].className = "nadie";
    }

    clasificar();
  }
}
