import React, { Component } from 'react';
import './App.css';
import BarChart from './BarChart';

class App extends Component {
  state = {
    width: 1000,
    height: 600,
  }

  render() {
    return (
      <div>
        <header>
          <BarChart width={this.state.width} height={this.state.height} />
          
          
        </header>
      </div>
    );
  }
}

export default App;
