// Real-time WebGL Fisheye Lens Renderer (Barrel Distortion + Chromatic Aberration + Circular Vignette)
// Designed for 60 FPS mobile performance with zero dependencies

const VS_SOURCE = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = (a_position + 1.0) * 0.5;
  // Invert Y for WebGL texture coordinate system
  v_uv.y = 1.0 - v_uv.y;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FS_SOURCE = `
precision mediump float;
uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_mirror; // 1.0 = mirrored, 0.0 = normal
varying vec2 v_uv;

void main() {
  vec2 uv = v_uv;
  if (u_mirror > 0.5) {
    uv.x = 1.0 - uv.x;
  }

  // Normalized coordinates centered at (0, 0)
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;

  // Aspect ratio correction to keep circular fisheye round
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p_aspect = vec2(p.x * aspect, p.y);
  float r = length(p_aspect);

  // Fisheye boundary radius
  float maxR = 0.65;

  if (r > maxR) {
    // Outer black circular bezel
    gl_FragColor = vec4(0.04, 0.04, 0.05, 1.0);
    return;
  }

  // Barrel distortion mapping (reverse lookup)
  // Non-linear polynomial warping
  float theta = atan(p_aspect.y, p_aspect.x);
  float normR = r / maxR;
  float distortR = normR * (1.0 - 0.38 * (1.0 - normR * normR));
  float srcR = distortR * maxR;

  // Chromatic aberration at edge of lens
  float chromatic = 0.012 * pow(normR, 2.5);

  vec2 redCoord = center + vec2(cos(theta) / aspect, sin(theta)) * (srcR * (1.0 + chromatic));
  vec2 greenCoord = center + vec2(cos(theta) / aspect, sin(theta)) * srcR;
  vec2 blueCoord = center + vec2(cos(theta) / aspect, sin(theta)) * (srcR * (1.0 - chromatic));

  // Check bounds
  if (greenCoord.x < 0.0 || greenCoord.x > 1.0 || greenCoord.y < 0.0 || greenCoord.y > 1.0) {
    gl_FragColor = vec4(0.04, 0.04, 0.05, 1.0);
    return;
  }

  float red = texture2D(u_texture, clamp(redCoord, 0.0, 1.0)).r;
  float green = texture2D(u_texture, clamp(greenCoord, 0.0, 1.0)).g;
  float blue = texture2D(u_texture, clamp(blueCoord, 0.0, 1.0)).b;

  // Optical glass vignette
  float vignette = smoothstep(maxR, maxR - 0.12, r);

  // Gentle center brightness pop & lens flare tint
  vec3 color = vec3(red, green, blue) * (0.88 + 0.16 * (1.0 - normR)) * vignette;

  // Lens edge ring reflection
  if (r > maxR - 0.015 && r <= maxR) {
    color += vec3(0.12, 0.16, 0.22);
  }

  gl_FragColor = vec4(color, 1.0);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("Shader compile failed:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export interface FisheyeRenderer {
  render: (
    source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
    isMirrored: boolean
  ) => void;
  destroy: () => void;
}

export function createFisheyeRenderer(canvas: HTMLCanvasElement): FisheyeRenderer | null {
  const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true, alpha: false });
  if (!gl) return null;

  const vs = createShader(gl, gl.VERTEX_SHADER, VS_SOURCE);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, FS_SOURCE);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("Program link failed:", gl.getProgramInfoLog(program));
    return null;
  }

  gl.useProgram(program);

  // Position quad buffer
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );

  const aPosition = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  // Texture
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const uResolution = gl.getUniformLocation(program, "u_resolution");
  const uMirror = gl.getUniformLocation(program, "u_mirror");

  return {
    render: (source, isMirrored) => {
      if (!canvas.width || !canvas.height) return;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uMirror, isMirrored ? 1.0 : 0.0);

      gl.bindTexture(gl.TEXTURE_2D, texture);
      try {
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          source
        );
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      } catch {
        // Handle race conditions during frame updates
      }
    },
    destroy: () => {
      gl.deleteTexture(texture);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}

/**
 * Apply fisheye barrel distortion onto a 2D canvas from an image
 */
export function applyFisheyeToImage(
  img: HTMLImageElement | HTMLCanvasElement,
  width: number,
  height: number
): HTMLCanvasElement {
  const offscreen = document.createElement("canvas");
  offscreen.width = width;
  offscreen.height = height;

  const renderer = createFisheyeRenderer(offscreen);
  if (renderer) {
    renderer.render(img, false);
    renderer.destroy();
    return offscreen;
  }

  // 2D fallback: draw source if WebGL is unavailable
  const ctx = offscreen.getContext("2d");
  if (ctx) {
    ctx.drawImage(img, 0, 0, width, height);
  }
  return offscreen;
}
