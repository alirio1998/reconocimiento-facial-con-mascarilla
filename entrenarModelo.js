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

function setup() {
  noCanvas();
  // Crea el video
  video = createCapture(VIDEO);
  video.parent("contenedorVideo");

  // extrae modelo MobileNet
  featureExtractor = ml5.featureExtractor("MobileNet", modeloListo);

  // crea un nuevo calificador
  const options = { numLabels: 2 };
  clasificador = featureExtractor.classification(video, options,videoListo);
  // activa los botones
  botones();
}
function modeloListo() {
    
    // modelos precargados
    clasificador.load('models/modelMascarilla.json', function() {
        select("#estadoModelo").html("Modelo cargado!");
        clasificador.classify(gotResults);
    });
    var elemento = document.querySelector('#contenidoBotones');
    elemento.className = "show";

    
}
function videoListo() {
    select("#estadoVideo").html("Video cargado!");
}


// Clasificar el resultado
function clasificar() {
  clasificador.classify(gotResults);
}

// funciones de botones
function botones() {
    var botonSin = select("#btnNoMascarilla");
    botonSin.mousePressed(function () {
        clasificador.addImage("sin_mascarilla");
        select("#sumaSinMascarilla").html((imgSinMascarilla += 1));
    });
    var botonCon = select("#btnConMascarilla");
    botonCon.mousePressed(function () {
        clasificador.addImage("con_mascarilla");
        select("#sumaConMascarilla").html((imgMascarilla += 1));
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
    clasificador.save("models/");
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
    var val = Math.trunc(results[0].confidence.toFixed(2) * 100 );
    select("#resultado").html(results[0].label);
    select("#coincidencia").html(`${val }%`);
    var elemento = document.querySelectorAll("video");
    console.log(elemento[0]);
    if (results[0].label == "sin_mascarilla") { // sin mascarilla bode rojo
      elemento[0].className = "sin-mascarilla";
    } else if(results[0].label == "con_mascarilla"){ // con mascarilla borde verde
      elemento[0].className = "con-mascarilla";
    }

    clasificar();
  }
}
