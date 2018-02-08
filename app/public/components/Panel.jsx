import React from "react";
import ReactDOM from "react-dom";
import Box from "./Box.jsx";

export default class Panel extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		return (
			<Box title={this.props.title}></Box>
		)
	}
}