import { Marker, Popup, useMap } from 'react-leaflet'
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import OpenAI from 'openai'

const ambeeAPI = "9f053bd16c211d191b63df34dc04ee059214824e7535facf391c36a86bc0f38b"
const openAI = new OpenAI({
  apiKey: import.meta.env.VITE_openAIkey,
  dangerouslyAllowBrowser: true
})

export default function LocationMarker({ currentData, setCurrentData }) {
  const map = useMap();

  const [center, setCenter] = useState(true);
  const [location, setLocation] = useState([])
  const [data, setData] = useState(null);
  const [crop, setCrop] = useState('');


  useEffect(() => {
    center ? flyToCenter() : "";
    console.log(crop);
  }, [location, center])


  const handleClick = async () => {
    setCenter(true)
    try {
      const prompt = `your a agriculture expert you know which places grows which crop in India only so you only return in JSON of all coordinates keys with a value in this format [31.1048, 77.1734], then a title of the location with the a title key (make sure there are more than 1 coordinates)`
      const resp = await openAI.chat.completions.create({
        messages: [{ role: 'system', content: prompt }, { role: 'user', content: data }],
        model: 'gpt-3.5-turbo-0125',
        response_format: { type: "json_object" },

      })
      setCrop(data)
      const generatedResponse = JSON.parse(resp.choices[0].message.content);
      console.log(generatedResponse)
      setLocation(generatedResponse.coordinates)
    } catch (error) {
      console.log(error)
    }
  }

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
            console.log(data);
            setCurrentData(ambeeResp.data.data)
            fetchGPTSuggestion(ambeeResp.data.data)
          }
        } catch (error) {
          console.log(error);
        }

      }
    },
    [map],
  );

  const fetchGPTSuggestion = async (locWeather) => {
    console.log(crop);
    try {
      const prompt = `${locWeather} is the current climate of place ${locWeather.lat, locWeather.lng}, please give some suggestion for farming of given crop only`
      const gptResponse = await openAI.chat.completions.create({
        messages: [{ role: 'system', content: prompt }, { role: 'user', content: crop }],
        model: 'gpt-3.5-turbo-0125',
        temperature: 0.3
      })
      console.log(gptResponse.choices[0].message.content)
      setCurrentData((prev) => {
        return {
          ...prev,
          gptSuggestion: gptResponse.choices[0].message.content
        }
      })
    } catch (error) {
      console.log(error);
    }
  }

  const flyToCenter = () => {
    if (location.length > 0) {
      let avgLatitude = location.reduce((sum, coord) => sum + coord[0], 0) / location.length;
      let avgLongitude = location.reduce((sum, coord) => sum + coord[1], 0) / location.length;
      // console.log(`Center Coordinates: (${avgLatitude}, ${avgLongitude})`);
      map.flyTo([avgLatitude, avgLongitude], 4, {
        animate: true,
        duration: 1
      })
    }
  }
  return (
    <>
      {location?.map((loc, idx) => (
        <Marker
          key={idx}
          position={loc && [...loc]}
          eventHandlers={{ click: flyToLoc(loc) }}
        >
          <Popup >
            {currentData ? (
              <ul className='ul__'>
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
                {/*                 <li><h4>gptSuggestion: </h4> {currentData.gptSuggestion}</li>
 */}
              </ul>
            ) : "not available"}
          </Popup>
        </Marker>
      ))}

      <div className='input__div'>
        <input type="text" placeholder='enter your query here'
          onChange={(e) =>
            setData(e.target.value)
          } />
        <div className='btn_con'>
          <button className='submit_button' onClick={handleClick}>Submit</button>
          <button onClick={() => setCenter(true)}> reset Map</button>
        </div>
      </div>
    </>
  )
}