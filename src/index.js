import React, { Component, PropTypes } from 'react'
import { createStore, applyMiddleware} from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import { render } from 'react-dom'
import request from './request'

import { mapQueryString } from './utils'
import { setupWebsocket, joinRace } from './actions'
import rootReducer from './reducers'
import App from './components/app'

let store = createStore(
  rootReducer,
  applyMiddleware(thunk)
)

let unsubscribe = store.subscribe(() => console.log(store.getState()))

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
