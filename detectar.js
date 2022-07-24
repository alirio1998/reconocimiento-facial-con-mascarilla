let featureExtractor;
let clasificador;
let image
let canvas
var idImg = 0
var modeloCargado = false;
var imageUpload = document.getElementById('stream')

var imageFace = document.getElementById('face')
const container = document.getElementById('contenedorVideo')
const divLoading = document.getElementById('contenedorLoading')
const divContenido = document.getElementById('contenido')
divContenido.className = "hidden";
var control
var tiempo=3000
var segundos=tiempo
var contador=0
function initCount(){
 let elem = document.getElementById("segundos");
 var contadorlbl = document.getElementById('contador');
 if(segundos>0){
  segundos = segundos-contador;
 }

 
 //si se termina el tiempo...
 if(segundos>4000){
  // Finalizamos el "juego"
  elem.textContent=5;
  }
  else if(segundos>3000){
    // Finalizamos el "juego"
    elem.textContent=4;
  }
  else if(segundos>2000){
    // Finalizamos el "juego"
    elem.textContent=3;
  }
  else if(segundos>1000){
    // Finalizamos el "juego"
    elem.textContent=2;
  }
  else if(segundos>0){
    // Finalizamos el "juego"
    elem.textContent=1;
  }  
  else if(segundos<=0){
    // Finalizamos el "juego"
    contadorlbl.className = "hidden";
    let respuesta = document.getElementById("respuesta")
    respuesta.className = "";
   AbrirPuerta();
    //window.location.href =''+document.location.origin+'/apertura';
  }
console.log(segundos);
}
function AbrirPuerta(){
//Declaramos una nueva instancia de XMLHttpRequest
var xhr = new XMLHttpRequest();

//Esta función se ejecutará tras la petición
xhr.onload = function () {

    //Si la petición es exitosa
    if (xhr.status >= 200 && xhr.status < 300) {
        //Mostramos un mensaje de exito y el contenido de la respuesta
        console.log('¡Éxito!', xhr.response);
    } else {
        //Si la conexión falla
        console.log('Error en la petición!');
    }

};
//Por el primer parametro enviamos el tipo de petición (GET, POST, PUT, DELETE)
//Por el segundo parametro la url de la API
xhr.open('GET', ''+document.location.origin+'/apertura');
//Se envía la petición
xhr.send();
 }
function setup() {
    console.log(document.location.origin);
  imageUpload.src=''+document.location.origin+':81/stream';
  imageUpload.onload=imagenEncontrada;
  imageUpload.onloadstart = BuscandoImagen;
  imageUpload.onerror=imageNoEncontrada;
}
async function cargarTensorflow() {
  
    featureExtractor = ml5.featureExtractor("MobileNet", modeloListo);
    const options = { numLabels: 2 };
    clasificador = featureExtractor.classification();

    cargarFaceApi();

}
function cargarFaceApi(){
  Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('https://alirio1998.github.io/reconocimiento-facial-con-mascarilla/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('https://alirio1998.github.io/reconocimiento-facial-con-mascarilla/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('https://alirio1998.github.io/reconocimiento-facial-con-mascarilla/models'),
    setTimeout(function(){}, 3000)
  ]).then(setInterval(InicioDeteccionFacial, 1))
}

async function inicioFaceApi() {


  if (!imageUpload.complete) {

  }
  else { 
    console.log('Cargando Imagen');
  }

  /*
    if (canvas) canvas.remove()
    image = document.getElementById('stream')
    canvas = faceapi.createCanvasFromMedia(image)
    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(canvas, displaySize)
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    console.log(detections);
    resizedDetections.forEach(detection => {
      const box = detection.detection.box
      extractFaceFromBox(image, detection.detection.box)
      const drawBox = new faceapi.draw.DrawBox(box)
      drawBox.draw(canvas)
    })
    */
}
async function InicioDeteccionFacial() {

    //has picture
    console.log('inicio deteccion');

    idImg++;
    //imageUpload.src='/images/con_mascarilla/asian_mask'+idImg+'.jpg';
    ;
    if(idImg>200){
      idImg = 1;
    }
    
    image = imageUpload;
    container.append(image);
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks();

    const results = detections;

    if(results.length>0){
      results.forEach((result, i) => {
        console.log(detections[0].detection.box);
        
        ObtenerRostro(image, detections[0].detection.box);
        
          
      
        
        //const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
        //drawBox.draw(canvas)
      })
    }else{
      const canvas = document.getElementById('face');
      imageFace.src = '/images/desconocido.jpg';
      //document.body.append(canvas) ;
      select("#resultado").html('Ninguna persona detectada');
      select("#coincidencia").html(`100%`);
      var elemento = document.getElementById('stream');
      elemento.className = "";
      var contadorlbl = document.getElementById('contador');

      contadorlbl.className = "hidden";
      contador=0;
      segundos=tiempo;

      
      //videoDetect.append(canvas);
    }
    console.log(results);
}
function modeloListo() {
  // modelos precargados
  clasificador.load('https://alirio1998.github.io/reconocimiento-facial-con-mascarilla/models/model.json', function(){
    clasificar();
  });
  console.log('modelo cargado');
}
function videoListo() {
  console.log('Imagen cargada');
}

function imagenEncontrada() {
  console.log('Imagen Encontrada');
  
  imageUpload.className = "";
  divLoading.className = "hidden";
  divContenido.className = "";
  cargarTensorflow();
}
function imageNoEncontrada() {

  console.log('Imagen no encontrada');
}
function BuscandoImagen() {
  console.log('Imagen no encontrada');
}


async function ObtenerRostro(inputImage, box){ 
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

          imageFace.src = cnv.toDataURL();
              
      })
      //document.body.append(canvas)  
  }   
  clasificar();

}
// Clasificar el resultado
function clasificar() {
  setTimeout(function(){
    clasificador.classify(imageFace, Resultados);
  }, 1000);

}
function Resultados(err, results) {
  // muestra los errores

  if (err) {
    console.log(err);
  }
  if (results && results[0]) {
    //setTimeout(startDetection, 3000);
    console.log(results);
    var val = Math.trunc(results[0].confidence.toFixed(2) * 100 );
    select("#resultado").html(results[0].label);
    select("#coincidencia").html(`${val }%`);
    var elemento = document.getElementById('stream');
    var contadorlbl = document.getElementById('contador');
    if (results[0].label == "sin_mascarilla") { // sin mascarilla bode rojo
      elemento.className = "sin-mascarilla";
      contadorlbl.className = "hidden";
      contador=0;
      segundos=tiempo;
    } else if(results[0].label == "con_mascarilla"){ // con mascarilla borde verde

        contador=contador+1;
        contadorlbl.className = "";
      elemento.className = "con-mascarilla";
      initCount();
      //control = setTimeout(initCount, 1000);
      //clearTimeot(control);
    } else if(results[0].label == "nadie"){ // con mascarilla borde verde
      elemento.className = "nadie";
      contadorlbl.className = "hidden";
      contador=0;
      segundos=tiempo;
    }
  }
}


