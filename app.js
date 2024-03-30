const vertexShaderText = `
  precision mediump float;

  attribute vec2 vertPosition;
  attribute vec3 vertColor;
  varying vec3 fragColor;

  void main()
  {
   fragColor = vertColor;
   gl_Position = vec4(vertPosition, 0.0, 1.0);
  }
`;

const fragmentShaderText = `
  precision mediump float;

  varying vec3 fragColor;

  void main()
  {
   gl_FragColor = vec4(fragColor, 1.0);
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
  // Create Buffer
  //
  const triangleVertices = [
    // X, Y // R, G, B
    ...[0.0, 0.5, 0.0, 1.0, 1.0],
    ...[-0.5, -0.5, 1.0, 0.0, 1.0],
    ...[0.5, -0.5, 1.0, 1.0, 0.0],
  ];

  const triangleVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);

  // JS stores everything as 64 bit precision number, but OpenGL expects 32 bit
  // precision so we convert the triangleVertices to 32 bit
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(triangleVertices),
    gl.STATIC_DRAW,
  );

  const positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
  const colorAttribLocation = gl.getAttribLocation(program, "vertColor");
  gl.vertexAttribPointer(
    positionAttribLocation, // Attribute Location
    2, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE, // For Normalization
    5 * Float32Array.BYTES_PER_ELEMENT, // Size of individual vertex
    0, // Offset from the begining of a single vertex to this attribute
  );
  gl.vertexAttribPointer(
    colorAttribLocation, // Attribute Location
    3, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE, // For Normalization
    5 * Float32Array.BYTES_PER_ELEMENT, // Size of individual vertex
    2 * Float32Array.BYTES_PER_ELEMENT, // Offset from the begining of a single vertex to this attribute
  );

  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(colorAttribLocation);

  //
  // Main render loop
  //
  gl.useProgram(program);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
