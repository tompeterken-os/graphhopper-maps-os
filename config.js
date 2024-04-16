/**
 * Webpack will replace this file with config-local.js if it exists
 */
const config = {
    // the url of the GraphHopper routing backend, either use graphhopper.com or point it to your own GH instance
    routingApi: 'https://graphhopper.com/api/1/',
    // the url of the geocoding backend, either use graphhopper.com or point it to another geocoding service. use an empty string to disable the address search
    geocodingApi: '',
    // the tile layer used by default, see MapOptionsStore.ts for all options
    defaultTiles: 'Ordnance Survey Light',
    // various api keys used for the GH backend and the different tile providers
    keys: {
        graphhopper: 'bfb9d728-3732-4542-9e92-f638ac1c9f3a',
        maptiler: 'missing_api_key',
        omniscale: 'missing_api_key',
        thunderforest: 'missing_api_key',
        kurviger: 'missing_api_key',
        ordnancesurvey: 'LtYJq12RX8nMZWHt1ADf3EAc2LdBiZX6',
    },
    // if true there will be an option to enable the GraphHopper routing graph and the urban density visualization in the layers menu
    routingGraphLayerAllowed: true,
    // parameters used for the routing request generation
    request: {
        details: [
            'road_class',
            'road_environment',
            'surface',
            'max_speed',
            'average_speed',
            'toll',
            'track_type',
            'country',
        ],
        snapPreventions: ['ferry'],
    },

    // Use 'profiles' to define which profiles are visible and how. Useful if the /info endpoint contains too many or too "ugly" profile
    // names or in the wrong order. The key of each profile will be used as name and the given fields will overwrite the fields of the
    // default routing request. The following example is tuned towards the GraphHopper Directions API. If you have an own server you might want to adapt it.
    //
    // profiles: {
    //    car:{}, small_truck:{}, truck:{}, scooter:{},
    //    foot:{ details: ['foot_network'] }, hike:{ details: ['foot_network'] },
    //    bike:{ details: ['get_off_bike', 'bike_network'] }, mtb:{ details: ['get_off_bike', 'bike_network'] }, racingbike:{ details: ['get_off_bike', 'bike_network'] },
    // }
    //
    // E.g. the 'bike' entry will add a "bike" profile for which we send a request with the specified 'details' parameter. You can even change the profile itself when you specify
    // bike: { profile: 'raw_bike', ... }
}

// this is needed for jest (with our current setup at least)
if (module) module.exports = config
