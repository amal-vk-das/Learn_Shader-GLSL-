uniform sampler2D tDiffuse;
uniform float threshold;

void main() {
  vec4 color = texture2D(tDiffuse, gl_FragCoord.xy / resolution.xy);
  float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
  if (brightness > threshold) {
    gl_FragColor = color;
  } else {
    gl_FragColor = vec4(0.0);
  }
} 