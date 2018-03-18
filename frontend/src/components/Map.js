import React, { Component } from 'react';

import { Map as LeafletMap, TileLayer, Marker } from 'react-leaflet';

export default class Map extends Component {
  static propTypes = {};

  render() {
    return (
      <div>
        <LeafletMap center={this.props.location} zoom={3} zoomControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={this.props.location} />
        </LeafletMap>
      </div>
    );
  }
}
