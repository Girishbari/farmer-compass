import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import '../App.css'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch'

import { Icon } from 'leaflet'


const center = {
  lat: 28.658806822558827,
  lng: 77.23626424228969,
}

function DraggableMarker({position,setPosition}) {
  const [draggable, setDraggable] = useState(false)
  const markerRef = useRef(null)
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          setPosition(marker.getLatLng())
        }
      },
    }),
    [],
    )
    const toggleDraggable = useCallback(() => {
      setDraggable((d) => !d)
    }, [])
    
    return (
      <Marker
      draggable={draggable}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}>
      <Popup minWidth={90}>
        <span onClick={toggleDraggable}>
          {draggable
            ? 'Marker is draggable'
            : 'Click here to make draggable'}
        </span>
      </Popup>
    </Marker>
  )
}


function MapComponent() {
  const [position, setPosition] = useState(center)
  console.log(position)
      return( 
        <>
        <main className='__main_container'>
        <MapContainer center={center} zoom={5}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=tP64pPa6rbB8orPzBmIa"
          />
        < DraggableMarker position={position} setPosition={setPosition}/>
        </MapContainer>
        <p className='__paragrapH'>
            <span>Lat: {position.lat}</span>
            <br />
            <span>Lng: {position.lng}</span>
        </p>
        </main>
        </>
      ) 
}

export default MapComponent