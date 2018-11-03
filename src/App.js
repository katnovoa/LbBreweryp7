import React, { Component } from 'react';
import './App.css';
import locations from './data/locations.json';
import MapDisplay from './components/MapDisplay';
import SideMenu from './components/SideMenu';


class App extends Component {

  state = {
    lat: 33.8356148,
    lon: -118.2038736,
    zoom: 12,
    all: locations,
    mapScriptAvailable: true,
    open: false,
    selectedIndex: null

  }

  styles = {
    menuButton: {
      marginLeft: 10,
      marginRight: 20,
      position: "absolute",
      left: 10,
      top: 20,
      background: "white",
      padding: 10
    },
    hide: {
      display: 'none'
    },
    header: {
      marginTop: "0px"
    }

  };

  componentDidMount = () => {
    this.setState({
      ...this.state,
      filtered: this.filterLocations(this.state.all, "")
    });
  }


  // controls whether the menu is displayed on/off screen
  toggleMenu = () => {
      this.setState({
        open: !this.state.open
      });
    }
    //Updates query and filters list when user searches for specific ve
    updateQuery = (query) => {
     this.setState({
       ...this.state,
       selectedIndex: null,
       filtered: this.filterLocations(this.state.all, query)
     });
   }
   //Matches query and filter locations
   filterLocations = (locations, query) => {

     return locations.filter(location => location.name.toLowerCase().includes(query.toLowerCase()));
   }

    clickListItem = (index) => {
      this.setState( { selectedIndex: index, open: !this.state.open})
    }

  render = () => {
    return (
      <div className= "App">
      <div style={this.styles.header}>
      <button onClick={this.toggleMenu} style={this.styles.menuButton}>
            <i className="fas fa-bars"></i>
          </button>
          <h1>Breweries Long Beach CA</h1>
        </div>
        <MapDisplay
          lat={this.state.lat}
          lon={this.state.lon}
          zoom={this.state.zoom}
          locations={this.state.filtered}
          selectedIndex={this.state.selectedIndex}
          clickListItem={this.clickListItem}/>

        <SideMenu
         locations={this.state.filtered}
         open={this.state.open}
         toggleMenu={this.toggleMenu}
         filterLocations={this.updateQuery}
         clickListItem={this.clickListItem}/>
      </div>
    );
  }
}

export default App;
