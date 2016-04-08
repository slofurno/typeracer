import React, { Component, PropTypes } from 'react'
import { createStore, applyMiddleware} from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import { render } from 'react-dom'
import request from './request'

import { setupWebsocket, joinRace } from './actions'
import rootReducer from './reducers'

let store = createStore(
  rootReducer,
  applyMiddleware(thunk)
)

let unsubscribe = store.subscribe(() =>
  console.log(store.getState())
)

let tevs = []

function mapQueryString(s){
      return s.split('&')
  .map(function(kvp){
        return kvp.split('=');
  }).reduce(function(sum,current){
        var key = current[0];
        var value = current[1];
        sum[key] = value;
        return sum;
  },{});
}

let qs = mapQueryString(location.search.slice(1))
let ws = new WebSocket("ws://" + location.host + "/ws")
store.dispatch(setupWebsocket(ws))

let gameid = qs["game"]
if (gameid) {
  store.dispatch(joinRace(gameid))
}

render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('root')
)
