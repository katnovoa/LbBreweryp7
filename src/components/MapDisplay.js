import React, {Component} from 'react';
import {Map, InfoWindow, GoogleApiWrapper} from 'google-maps-react';
import MapErrorDisplay from './MapErrorDisplay';

const MAP_KEY = "AIzaSyDzFyIoVrkkXAXiUtPP5ST9bXE_-r3hvlc";
const FS_CLIENT = "SKDEJUAAPYKVNP0CFCXBWJU0PTPDBNVZOBDNMBJEEJPF0M0M";
const FS_SECRET =  "H3KUA3C0BCXBAOC3JFOHQVKWX00CTULCJQDP2G3FZZ0KR5VB";
const FS_VERSION = "20181006";

class MapDisplay extends Component {
    state = {
        map: null,
        firstDrop: true,
        markers: [],
        markerProps: [],
        activeMarker: null,
        activeMarkersProps: null,
        showingInfoWindow: false

    };

    componentDidMount = () => {
}

    componentWillReceiveProps = (props) => {
        this.setState({firstDrop: false});

        // updates marker list
        if (this.state.markers.length !== props.locations.length) {
            this.closeInfoWindow();
            this.updateMarkers(props.locations);
            this.setState({activeMarker: null});

            return;
        }

        // closes window when the selected item is not the same as the active marker
        if (!props.selectedIndex || (this.state.activeMarker &&
            (this.state.markers[props.selectedIndex] !== this.state.activeMarker))) {
            this.closeInfoWindow();
        }

        // sets a selected index
        if (props.selectedIndex === null || typeof(props.selectedIndex) === "undefined") {
           return;
       };
        //when marker is cliked
        this.onMarkerClick(this.state.markerProps[props.selectedIndex], this.state.markers[props.selectedIndex]);
    }

  // Saves  map reference in state and sets up the location markers
    mapReady = (props, map) => {
        this.setState({map});
        this.updateMarkers(this.props.locations);

    }

    //disables any active maker animation
      closeInfoWindow = () => {
        this.state.activeMarker && this
          .state
          .activeMarker
          .setAnimation(null);
        this.setState({showingInfoWindow: false, activerMaker: null, activeMarkerProps: null});
      }

      //look for breweries in foursquare data
      getBusinessInfo = (props, data) => {
        return data
              .response
              .venues
              .filter(item => item.name.includes(props.name) || props.name.includes(item.name));
      }

      onMarkerClick = (props, marker, e) => {

        this.closeInfoWindow();



        //fetch foursquare data for brewery list
        let url = `https://api.foursquare.com/v2/venues/search?client_id=${FS_CLIENT}&client_secret=${FS_SECRET}&v=${FS_VERSION}&radius=100&ll=${props.position.lat},${props.position.lng}&llAcc=100`;
        let headers = new Headers();
        let request = new Request(url, {
            method: 'Get',
            headers
        });

        //creates props for active marker
        let activeMarkerProps;
        fetch(request)
            .then(response => response.json ())
            .then(result => {

          //gets brewery info from list
          let brewery = this.getBusinessInfo(props, result);
          activeMarkerProps ={
            ...props,
            foursquare: brewery[0]
          };

          //get list of brewery images
          if(activeMarkerProps.foursquare) {
            let url = `https://api.foursquare.com/v2/venues/${brewery[0].id}/photos?client_id=${FS_CLIENT}&client_secret=${FS_SECRET}&v=${FS_VERSION}`;
            fetch(url)
              .then(response => response.json ())
              .then(result => {
                  activeMarkerProps = {
                    ...activeMarkerProps,
                    images: result.response.photos
                };
                if (this.state.activeMarker)
                    this.state.activeMarker.setAnimation(null);
                  marker.setAnimation(this.props.google.maps.Animation.BOUNCE);
                  this.setState({showingInfoWindow: true, activeMarker: marker, activeMarkerProps});
                })
        } else {
            marker.setAnimation(this.props.google.maps.Animation.BOUNCE);
          this.setState({showingInfoWindow: true, activeMarker: marker, activeMarkerProps});
              }
          })
  }


//if all locations are filtered  done
updateMarkers = (locations) => {
  this.closeInfoWindow();

    if (!locations)
        return;

//remove any other existing markers
    this
        .state
        .markers
        .forEach(marker => marker.setMap(null));



//Adds markers to the map
  let markerProps = [];
  let markers = locations.map((location, index) => {
    let mProps = {key: index, index, name: location.name,
        position: location.pos, url: location.url};
      markerProps.push(mProps);

      let animation = this.state.firstDrop ? this.props.google.maps.Animation.DROP : null;
      let marker = new this.props.google.maps.Marker({position: location.pos, map: this.state.map, animation});
          marker.addListener('click', () => {
              this.onMarkerClick(mProps, marker, null);
          });
          return marker;
        })

        this.setState( {markers, markerProps});
      }

    render = () => {
        const style = {
            width: '100%',
            height: '100%'
        }
        const center = {
            lat: this.props.lat,
            lng: this.props.lon
        }
        let amProps = this.state.activeMarkerProps;

        return (
            <Map
                role="application"
                aria-label="map"
                onReady={this.mapReady}
                google={this.props.google}
                zoom={this.props.zoom}
                style={style}
                initialCenter={center}
                onClick={this.closeInfoWindow}>
                <InfoWindow
                    marker={this.state.activeMarker}
                    visible={this.state.showingInfoWindow}
                    onClose={this.closeInfoWindow}>
                    <div>
                        <h3>{amProps && amProps.name}</h3>
                        {amProps && amProps.url
                          ? (
                              <a href={amProps.url}>See Website</a>
                          )
                          : ""}
                          {amProps && amProps.images
                            ? (
                                <div><img
                                    alt={amProps.name + " Venue Image"}
                                    src={amProps.images.items[0].prefix + "100x100" + amProps.images.items[0].suffix}/>
                                    <p>Image via Foursquare</p>
                                  </div>
                              )
                              : ""
                          }
                        </div>
                  </InfoWindow>
            </Map>
        )
    }
}

export default GoogleApiWrapper({apiKey: MAP_KEY, LoadingContainer: MapErrorDisplay})(MapDisplay)
