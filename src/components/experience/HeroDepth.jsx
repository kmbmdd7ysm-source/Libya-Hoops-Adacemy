import { useEffect, useRef } from 'react';
export default function HeroDepth() {
  const ref = useRef(null);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.hardwareConcurrency < 4)
      return;
    let raf = 0,
      visible = true,
      active = true;
    const c = ref.current,
      gl = c?.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power' });
    if (!gl) return;
    const vs = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
    const fs = `precision mediump float;uniform vec2 r;uniform float t;void main(){vec2 uv=gl_FragCoord.xy/r;float d=length(uv-.5);float a=.035*(.5+.5*sin(t*.22+uv.x*8.));float lines=smoothstep(.018,0.,abs(fract((uv.x+uv.y*.36)*9.+t*.018)-.5));gl_FragColor=vec4(vec3(1.),(a*(1.-d)+lines*.018));}`;
    const shader = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const pr = gl.createProgram();
    gl.attachShader(pr, shader(gl.VERTEX_SHADER, vs));
    gl.attachShader(pr, shader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(pr);
    gl.useProgram(pr);
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const p = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(p);
    gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);
    const r = gl.getUniformLocation(pr, 'r'),
      t = gl.getUniformLocation(pr, 't');
    const resize = () => {
      const d = Math.min(devicePixelRatio, 1.25);
      c.width = c.clientWidth * d;
      c.height = c.clientHeight * d;
      gl.viewport(0, 0, c.width, c.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(c);
    const vis = () => (active = !document.hidden);
    document.addEventListener('visibilitychange', vis);
    const start = performance.now();
    const draw = () => {
      if (active && visible) {
        gl.uniform2f(r, c.width, c.height);
        gl.uniform1f(t, (performance.now() - start) / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', vis);
      gl.deleteProgram(pr);
      gl.deleteBuffer(b);
    };
  }, []);
  return <canvas ref={ref} className="hero-webgl" aria-hidden="true" />;
}
