import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import '../App.css'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, useMap, } from 'react-leaflet'
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch'
import axios from 'axios'
import { Icon } from 'leaflet'
import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'

const ambeeAPI = "9f053bd16c211d191b63df34dc04ee059214824e7535facf391c36a86bc0f38b"


// const apiKey = "AIzaSyBYeAX0KJ03Rv-v0G28LPbU8HnWFK5BP6k"
// const apiKey = "sk-lHkNqHygVEjeUor8eUwaT3BlbkFJYeqzl8OZVx3obFDLRkI"

const center = {
  lat: 31.1048,
  lng: 77.1734,
}

const openAI = new OpenAI({
  apiKey: import.meta.env.VITE_openAIkey,
  dangerouslyAllowBrowser: true
})



function MapComponent() {
  const [position, setPosition] = useState(center)
  const [data, setData] = useState(null);
  const [currentLocData, setCurrentLocData] = useState();
  const [location, setLocation] = useState([])
  const [centerPos, setCenterPos] = useState(true);

  useEffect(() => {

    if (currentLocData !== undefined) {
      fetchGPTSuggestion();
    }
  }, [currentLocData])

  const fetchGPTSuggestion = async () => {
    try {
      const prompt = `${currentLocData} is the current climate of place ${currentLocData.lat, currentLocData.lng}, please give some suggestion for farming of given crop`
      const gptResponse = await openAI.chat.completions.create({
        messages: [{ role: 'system', content: prompt }, { role: 'user', content: data }],
        model: 'gpt-3.5-turbo-0125',
      })
      console.log(gptResponse.choices[0].message.content)
      setCurrentLocData({
        ...currentLocData,
        gptSuggestion: gptResponse.choices[0].message.content
      })
    } catch (error) {
      console.log(error);
    }
  }

  const handleClick = async () => {
    console.log(data)
    setCenterPos(true)
    try {
      const prompt = `your a agriculture expert you know which places grows which crop in India only so you only return in JSON of all coordinates keys with a value in this format [31.1048, 77.1734], then a title of the location with the a title key (make sure there are more than 1 coordinates)`
      const resp = await openAI.chat.completions.create({
        messages: [{ role: 'system', content: prompt }, { role: 'user', content: data }],
        model: 'gpt-3.5-turbo-0125',
        response_format: { type: "json_object" },

      })
      const generatedResponse = JSON.parse(resp.choices[0].message.content);
      console.log(generatedResponse)
      setLocation(generatedResponse.coordinates)

    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <main className='__main_container'>
        <MapContainer center={center} zoom={5}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=YwJfI3tmNFKiooMs2u4H"
          />

          {location && <LocationMarker coordinates={location} center={centerPos} setCenter={setCenterPos} currentData={currentLocData} setCurrentData={setCurrentLocData} />
          }
        </MapContainer>
        <p className='__paragrapH'>
          <span>Lat: {position.lat}</span>
          <br />
          <span>Lng: {position.lng}</span>
        </p>
        <input type="text" placeholder='enter your query here'
          onChange={(e) =>
            setData(e.target.value)
          } />
        <button onClick={handleClick}>Submit</button>
        <button onClick={() => setCenterPos(true)}> reset</button>

      </main>

    </>
  )
}

export default MapComponent


function LocationMarker({ coordinates, center, setCenter, currentData, setCurrentData }) {
  const map = useMap();

  useEffect(() => {
    center ? flyToCenter() : "";
  }, [coordinates, center])

  const flyToLoc = useCallback(
    (loc) => async () => {
      setCenter(false);
      if (loc) {
        map.flyTo(loc, 12, {
          animate: true,
          duration: 1
        });
        try {
          const ambeeResp = await axios.get(`https://api.ambeedata.com/weather/latest/by-lat-lng?lat=${loc[0]}&lng=${loc[1]}`, {
            headers: {
              'x-api-key': ambeeAPI,
              'Content-type': 'application/json'
            }
          })
          if (ambeeResp.data.message == 'success') {
            console.log(ambeeResp.data.data)
            setCurrentData(ambeeResp.data.data)
          }
        } catch (error) {
          console.log(error);
        }

      }
    },
    [map],
  );

  const flyToCenter = () => {
    if (coordinates.length > 0) {
      let avgLatitude = coordinates.reduce((sum, coord) => sum + coord[0], 0) / coordinates.length;
      let avgLongitude = coordinates.reduce((sum, coord) => sum + coord[1], 0) / coordinates.length;
      // console.log(`Center Coordinates: (${avgLatitude}, ${avgLongitude})`);
      map.flyTo([avgLatitude, avgLongitude], 4, {
        animate: true,
        duration: 1
      })
    }
  }
  return (
    <>
      {coordinates?.map((loc, idx) => (
        <Marker
          key={idx}
          position={loc && [...loc]}
          eventHandlers={{ click: flyToLoc(loc) }}
        >
          <Popup>
            {currentData ? (
              <ul>
                <li> <h4>Last Updated at: </h4> {new Date(currentData.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  second: 'numeric',
                })}</li>
                <li><h4>Temperature(F): </h4> {currentData.temperature}</li>
                <li><h4>Humidity: </h4> {currentData.humidity}</li>
                <li><h4>WindSpeed: </h4> {currentData.windSpeed}</li>
                <li><h4>Summary: </h4> {currentData.summary}</li>
                <li><h4>gptSuggestion: </h4> {currentData.gptSuggestion}</li>
              </ul>
            ) : "not available"}
          </Popup>
        </Marker>
      ))}
    </>
  )
}