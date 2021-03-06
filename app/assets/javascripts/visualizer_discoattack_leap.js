var sphere;
var geometry;
var sphereMaterials;
var newColor;
var sphereColor;
var floorColor;
var render; 
var frame; 

discoattackLeap = function () {

  // scene & camera info 

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 1000);

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  $( ".visualizer" ).empty();
  $( ".visualizer" ).prepend(renderer.domElement);

  // sphere info 

  var geometry = new THREE.SphereGeometry(40, 16, 16, 16);

  // setting sphereMaterials for sphere that changes color with gestures 
  var sphereMaterials = new THREE.MeshPhongMaterial({
    ambient: 0x030303,
    color: 0xdddddd,
    specular: 0x009900,
    shininess: 30,
    shading: THREE.FlatShading
  });

  var newColor;
  var sphereColor = function(newColor) {
    sphere.material.color.setHex(newColor);
  };

  var createSphere = function() {
    var sphere = new THREE.Mesh(geometry, sphereMaterials);
    sphere.castShadow = true;
    return sphere;
  };

  sphere = createSphere();

  scene.add(sphere);



  // the light sources 
  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(0.2, 1, 0.2);
  directionalLight.castShadow = true;
  scene.add(directionalLight);


  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 0, 0.2);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(0, -1, 0.2);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // floor
  var floorColor = function(r, g, b) {
    // var floor = scene.getObjectByName('floor');
    floor.material.color.setRGB(r, g, b);
  };

  var floorGeometry = new THREE.BoxGeometry(350, 1000, 2);
  var floorMaterial = new THREE.MeshPhongMaterial({
    ambient: 0x030303,
    color: 'rgb(227, 0, 31)',
    specular: 0x009900,
    shininess: 30,
    shading: THREE.FlatShading,
  });
  var floor = new THREE.Mesh(floorGeometry, floorMaterial);


  floor.rotation.x = -1.5;
  floor.position.y = -100;
  floor.name = 'floor';

  scene.add(floor);

  // floor color 

  Leap.loop(function() {

    var red = Math.round(((sphere.position.x / 40) / window.innerWidth) * 255);
    var green = Math.round(((sphere.position.y / 20) / window.innerHeight) * 255);

    var pageZ = Math.sqrt((sphere.position.y / 20) * (sphere.position.y / 20) + (sphere.position.x / 40) * (sphere.position.x / 40));
    var innerZ = Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight);
    var blue = Math.round(pageZ / innerZ * 255);

    // the function below is to get the brightest colors for the floor 
    var colorResponse = function(color) {
      color = color * Math.PI / 2;
      return (0.8) * Math.sin(color) + 0.4;

    }

    var r = colorResponse(red);
    var g = colorResponse(green);
    var b = colorResponse(blue);


    floorColor(r, g, b);


  });

  // shadow 

  renderer.shadowMapEnabled = true;
  // renderer.shadowMapSoft = true;

  renderer.shadowCameraNear = 0;
  renderer.shadowCameraFar = 20;
  renderer.shadowCameraFov = 30;

  renderer.shadowMapBias = 0.0039;
  renderer.shadowMapDarkness = 0.5;
  renderer.shadowMapWidth = 1024;
  renderer.shadowMapHeight = 1024;

  floor.receiveShadow = true;

  // camera position 
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 500;

  // initializing the canvas 
  var canvasElement = $("canvas");

  // rendering the info 
  render = function() {
    if (music_playing === false) {
      frequencyAmplitudeArray = 0; 
    }

  

    requestAnimationFrame(render);

    sphere.scale.y = (1 + frequencyAmplitudeArray[0] / 512);

    sphere.rotation.x += 0.01;
    sphere.rotation.y += 0.01;


    renderer.render(scene, camera);
  };

  render();



  // info for number of fingers and hands 

  function concatData(id, data) {
    return id + ": " + data + "<br>";
  }

  function getFingerName(fingerType) {
    switch (fingerType) {
      case 0:
        return 'Thumb';
        break;

      case 1:
        return 'Index';
        break;

      case 2:
        return 'Middle';
        break;

      case 3:
        return 'Ring';
        break;

      case 4:
        return 'Pinky';
        break;
    }
  }

  function concatJointPosition(id, position) {
    return id + ": " + position[0] + ", " + position[1] + ", " + position[2] + "<br>";
  }


  var output_two = document.getElementById('output_two');
  var frameString = "",
    handString = "",
    fingerString = "";
  var hand, finger;

  // Leap.loop uses browser's requestAnimationFrame
  var options = {
    enableGestures: true
  };

  // initializing the controller 
  var deviceLoopController = new Leap.Controller({
    frameEventName: 'deviceFrame'
  });
  deviceLoopController.on("frame", function(frame) {
    if (frame.pointables.length > 0) {
      canvasElement.width = canvasElement.width; //clear

      //Get a pointable and normalize the tip position
      var pointable = frame.pointables[0];
      // setting the interaction box so it doesn't go outside of frame (i think i still need to clamp)
      var interactionBox = frame.interactionBox;
      // normalizing
      var normalizedPosition = interactionBox.normalizePoint(pointable.tipPosition, true);

      // Convert the normalized coordinates to span the canvas (math in docs)
      var canvasX = canvasElement.width * normalizedPosition[0];
      var canvasY = canvasElement.height * (1 - normalizedPosition[1]);

      // don't know what the code below does 
      displayArea.strokeText("(" + canvasX.toFixed(1) + ", " + canvasY.toFixed(1) + ")", canvasX, canvasY);
    }
  });



  // tells you with gestures you are using 
  var controller = Leap.loop({
    enableGestures: true
  }, function(frame) {
    if (frame.valid && frame.gestures.length > 0) {
      frame.gestures.forEach(function(gesture) {
        switch (gesture.type) {
          case "circle":
            // console.log("Circle Gesture");
            break;
          case "keyTap":
            // console.log("Key Tap Gesture");
            break;
          case "screenTap":
            // console.log("Screen Tap Gesture");
            break;
          case "swipe":
            // console.log("Swipe Gesture");
            break;
        }
      });
    }

    // Display Gesture object data
    // also changing the color with swipe direction 
    if (frame.gestures.length > 0) {
      for (var i = 0; i < frame.gestures.length; i++) {
        var gesture = frame.gestures[i];
        if (gesture.type === "swipe") {
          //Classify swipe as either horizontal or vertical
          var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
          //Classify as right-left or up-down
          if (isHorizontal) {
            if (gesture.direction[0] > 0) {
              var swipeDirection = "right";
              var newColor = 0x0F5B30;
              sphereColor(newColor);
            } else {
              var swipeDirection = "left";
              var newColor = 0xF53B84;
              sphereColor(newColor);
            }
          } else { //vertical
            if (gesture.direction[1] > 0) {
              var swipeDirection = "up";
              var newColor = 0xBC87FF;
              sphereColor(newColor);
            } else {
              var swipeDirection = "down";
              var newColor = 0xFFFF25;
              sphereColor(newColor);
            }
          }
          // console.log(swipeDirection)
        }
      }
    }
  });

  // To get frames rolling
  controller.connect();

  // changing the sphere position in relation to hand position 
  var position = function(x, y, z) {


    sphere.position.x = parseFloat(x);

    sphere.position.y = parseFloat(y) - window.innerHeight / 2;

    sphere.position.z = parseFloat(z);


  }

  window.outputRight = $('#outputRight');
  window.outputLeft = $('#outputLeft');
  Leap.loop({
      hand: function(hand, frame) {
        // debugger;
        if (hand.type === "right") {
          var screenPositionRight = hand.screenPosition(hand.palmPosition);
          // var outputContentRight = "xRight: " + (screenPositionRight[0].toPrecision(4)) + 'px' +
          //   "        yRight: " + (screenPositionRight[1].toPrecision(4)) + 'px' +
          //   "        zRight: " + (screenPositionRight[2].toPrecision(4)) + 'px';

          // outputRight.html(outputContentRight);


        } else if (hand.type === "left") {

          var screenPositionLeft = hand.screenPosition(hand.palmPosition);

        }


        frame = controller.frame();



        // differentiates between one hand and two hands 

        if (frame.hands.length === 2) {
          var xFirstHand = (parseFloat(frame.hands[0].palmPosition[0].toPrecision(4)));

          var xSecondHand = (parseFloat(frame.hands[1].palmPosition[0].toPrecision(4)));

          var x = (((xFirstHand) + (xSecondHand)) / 2);

          var yFirstHand = (parseFloat(frame.hands[0].palmPosition[1].toPrecision(4)));
          var ySecondHand = (parseFloat(frame.hands[1].palmPosition[1].toPrecision(4)));

          var y = ((yFirstHand) + (ySecondHand) / 2);

          var zFirstHand = (parseFloat(frame.hands[0].palmPosition[2].toPrecision(4)));
          var zSecondHand = (parseFloat(frame.hands[1].palmPosition[2].toPrecision(4)));

          var z = ((zFirstHand) + (zSecondHand) / 2);

          position(x, y, z);

          // console.log("Hand Scale: " + handScale);

          // code below is for scaling the sphere 

          var previousFrame = controller.frame(150);
          var frameScale = frame.scaleFactor(previousFrame);
          sphere.scale.x = frameScale;

          // console.log("Frame Scale: " + frameScale);


        } else if (frame.hands.length === 1) {

          var x = (hand.palmPosition[0].toPrecision(4));
          var y = (hand.palmPosition[1].toPrecision(4));
          var z = (hand.palmPosition[2].toPrecision(4));


          position(x, y, z);


        }


        // creating more spheres with grab strength 

        if (frame.valid && frame.gestures.length > 0) {
          frame.gestures.forEach(function(gesture) {
            switch (gesture.type) {
              case "keyTap":
                var drawsphere = function() {
                  sphere = createSphere();
                  scene.add(sphere);
                };
                drawsphere();
                _.debounce(drawsphere, 2000);
                break;
              case "screenTap":
                var newColor = 0xdddddd;
                sphereColor(newColor);
            }
          });
        }


        scene.traverse(function(objects) {
          if (objects instanceof THREE.Mesh && !(objects.name === 'floor')) {
            // Move objects further back
            objects.position.z -= 0.60;

            // Rotate objectss
            objects.rotation.x += 0.01;
            objects.rotation.y += 0.01;
          };
        });


      }

    })
    .use('screenPosition', {
      scale: 100

    });


} 
