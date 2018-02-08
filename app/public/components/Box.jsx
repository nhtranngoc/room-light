import React from "react";
import boxStyles from "./_box.css";


export default class Box extends React.Component {
	
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<article>
				<h1>{this.props.title}</h1>
			</article>
			)
	}

}