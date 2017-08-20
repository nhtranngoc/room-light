import React from 'react';
import ReactDOM from 'react-dom';
import SliderComponent from './components/SliderComponent.jsx';
import Banner from './components/Banner.jsx';
import './index.css';

ReactDOM.render(
	<div>
		<Banner />
		<SliderComponent />
	</div>
	, document.getElementById('root'));