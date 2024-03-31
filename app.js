const vertexShaderText = `
  precision mediump float;

  attribute vec3 vertPosition;
  attribute vec2 vertTexCoord;
  varying vec2 fragTexCoord;
  uniform mat4 mWorld;
  uniform mat4 mView;
  uniform mat4 mProj;

  void main()
  {
   fragTexCoord = vertTexCoord;
   gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
  }
`;

const fragmentShaderText = `
  precision mediump float;

  varying vec2 fragTexCoord;
  uniform sampler2D sampler;

  void main()
  {
   gl_FragColor = texture2D(sampler, fragTexCoord);
  }
`;

function InitDemo() {
  let canvas = document.getElementById("webgl-tut-canvas");
  let gl = canvas.getContext("webgl");

  // for IE edge etc
  if (!gl) {
    console.log("webgl not supported, trying experimental-webgl");
    gl = canvas.getContext("experimental-webgl");
  }

  if (!gl) {
    alert("Your browser doesn't support WebGl");
  }

  // canvas.width = window.innerWidth;
  // canvas.height = window.innerHeight;

  gl.clearColor(0.75, 0.85, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CCW);
  gl.cullFace(gl.BACK);

  //
  // Create Shaders
  //
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(vertexShader, vertexShaderText);
  gl.shaderSource(fragmentShader, fragmentShaderText);

  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error(
      "ERROR compiling vertex shader!",
      gl.getShaderInfoLog(vertexShader),
    );
    return;
  }

  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error(
      "ERROR compiling fragment shader!",
      gl.getShaderInfoLog(fragmentShader),
    );
    return;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("ERROR compiling program!", gl.getProgramInfoLog(program));
    return;
  }

  // Mostly done while testing since it can be expensive
  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error("ERROR validating program!", gl.getProgramInfoLog(program));
    return;
  }

  //
  // Create buffer
  //
  const boxVertices = [
    // X, Y, Z          U, V
    // Top
    ...[-1.0, 1.0, -1.0, 0, 0],
    ...[-1.0, 1.0, 1.0, 0, 1],
    ...[1.0, 1.0, 1.0, 1, 1],
    ...[1.0, 1.0, -1.0, 1, 0],

    // Left
    ...[-1.0, 1.0, 1.0, 0, 0],
    ...[-1.0, -1.0, 1.0, 1, 0],
    ...[-1.0, -1.0, -1.0, 1, 1],
    ...[-1.0, 1.0, -1.0, 0, 1],

    // Right
    ...[1.0, 1.0, 1.0, 1, 1],
    ...[1.0, -1.0, 1.0, 0, 1],
    ...[1.0, -1.0, -1.0, 0, 0],
    ...[1.0, 1.0, -1.0, 1, 0],

    // Front
    ...[1.0, 1.0, 1.0, 1, 1],
    ...[1.0, -1.0, 1.0, 1, 0],
    ...[-1.0, -1.0, 1.0, 0, 0],
    ...[-1.0, 1.0, 1.0, 0, 1],

    // Back
    ...[1.0, 1.0, -1.0, 0, 0],
    ...[1.0, -1.0, -1.0, 0, 1],
    ...[-1.0, -1.0, -1.0, 1, 1],
    ...[-1.0, 1.0, -1.0, 1, 0],

    // Bottom
    ...[-1.0, -1.0, -1.0, 1, 1],
    ...[-1.0, -1.0, 1.0, 1, 0],
    ...[1.0, -1.0, 1.0, 0, 0],
    ...[1.0, -1.0, -1.0, 0, 1],
  ];

  const boxIndices = [
    // Top
    ...[0, 1, 2],
    ...[0, 2, 3],

    // Left
    ...[5, 4, 6],
    ...[6, 4, 7],

    // Right
    ...[8, 9, 10],
    ...[8, 10, 11],

    // Front
    ...[13, 12, 14],
    ...[15, 14, 12],

    // Back
    ...[16, 17, 18],
    ...[16, 18, 19],

    // Bottom
    ...[21, 20, 22],
    ...[22, 20, 23],
  ];

  const boxVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);

  // JS stores everything as 64 bit precision number, but OpenGL expects 32 bit
  // precision so we convert the triangleVertices to 32 bit
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

  const boxIndexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(boxIndices),
    gl.STATIC_DRAW,
  );

  const positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
  const texCoordAttribLocation = gl.getAttribLocation(program, "vertTexCoord");
  gl.vertexAttribPointer(
    positionAttribLocation, // Attribute Location
    3, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE, // For Normalization
    5 * Float32Array.BYTES_PER_ELEMENT, // Size of individual vertex
    0, // Offset from the begining of a single vertex to this attribute
  );
  gl.vertexAttribPointer(
    texCoordAttribLocation, // Attribute Location
    2, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE, // For Normalization
    5 * Float32Array.BYTES_PER_ELEMENT, // Size of individual vertex
    3 * Float32Array.BYTES_PER_ELEMENT, // Offset from the begining of a single vertex to this attribute
  );

  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(texCoordAttribLocation);

  //
  // Create Texture
  //
  const boxTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    document.getElementById("crate-texture"),
  );

  // unbind texture after loading in buffer
  // gl.bindTexture(gl.TEXTURE_2D, null);

  // Tell OpenGL state machine which program should be active use
  gl.useProgram(program);

  const matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
  const matViewUniformLocation = gl.getUniformLocation(program, "mView");
  const matProjUniformLocation = gl.getUniformLocation(program, "mProj");

  const worldMatrix = new Float32Array(16);
  const viewMatrix = new Float32Array(16);
  const projMatrix = new Float32Array(16);

  glMatrix.mat4.identity(worldMatrix);
  glMatrix.mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
  glMatrix.mat4.perspective(
    projMatrix,
    glMatrix.glMatrix.toRadian(45),
    canvas.width / canvas.height,
    0.1,
    1000.0,
  );

  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

  const xRotationMatrix = new Float32Array(16);
  const yRotationMatrix = new Float32Array(16);

  //
  // Main render loop
  //
  let angle = 0;
  function loop() {
    angle = (performance.now() / 1000 / 6) * 2 * Math.PI;
    glMatrix.mat4.fromRotation(xRotationMatrix, angle, [1, 0, 0]);
    glMatrix.mat4.fromRotation(yRotationMatrix, angle / 2, [0, 1, 0]);
    glMatrix.mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
