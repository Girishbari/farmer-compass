import { useRef, useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import LocationMarker from './LocationMarker'

import '../App.css'
import 'leaflet/dist/leaflet.css'

import ReactMarkdown from 'react-markdown'
import OpenAI from 'openai'





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
  const [open, setOpen] = useState(false)
  const [currentLocData, setCurrentLocData] = useState();
  const popup = useRef(null);




  return (
    <>
      <main className='__main_container'>
        <MapContainer center={center} zoom={5} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=YwJfI3tmNFKiooMs2u4H"
          />
          {location &&
            <LocationMarker coordinates={location} currentData={currentLocData} setCurrentData={setCurrentLocData} />
          }


          {
            open && (
              <div ref={popup} className={`__gpt_suggestion_popup ${open ? '__gpt_suggestion_popup' : '__gpt_suggestion_popup_close'}`}>
                <h3 className='__gpt_heading'>Details</h3>
                <p>
                  {
                    currentLocData?.gptSuggestion
                  }
                </p>
              </div>
            )
          }
        </MapContainer>
        <div className='__content_container'>
          <h3 className='__gpt_heading'>Details</h3>

          <ReactMarkdown>
            {
              currentLocData?.gptSuggestion ? currentLocData.gptSuggestion : 'select a marker for GPT suggestion'
            }
          </ReactMarkdown>


        </div>
      </main>
    </>
  )
}

export default MapComponent


