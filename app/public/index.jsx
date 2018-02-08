import React from "react";
import ReactDOM from "react-dom";
import Panel from "./components/Panel.jsx";

ReactDOM.render(
	<div>
		<Panel title="Power"></Panel>
		<Panel title="f.lux"></Panel>
		<Panel title="Fill"></Panel>
		<Panel title="Presets"></Panel>
	</div>
, document.getElementById("root"));