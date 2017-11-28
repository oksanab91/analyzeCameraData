var camerasNumber = 0;
var analyzeItems = [];

console.log('start analyzing');

//summery data of all the images for one camera
var getSumSize = function(camera) {
    var imagesArray = camera.images;

    var sum = imagesArray
        .map(function(item) {
            return item.file_size;
        })
        .reduce(getSum);

    return sum;
}

//Which cameras have used the most data?
var getCameraWithMaxUsage = function() {

    var sorted = analyzeItems.sort(function(a, b) { return a.sumSize - b.sumSize });
    var camera = sorted[sorted.length - 1];

    return camera.camera_id;
}

// Which cameras have the highest number of images?
var getCameraWithMaxNum = function() {

    var sorted = analyzeItems.sort(function(a, b) { return a.imagesCount - b.imagesCount });
    var camera = sorted[sorted.length - 1];

    return camera.camera_id;
}

var getSum = function(total, val) {
    return total + val;
}
var getNum = function(total, num) {
    return total + num;
}

//What are the largest images per camera?
var getLargestImage = function(camera) {

    var imagesArray = camera.images;
    var sorted = imagesArray.sort(function(a, b) { return a.file_size - b.file_size });
    var image = sorted[sorted.length - 1];

    return image.file_size;
}

var getImagesCount = function(camera) {
    var imagesArray = camera.images;
    return imagesArray.length;
}

//analyze the data
var analyzeRecord = function(element) {

    //summery data of all the images for a camera
    sumSize = getSumSize(element);

    //images count per camera
    imagesCount = getImagesCount(element);

    //the largest images per camera
    imageMax = getLargestImage(element);

    //return the results;
    return { camera_id: element.camera_id, sumSize: sumSize, imagesCount: imagesCount, imageMax: imageMax };
}

//get camera data and analyze it
var getDataAnalyze = function(ind, mainUrl, timeout) {
    //domain.com/camera/<camera_id>/

    var xhttp = new XMLHttpRequest();
    var url = mainUrl.replace("camera_id", ind);

    return new Promise((resolve, reject) => {

        xhttp.onerror = function() {
            console.log("An error occurred while transferring the data.");
        };
        xhttp.ontimeout = function() {
            console.log("The request for " + url + " timed out.");
        };
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {

                var data = JSON.parse(this.responseText);
                var record = analyzeRecord(data);

                resolve(record);
            }
        };

        xhttp.open("GET", url, true);
        xhttp.timeout = timeout;
        xhttp.send();
    });
}

//process all the data
var analyze = function(timeout) {
    analyzeItems = [];
    var ind = 0;

    //get main url
    var urlInput = document.getElementById('urlInput');
    var mainUrl = urlInput.value ? urlInput.value : "datacamera_id.json";

    //get count of cameras to analyze
    var countInput = document.getElementById('countInput');
    camerasNumber = countInput.value > 0 ? Number(countInput.value) : 1;

    do {
        ind++;
        getDataAnalyze(ind, mainUrl, timeout).then(function(res) {
            analyzeItems.push(res);

            if (res.camera_id === camerasNumber) {
                //Which cameras have used the most data?
                var maxCamera = getCameraWithMaxUsage();
                //Which cameras have the highest number of images?
                var maxNumCamera = getCameraWithMaxNum();

                //analyze result
                analyzeItems.push({ cameraWithMaxNum: maxNumCamera, cameraWithMaxUsage: maxCamera });
                console.log(analyzeItems);
            }
        });
    } while (ind < camerasNumber)
}