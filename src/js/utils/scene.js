 export function pickCamera(scene) {
     let p = {
         heading: scene.camera.heading,
         pitch: scene.camera.pitch,
         roll: scene.camera.roll,
         x: scene.camera.position.x,
         y: scene.camera.position.y,
         z: scene.camera.position.z,
     }
     return p;
 }


 export function saveToFile(scene) {
     let canvas = scene.canvas;
     let image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

     let link = document.createElement("a");
     let blob = dataURLtoBlob(image);
     let objurl = URL.createObjectURL(blob);
     link.download = "scene.png";
     link.href = objurl;
     link.click();

 }

 function dataURLtoBlob(dataurl) {
     let arr = dataurl.split(','),
         mime = arr[0].match(/:(.*?);/)[1],
         bstr = atob(arr[1]),
         n = bstr.length,
         u8arr = new Uint8Array(n);
     while (n--) {
         u8arr[n] = bstr.charCodeAt(n);
     }
     return new Blob([u8arr], { type: mime });
 }

 export function saveThumbnail(scene) {
     let canvas = scene.canvas;
     let image = new Image();
     image.src = canvas.toDataURL("image/png");

     image.onload = function() {
         let canvas = imageToCanvas(image);
         let url = canvas.toDataURL("image/jpeg");
         let a = document.createElement('a');
         let event = new MouseEvent('click');
         a.download = "scene.png"; // 指定下载图片的名称
         a.href = url;
         a.dispatchEvent(event); // 触发超链接的点击事件
     }
 }

 function imageToCanvas(image) {
     let canvas = document.createElement("canvas");
     canvas.width = image.width / 3; //缩小三倍
     canvas.height = image.height / 3; //缩小三倍
     canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
     return canvas;
 }


 export function getSceneImage(scene, height, width) {
     let canvas = scene.canvas;
     let image = new Image();
     image.src = canvas.toDataURL("image/png");

     return new Promise((resolve, reject) => {
         image.onload = function() {
             canvas = document.createElement("canvas");
             canvas.width = width;
             canvas.height = height;
             canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
             resolve(canvas.toDataURL("image/jpeg"));
         }
     });

 }