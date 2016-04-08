import { createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import expect from 'expect'

import rootReducer from '../src/reducers'
import { setupWebsocket, joinRace } from '../src/actions'

function mockWebsocket () {

  let self = {
    onmessage: x => x,
    onopen: x => x,
    send
  }

  function send(msg) {
    console.log(msg)
  }

  setTimeout(() => {
    self.onopen()
  }, 0)

  return self
}

function waitFor(x) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(x), x)
  })
}

describe('join game', () => {
  it('should connect the socket and subscribe to the gameid', (done) => {
    let socket = mockWebsocket()

    let store = createStore(
      rootReducer,
      applyMiddleware(thunk)
    )

    let unsubscribe = store.subscribe(() =>
      //console.log(store.getState())
    )

    store.dispatch(setupWebsocket(socket))
    store.dispatch(joinRace("55"))

    waitFor(15)
    .then(() => {
      const { socket, gameid } = store.getState()
      expect(socket).toEqual(socket)
      expect(gameid).toEqual("55")
    })
    .then(done)
    .catch(done)

  })
})

describe('test test', () => {
  it('mocha should run this', () => {
    expect(1+1).toEqual(2)
  })
})
