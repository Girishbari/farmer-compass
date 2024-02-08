import MapComponent from "./components/MapComponent"

function App() {

      return( 
        <main className='__main_container'>
            <MapComponent />
        </main>
      ) 
}

export default App

// function LocationMarker({position, setPosition}) {
//   const customMarker = new Icon({
//     iconUrl:'https://static.vecteezy.com/system/resources/thumbnails/017/178/337/small/location-map-marker-icon-symbol-on-transparent-background-free-png.png',
//     iconSize: [38,38]
//   })
//   const map = useMapEvents({
//     click(e) {
//       setPosition(e.latlng);
//       map.setView(position, map.getZoom())
//     },
//     locationfound(e) {
//       map.flyTo(e.latlng, map.getZoom())
//     },
//   })
//   return position === null ? null : (
//     <Marker position={position} icon={customMarker}>
//     </Marker>
//   )
// }

// const Search = (props) => {
//   const map = useMap() // access to leaflet map
//   const { provider } = props

//   useEffect(() => {
//       const searchControl = new GeoSearchControl({
//           provider,
//       })

//       map.addControl(searchControl) // this is how you add a control in vanilla leaflet
//       return () => map.removeControl(searchControl)
//   }, [props])

//   return null // don't want anything to show up from this comp
// }

