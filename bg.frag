#version 130

uniform float time;
uniform vec2 resolution;

//float pi = 3.14159265;

float rand(vec2 coord){
    return fract(sin(dot(coord, vec2(12.9898,78.233)) ) * 43758.5453);
}

float rrand(vec2 coord, float low, float high) {
        return mod(rand(coord), high-low) + low;
}

float stairstep(float inp, int scale) {
        return int(inp * scale) / float(scale);
}

vec2 stairstepv2(vec2 inp, int scale) {
        return vec2(
                int(inp.x * scale) / float(scale),
                int(inp.y * scale) / float(scale)
                );
}

float zoomin(float value, float divscale) {
        return (value / divscale) + (0.5 / divscale);
}

float unitsin(float inp) {
        return (sin(inp)/2.)+1.;
}

void main() {
        vec2 position = (gl_FragCoord.xy / resolution.xy);

        float r = (sin(time)*position.x*2.)-(sin(time)*position.y*2.);
        float b = (sin(time)*position.y*2.)-(sin(time)*position.x*2.);
        float rs = r; //stairstep(r, 32);
        float bs = b; //stairstep(b, 32);
        float rz = rs; //zoomin(r,2.);
        float bz = bs; //zoomin(b,2.);
        float rr = rz * rrand(stairstepv2(position,32), 0.4, 0.6);
        float br = bz * rrand(stairstepv2(position,32), 0.4, 0.6);
        vec3 resultColor = mix(vec3(rr,0.,br), vec3(0.8,0.,0.8), 0); //unitsin(time*2.)/4.);
        gl_FragColor = vec4(resultColor,1.);
}
