#version 130

uniform vec2 resolution; //defualt 640 480
uniform float time;
uniform sampler2D tex;

//red yellow green cyan blue purple
const vec3 RED = vec3(1,0,0);
const vec3 GREEN = vec3(0,1,0);
const vec3 YELLOW = vec3(1,1,0);
const vec3 BLUE = vec3(0,0,1);
const vec3 PURPLE = vec3(1,0,1);
const vec3 CYAN = vec3(0,1,1);

vec3 goldEdge(vec2 position) {
	vec3 base = vec3(149. / 255., 99. / 255., 71. / 255.);
	float scalar = (sin((position.x - position.y) * 60.) + 1.) * .5; //normalized sin, unit scalar
	vec3 realColor = base + (scalar * (1. - (71. / 255.)));
	return realColor;
}

vec3 scans(vec2 position) {
	vec3 realColor;

	const float scanPeriod = 4./480.; //2 on 2 off
	vec3 scanColors[] = vec3[15](PURPLE,GREEN,RED,PURPLE,BLUE,PURPLE,YELLOW,CYAN,GREEN,PURPLE,BLUE,GREEN,PURPLE,BLUE,RED);
	if (mod(position.y, scanPeriod) > (scanPeriod / 2.)) {
		float colorPeriod = (39.*2.)/resolution.y;
		float colorIndex = mod((position.y / colorPeriod) + time, scanColors.length());
		//int functionInput = int(fract(colorIndex) * 19.*2.)*2;
		//int function = abs(functionInput - (19*2));
		//const float ohxeleven = 17./256.;
		//float subtraction = ohxeleven * function;
		realColor = scanColors[int(colorIndex)] * fract(colorIndex); //- subtraction;
	} else {
		float colorPeriod = (39.*2.)/resolution.y;
		float colorIndex = mod((position.y / colorPeriod) - time, scanColors.length());
		realColor = scanColors[int(colorIndex)] * fract(colorIndex);

		//float colorPeriod = (78.*2.)/resolution.y;
		//float colorIndexf = -mod((position.y / colorPeriod) - (time + 0.5), -scanColors.length());
		//float remainder = fract(colorIndexf);
		//float scalar = 1.-abs(remainder*8.-2.);
		//realColor = scanColors[int(colorIndexf)] * scalar;
		//realColor = vec3(0,0,0);
	}
	return realColor;
}

void main() {
	//if (gl_FragCoord.y < 1) {
	//	gl_FragColor = vec4(0.9,0,0,1);
	//	return;
	//}

	vec4 textureColorHere = texture2D(tex, vec2(gl_TexCoord[0]));
	if (textureColorHere.a == 0) {
		gl_FragColor = vec4(0,0,0,0);
		return;
	}

	vec2 position = (gl_FragCoord.xy / resolution.xy);

	vec3 realColor;
	if (textureColorHere.r <= 0.1) {
		realColor = goldEdge(position);
	} else {
		realColor = scans(position);
	}
	gl_FragColor = vec4(realColor, 1);

	//78 vertical pixels between colors, therefore 78*2 because upscaled from original. 78./resolution.y
}

