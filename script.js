const imageUpload = document.getElementById('imageUpload')

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start)

  const container = document.createElement('div')
  container.style.position = 'relative'
  document.body.append(container)
  let image
  let canvas
  
async function startDetection() {
    if (image) image.remove()
    if (canvas) canvas.remove()
    image = await faceapi.bufferToImage(document.getElementById('stream'))
    container.append(image)
    canvas = faceapi.createCanvasFromMedia(image)
    container.append(canvas)
    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(canvas, displaySize)
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    resizedDetections.forEach(detection => {
      const box = detection.detection.box
      extractFaceFromBox(image, detection.detection.box)
      const drawBox = new faceapi.draw.DrawBox(box)
      drawBox.draw(canvas)
    })
}


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
      document.body.append(canvas)  
  }   
}    
