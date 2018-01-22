import React from 'react';
import ReactDOM from "react-dom";
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';
import { SocketProvider } from 'socket.io-react';
import io from 'socket.io-client';

const socket = io.connect("http://192.168.1.8");

export default class SliderComponent extends React.Component {
	constructor() {
		super();
		this.state = {
			h: 0,
			s: 50,
			l: 50
		}
	};

	onSliderChange(value, type) {
		switch(type) {
			case "h":
				this.setState({
					h: value
				});
			break;
			case "s":
				this.setState({
					s: value
				})
			break;
			case "l":
				this.setState({
					l: value
				})
			break;
		};
		var complementH = ((this.state.h*2.55)+127.5) > 255 ? this.state.h-127.5 : this.state.h+127.5;
		var fgColor = "hsl("+ this.state.h*2.55 + "," + this.state.s + "%," + this.state.l+"%)";
		var bgColor = "hsl("+complementH + ",14%,88%)"; 
		console.log(fgColor);
		document.body.style.backgroundColor = bgColor;
		document.getElementById('circle').style.backgroundColor = fgColor;

		socket.emit('hsl',fgColor);

	};

	render() {
		return( 
			<div id="container">
				<div id="circle"></div>
				<div id="sliders">
					<Slider defaultValue={0} onChange={(e) => this.onSliderChange(e, "h")}/>
					<Slider defaultValue={50} onChange={(e) => this.onSliderChange(e, "s")}/>
					<Slider defaultValue={50} onChange={(e) => this.onSliderChange(e, "l")}/>
				</div>
			</div>
		)
	};
}