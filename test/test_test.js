import { createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import expect from 'expect'

import rootReducer from '../src/reducers'
import { setupWebsocket, joinRace } from '../src/actions'

function mockWebsocket () {

  let self = {
    onmessage: x => x,
    onopen: x => x,
    send,
    receive
  }

  function send(msg) {
    console.log(msg)
  }

  function receive(msg) {
    self.onmessage({data: msg})
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
        true
    )

    store.dispatch(setupWebsocket(socket))
    store.dispatch(joinRace("55"))

    //TODO: how to wait for dispatch w/o using mock store?
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

describe('start game', () => {
  it('should set the game text to what the socket receives', (done) => {
    let socket = mockWebsocket()

    let store = createStore(
      rootReducer,
      applyMiddleware(thunk)
    )

    let unsubscribe = store.subscribe(() =>
        true
    )

    store.dispatch(joinRace("55"))
    store.dispatch(setupWebsocket(socket))

    waitFor(15)
      .then(() => {
        socket.receive("start|ASDFASDF")
        return waitFor(10)
      })
      .then(() => {
        let { text } = store.getState()
        expect(text).toEqual("ASDFASDF")
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
