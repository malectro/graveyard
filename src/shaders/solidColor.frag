precision mediump float;

uniform vec3 uColor;

varying vec3 vColor;

void main() {
  gl_FragColor = vec4(uColor, 1.0);
}
