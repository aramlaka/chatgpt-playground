const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const gl = canvas.getContext('webgl');

if (!gl) {
  alert('WebGL not supported in your browser.');
}

const vertexShaderSource = `
  attribute vec4 a_position;
  attribute vec4 a_color;
  varying vec4 v_color;

  uniform mat4 u_projection;
  uniform mat4 u_modelView;

  void main() {
    gl_Position = u_projection * u_modelView * a_position;
    v_color = a_color;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  varying vec4 v_color;

  void main() {
    gl_FragColor = v_color;
  }
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
const colorAttributeLocation = gl.getAttribLocation(program, 'a_color');
const projectionUniformLocation = gl.getUniformLocation(program, 'u_projection');
const modelViewUniformLocation = gl.getUniformLocation(program, 'u_modelView');

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
const positions = [
    // Front face
    -0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,
    0.5, 0.5, 0.5,
    -0.5, 0.5, 0.5,
  
    // Back face
    -0.5, -0.5, -0.5,
    -0.5, 0.5, -0.5,
    0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,
  
    // Top face
    -0.5, 0.5, -0.5,
    -0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,
  
    // Bottom face
    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5,
    0.5, -0.5, 0.5,
    -0.5, -0.5, 0.5,
  
    // Right face
    0.5, -0.5, -0.5,
    0.5, 0.5, -0.5,
    0.5, 0.5, 0.5,
    0.5, -0.5, 0.5,
  
    // Left face
    -0.5, -0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, 0.5, 0.5,
    -0.5, 0.5, -0.5,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  
  const faceColors = [
    [1.0, 0.0, 0.0, 1.0], // Front face: red
    [0.0, 1.0, 0.0, 1.0], // Back face: green
    [0.0, 0.0, 1.0, 1.0], // Top face: blue
    [1.0, 1.0, 0.0, 1.0], // Bottom face: yellow
    [1.0, 0.0, 1.0, 1.0], // Right face: magenta
    [0.0, 1.0, 1.0, 1.0], // Left face: cyan
  ];
  
  // Convert the array of colors into a table for all the vertices.
  let colors = [];
  for (let j = 0; j < faceColors.length; ++j) {
    const c = faceColors[j];
    colors = colors.concat(c, c, c, c);
  }
  
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  const indices = [
    0, 1, 2, 0, 2, 3, // front
    4, 5, 6, 4, 6, 7, // back
    8, 9, 10, 8, 10, 11, // top
    12, 13, 14, 12, 14, 15, // bottom
    16, 17, 18, 16, 18, 19, // right
    20, 21, 22, 20, 22, 23, // left
  ];
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  
  function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
    const fieldOfView = 45 * Math.PI / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
  
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
  
    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0, 1, 0]);
  
    gl.useProgram(program);
  
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
  
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);
  
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  
    gl.uniformMatrix4fv(projectionUniformLocation, false, projectionMatrix);
    gl.uniformMatrix4fv(modelViewUniformLocation, false, modelViewMatrix);
  
    const numIndices = tessellationLevel === 0 ? 36 : 6 * (2 ** (tessellationLevel * 2));
    gl.drawElements(gl.TRIANGLES, numIndices, gl.UNSIGNED_SHORT, 0);
  
    cubeRotation += deltaTime;
  }
  
  function render() {
    deltaTime = 0.01; // Update this value based on your frame rate for a smooth animation
    drawScene();
    requestAnimationFrame(render);
  }
  
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  
  let cubeRotation = 0;
  let deltaTime;

  let tessellationLevel = 0;

  canvas.addEventListener('click', () => {
    tessellationLevel++;
    tessellate();
  });

  function tessellate() {
    let newPositions = positions.slice();
    let newColors = colors.slice();
    let newIndices = indices.slice();
  
    for (let t = 0; t < tessellationLevel; t++) {
      const tempPositions = [];
      const tempColors = [];
      const tempIndices = [];
  
      for (let i = 0; i < newIndices.length; i += 3) {
        const idx = [
          newIndices[i],
          newIndices[i + 1],
          newIndices[i + 2],
        ];
  
        const faceVertices = [
          newPositions.slice(idx[0] * 3, idx[0] * 3 + 3),
          newPositions.slice(idx[1] * 3, idx[1] * 3 + 3),
          newPositions.slice(idx[2] * 3, idx[2] * 3 + 3),
        ];
  
        const faceColors = [
          newColors.slice(idx[0] * 4, idx[0] * 4 + 4),
          newColors.slice(idx[1] * 4, idx[1] * 4 + 4),
          newColors.slice(idx[2] * 4, idx[2] * 4 + 4),
        ];
  
        const midPoints = [
          faceVertices[0].map((v, index) => (v + faceVertices[1][index]) / 2),
          faceVertices[1].map((v, index) => (v + faceVertices[2][index]) / 2),
          faceVertices[2].map((v, index) => (v + faceVertices[0][index]) / 2),
        ];
  
        const midColors = [
          faceColors[0].map((c, index) => (c + faceColors[1][index]) / 2),
          faceColors[1].map((c, index) => (c + faceColors[2][index]) / 2),
          faceColors[2].map((c, index) => (c + faceColors[0][index]) / 2),
        ];
  
        const baseIndex = tempPositions.length / 3;
  
        tempPositions.push(...faceVertices.flat(), ...midPoints.flat());
        tempColors.push(...faceColors.flat(), ...midColors.flat());
        tempIndices.push(
          baseIndex, baseIndex + 3, baseIndex + 5,
          baseIndex + 1, baseIndex + 4, baseIndex + 3,
          baseIndex + 2, baseIndex + 5, baseIndex + 4,
          baseIndex + 3, baseIndex + 4, baseIndex + 5
        );
      }
  
      newPositions = tempPositions.slice();
      newColors = tempColors.slice();
      newIndices = tempIndices.slice();
    }
  
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(newPositions), gl.STATIC_DRAW);
  
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(newColors), gl.STATIC_DRAW);
  
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(newIndices), gl.STATIC_DRAW);
  }

  render();