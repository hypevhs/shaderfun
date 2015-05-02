#version 130

uniform vec2 resolution; //default 640 480
uniform float time;
uniform sampler2D tex;

const vec3 RED = vec3(1,0,0);
const vec3 GREEN = vec3(0,1,0);
const vec3 YELLOW = vec3(1,1,0);
const vec3 BLUE = vec3(0,0,1);
const vec3 PURPLE = vec3(1,0,1);
const vec3 CYAN = vec3(0,1,1);
const vec3 scanColors[] = vec3[15](PURPLE,GREEN,RED,PURPLE,BLUE,PURPLE,YELLOW,CYAN,GREEN,PURPLE,BLUE,GREEN,PURPLE,BLUE,RED);

vec3 goldEdge(vec2 position) {
	vec3 base = vec3( //gold-ish brown
		149. / 255.,
		99. / 255.,
		71. / 255.
	);

	//normalized sin, unit scalar
	float scalar = (sin((position.x - position.y) * 60.) + 1.) * .5;

	vec3 realColor = base + (scalar * (1. - (71. / 255.)));
	return realColor;
}

vec3 scans(vec2 position) {
	const float scanPeriod = 4. / 480.; //2 on 2 off

	float colorPeriod = (39. * 2.) / resolution.y;
	float colorIndexUnbound = (position.y / colorPeriod);

	if (mod(position.y, scanPeriod) > (scanPeriod / 2.)) {
		colorIndexUnbound += time; //scans moving up
	} else {
		colorIndexUnbound -= time; //scans moving down
	}

	float colorIndex = mod(colorIndexUnbound, scanColors.length());
	vec3 realColor = scanColors[int(colorIndex)] * fract(colorIndex);
	return realColor;
}

void main() {
	vec4 textureColorHere = texture2D(tex, vec2(gl_TexCoord[0]));
	if (textureColorHere.a == 0) {
		gl_FragColor = vec4(0,0,0,0);
		return;
	}
	vec2 position = (gl_FragCoord.xy / resolution.xy);
	vec3 realColor;

	//if black pixel, it's the edge, else scanline effect
	if (textureColorHere.r <= 0.1) {
		realColor = goldEdge(position);
	} else {
		realColor = scans(position);
	}

	gl_FragColor = vec4(realColor, 1);
}
