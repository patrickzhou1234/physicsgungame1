const canvas = document.getElementById("babcanv"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true);
var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    scene.collisionsEnabled = true;
    scene.enablePhysics(new BABYLON.Vector3(0,-9.81, 0), new BABYLON.AmmoJSPlugin);
    
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 3, 30, new BABYLON.Vector3(0, 0, 0), scene);
    camera.setPosition(new BABYLON.Vector3(0, 3, -30));
    camera.attachControl(canvas, true);
    camera.keysUp.pop(38);
    camera.keysDown.pop(40);
    camera.keysLeft.pop(37);
    camera.keysRight.pop(39);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 30, height: 30}, scene);
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.MeshImpostor, {mass:0, restitution:0.3}, scene);
    var wallz = [15, 0, 0, -15];
    var wallrot = [0, 1, 1, 0];
    var wallx = [null, -15, 15, null];
    for (i=0;i<4;i++) {
        var wall = BABYLON.MeshBuilder.CreatePlane("wall", {width:30, height:2}, scene);
        wall.physicsImpostor = new BABYLON.PhysicsImpostor(wall, BABYLON.PhysicsImpostor.MeshImpostor, {mass:0, restitution: 0.9}, scene);
        wall.position.y = 1;
        wall.position.z = wallz[i];
        if (wallrot[i] == 1) {
            wall.rotate(new BABYLON.Vector3(0, 1, 0), Math.PI/2, BABYLON.Space.LOCAL);
        }
        if  (!(wallx[i] == null)) {
            wall.position.x = wallx[i];
        }
    }

    var cannonplatform = BABYLON.MeshBuilder.CreateBox("cannonplatform", {depth:2, width:2, height:1}, scene);
    cannonplatform.position.y = 0.5;

    cannontube = BABYLON.MeshBuilder.CreateCylinder("cannontube", {diameter:2, height:2}, scene);
    cannontube.rotate(new BABYLON.Vector3(0, 0, 1), Math.PI/2, BABYLON.Space.LOCAL);
    cannontube.position.y = 1.5;
    
    cannon = BABYLON.Mesh.MergeMeshes([cannonplatform, cannontube]);

    itarg = BABYLON.Mesh.CreateBox("targ", 1, scene);
    itarg.position.y = 1.5;
    itarg.position.x = 3;
    itarg.visibility = 0.3;
    var itargmat = new BABYLON.StandardMaterial("itargmat", scene);
    itargmat.diffuseColor = new BABYLON.Color3(1, 0, 0);
    itarg.material = itargmat;
    itarg.parent = cannon;
    return scene;
};

window.onkeydown = function(event) {
    if (event.keyCode == "32") {
        var bullet = BABYLON.MeshBuilder.CreateSphere("bullet", {diameter:1, segments:32}, scene);
        bullet.position.set(cannon.position.x, 1.5, cannon.position.z);
        bullet.physicsImpostor = new BABYLON.PhysicsImpostor(bullet, BABYLON.PhysicsImpostor.SphereImpostor, {mass: 1, restitution:0.9}, scene);
        var forceDirection = itarg.getAbsolutePosition().subtract(bullet.getAbsolutePosition());
        var forceMagnitude = 10;
        bullet.applyImpulse(forceDirection.scale(forceMagnitude), bullet.getAbsolutePosition());
    }
    if (event.keyCode == "37") {
        cannon.rotate(new BABYLON.Vector3(0, 1, 0), -Math.PI/90, BABYLON.Space.LOCAL);
    }
    if (event.keyCode == "39") {
        cannon.rotate(new BABYLON.Vector3(0, 1, 0), Math.PI/90, BABYLON.Space.LOCAL);
    }
    if (event.keyCode == "38" && itarg.position.x < 14) {
        itarg.position.x += 0.1;
    }
    if (event.keyCode == "40" && itarg.position.x > 3) {
        itarg.position.x -= 0.1;
    }
}

setInterval(function() {
    var enemy = BABYLON.MeshBuilder.CreateBox("enemy", {width:2, height:2, depth:2}, scene);
    var items = Array(1, 2, 3, 4);
    var item = items[Math.floor(Math.random() * items.length)];
    if (item == 1) {
        enemy.position.set(-14, 5, -14);
    }
    if (item == 2) {
        enemy.position.set(14, 5, -14)
    }
    if (item == 3) {
        enemy.position.set(-14, 5, 14)
    }
    if (item == 4) {
        enemy.position.set(14, 5, 14)
    }
    enemy.actionManager = new BABYLON.ActionManager(scene);
    enemy.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            {
            trigger:BABYLON.ActionManager.OnIntersectionEnterTrigger,
            parameter:cannontube
            }, 
            function(){
                alert("You Died");
            }
        )
    );
    enemy.physicsImpostor = new BABYLON.PhysicsImpostor(enemy, BABYLON.PhysicsImpostor.SphereImpostor, {mass:1, restitution:0.9}, scene);
}, 10000);

const scene = createScene();

engine.runRenderLoop(function () {
  scene.render();
});

window.addEventListener("resize", function () {
  engine.resize();
});
