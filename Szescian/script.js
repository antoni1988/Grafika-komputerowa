console.error('works');

vertexShaderTxt = `
precision mediump float;


uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProjection;


attribute vec3 vertPosition;
attribute vec3 vertColor;

varying vec3 fragColor;

void main() {
    fragColor = vertColor;
    gl_Position = mProjection * mView * mWorld * vec4(vertPosition, 1.0);
}
`
const fragmentShaderTxt = `
precision mediump float;

varying vec3 fragColor;

void main() {
    gl_FragColor = vec4(fragColor, 1.0);
}
`

const mat4 = glMatrix.mat4;

const prepareProgram = function() {

}

const Cube = function ([x,y,z],s) {
    const boxVertices = 
	[ // X, Y, Z         
		// FRONT
        -1+x,-1+y,-1+z, //A 0
        1+x,-1+y,-1+z,  //B 1
        1+x,1+y,-1+z,    //C 2
        -1+x,1+y,-1+z,  //D 3

        // BACK
        -1+x,-1+y,1+z,    //E 4
        1+x,-1+y,1+z,     //F 5
        1+x,1+y,1+z,       //G 6
        -1+x,1+y,1 +z     //H 7
	];

    for (let i = 0; i < boxVertices.length; i++) {
        boxVertices[i] *= s;
    }
	const boxIndices =
	[
		// FRONT
        0, 1, 2,
        2, 3, 0,
        // TOP
        2, 3, 7,
        7, 6, 2,
        //BACK
        4, 5, 6,
        6, 7, 4,
        // RIGHT
        1, 5, 6,
        6, 2, 1,
        // LEFT
        0, 4, 7,
        7, 3, 0,
        // BOTTOM
        0, 1, 5,
        5, 4, 0
	];
    return [boxVertices, boxIndices];
}
const Triangle = function () {
    const canvas = document.getElementById('main-canvas');
    const gl = canvas.getContext('webgl');
    let canvasColor = [0.2, 0.7, 0.5];

    checkGl(gl);

    

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderTxt);
    gl.shaderSource(fragmentShader, fragmentShaderTxt);

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);

    gl.validateProgram(program);

    // random color

	let colors = [
        Math.random(), Math.random(), Math.random(),
        Math.random(), Math.random(), Math.random(),
        Math.random(), Math.random(), Math.random(),
        Math.random(), Math.random(), Math.random(),
        Math.random(), Math.random(), Math.random(),
        Math.random(), Math.random(), Math.random(),
        Math.random(), Math.random(), Math.random(),
        Math.random(), Math.random(), Math.random(),
    ];

    const [boxVertices, boxIndices] = Cube([0,0,0],1);
    const triangleVertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);
	
    const boxIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);
	

    const posAttrLoc = gl.getAttribLocation(program, 'vertPosition');
    gl.vertexAttribPointer(
        posAttrLoc,
        3,
        gl.FLOAT,
        gl.FALSE,
        3 * Float32Array.BYTES_PER_ELEMENT,
        0
    );

    gl.enableVertexAttribArray(posAttrLoc);
	const triangleColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    
    const colorAttrLoc = gl.getAttribLocation(program, 'vertColor');
    gl.vertexAttribPointer(
        colorAttrLoc,
        3,
        gl.FLOAT,
        gl.FALSE,
        3 * Float32Array.BYTES_PER_ELEMENT,
        0
    );


    gl.enableVertexAttribArray(colorAttrLoc);

    // render time

    gl.useProgram(program);

    const worldMatLoc = gl.getUniformLocation(program,'mWorld');
	const viewMatLoc = gl.getUniformLocation(program,'mView');
	const projMatLoc = gl.getUniformLocation(program,'mProjection');

	const worldMatrix = mat4.create();
	const viewMatrix = mat4.create();
    const projectionMatrix = mat4.create();

    mat4.identity(worldMatrix);

    mat4.lookAt(viewMatrix, [0, 2, 3], [0, 0, -100], [0, 3, 0]);


    const fieldOfView =  glMatrix.glMatrix.toRadian(90);
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const near = 0.1;
    const far = 100.0;
    glMatrix.mat4.perspective(projectionMatrix, fieldOfView, aspect, near, far);
    
	
	gl.uniformMatrix4fv(worldMatLoc, gl.FALSE,  worldMatrix);
	gl.uniformMatrix4fv(viewMatLoc, gl.FALSE,  viewMatrix);
	gl.uniformMatrix4fv(projMatLoc, gl.FALSE,  projectionMatrix);
	

    gl.enable(gl.DEPTH_TEST);

	const identityMat = mat4.create();
    
	const loop = function() {
		angle = performance.now()/ 1000 / 60 * 30 * Math.PI;
        
        //czyścimy ekran
        gl.clearColor(...canvasColor, 1.0);  // R,G,B, A 
        gl.clear(gl.COLOR_BUFFER_BIT |  gl.DEPTH_BUFFER_BIT);

        // rysujemy pierwsza kostke
        mat4.identity(worldMatrix);
        
		
        mat4.translate(worldMatrix, worldMatrix, [3,0,0]);

        mat4.rotate(worldMatrix,worldMatrix,angle,[0.32,-0.35,1.7] );
        mat4.scale(worldMatrix, worldMatrix, [2, 0.3, 0.3]);	
        gl.uniformMatrix4fv(worldMatLoc,gl.FALSE, worldMatrix);
        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
        
        // rysujemy druga kostke
        mat4.identity(worldMatrix);
        mat4.translate(worldMatrix, worldMatrix, [-1,2,0]);
        mat4.rotate(worldMatrix,worldMatrix,angle,[0.32,0.35,1.7] );
       
        mat4.scale(worldMatrix, worldMatrix, [1, 2, 0.3]);
        gl.uniformMatrix4fv(worldMatLoc,gl.FALSE, worldMatrix);
        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);


        // rysujemy trzecia kostke
        mat4.identity(worldMatrix);
        mat4.rotate(worldMatrix,identityMat,angle,[4,0.35,1.7] );
        mat4.translate(worldMatrix, worldMatrix, [0,0,-1]);
        mat4.scale(worldMatrix, worldMatrix, [1, 0.1, 2]);
        gl.uniformMatrix4fv(worldMatLoc,gl.FALSE, worldMatrix);
        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
        

		requestAnimationFrame(loop);
	}
	
	
    requestAnimationFrame(loop);

}

function checkGl(gl) {
    if (!gl) {console.log('WebGL not supported, use another browser');}
}

function checkShaderCompile(gl, shader) {
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('shader not compiled', gl.getShaderInfoLog(shader));
    }
}

function checkLink(gl, program) {
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(program));
    }
}