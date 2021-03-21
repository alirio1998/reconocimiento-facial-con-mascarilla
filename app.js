window.onload = async () => {
    const maskImageCount = 50;
    const noMaskImageCount = 50;
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

    // Load mobilenet module
    const mobilenetModule = await mobilenet.load({version: 2, alpha: 1});
    // Add examples to the KNN Classifier
    const classifier = await trainClassifier(mobilenetModule);

    // Predict class for the test image
    const testImage = document.getElementById('test-img');
    const tfTestImage = tf.browser.fromPixels(testImage);
    const logits = mobilenetModule.infer(tfTestImage, 'conv_preds');
    console.log(logits);
    const prediction = await classifier.predictClass(logits);
    console.log(prediction);
    // Add a border to the test image to display the prediction result
    if (prediction.label == 1) { // no mask - red border
        testImage.classList.add('con-mascarilla');
    } else { // has mask - green border
        testImage.classList.add('sin-mascarilla');
    }
};

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
