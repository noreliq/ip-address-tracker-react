import './App.scss';
import Form from './Form';
import {useState, useCallback, useEffect, useRef} from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {findLocation} from '../api'


function getParamsForQuery(query){
  const reg = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/
  if(reg.test(query)){
    return {ip: query}
  }
  return {domain: query}

}


function App() {

  const [map, setMap] = useState()
  const [placeholder, setPlaceholder] = useState()
  const [invalid, setInvalid] = useState(false)
  const [data, setData] = useState()  
  const [query, setQuery] = useState()
  const [loading, setLoading] = useState(true)

  // Once on start, use user's IP
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const data =  await findLocation({autoIp:true})
      if(data && !data.code) setData(data)
      setLoading(false)
    }
    
    
    loadData()
  }, [])

  
  // Callback when non-blank query string submitted from form
  const onSubmit = useCallback((value) => setQuery(value), [])

  // When query changes, fetch data again
  useEffect(() => {
    if(!query) return;

    const params = getParamsForQuery(query)
    if(params){
      const loadData = async () => {
        setLoading(true)
        const data =  await findLocation(params)
        if(data && !data.code) {
          setData(data)
          setInvalid(false)
        } else {
          setInvalid(true)
        }
        setLoading(false)
      }
    
      loadData()
    }

  }, [query])
  


  // Callback when window changes size to change placeholder text to be shorter
  // if on small screens
  const onWinResize = useCallback(() => setPlaceholder(window.innerWidth > 500 ? "Search for any IP address or domain" : "IP or domain"), [])

  useEffect(() => {
    onWinResize()
    window.addEventListener("resize", onWinResize)
    return () => {
      window.removeEventListener("resize", onWinResize)
    }
  }, [])


  // The map does not update when props update, we need to use the reference and call things on it directly
  useEffect(() => {
    if(map && data && data.location){
      map.flyTo([data.location.lat, data.location.lng], 17, {animate: true, duration: 1.5})
    }
  }, [map, data])
  


  return (
    <main className="app">
      <div className="app__top-wrap">
        <section className="app__header">
          <h1>IP Address Tracker</h1>  
          <Form placeholder={placeholder} onSubmit={onSubmit} invalid={invalid} />
        </section>
        {data && <section className="app__info">
          <div className="app__info-item app__info-item--ip">
            <h4>IP Address</h4>
            <p>{data.ip}</p>
          </div>
          <div className="app__info-item app__info-item--loc">
            <h4>Location</h4>
            <p>{data.location.city}, {data.location.region}{data.location.postalCode && `, ${data.location.postalCode}`}</p>
          </div>
          <div className="app__info-item app__info-item--time">
            <h4>Timezone</h4>
            <p>UTC{data.location.timezone}</p>
          </div>
          <div className="app__info-item app__info-item--isp">
            <h4>ISP</h4>
            <p>{data.isp}</p>
          </div>
        </section>}
      </div>
      {data && <MapContainer whenCreated={ map => setMap(map)} className="app__map" center={[0, 0]} zoom={17} scrollWheelZoom={true} zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[data.location.lat, data.location.lng]} icon={L.icon({iconUrl:'./icon-location.svg'})} />
      </MapContainer>}
      {loading && <div className="lds-dual-ring"></div>}
    </main>
  );
}

export default App;
