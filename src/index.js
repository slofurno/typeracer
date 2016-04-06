import React, { Component, PropTypes } from 'react'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import {createSelector} from 'reselect'
import { Provider, connect } from 'react-redux'
import thunk from 'redux-thunk'
import { render } from 'react-dom'
import request from './request'

function players (state = {}, action) {
  switch (action.type) {
  case "ADD_KEYPRESS":
    let xs = state[action.n.pid] ? state[action.n.pid].concat([action.n]) : [action.n]
    let ok = {}
    ok[action.n.pid] = xs
    return Object.assign({}, state, ok)
  default:
    return state
  }
}

function isConnected (state = false, action) {
  switch (action.type) {
  case "SUCCESSFUL_CONNECT":
    return true
  default:
    return state
  }
}

function startTime (state = 1, action) {
  switch (action.type) {
  case "START_RACE_SUCCESS":
    return action.race.time
  default:
    return state
  }
}

function gameid (state = "", action) {
  switch (action.type) {
  case "CREATE_RACE_SUCCESS":
    return action.id
  default:
    return state
  }
}

function text (state = "asds adasd asdsakj sdfkjsdfkl sdfjsdkjf sdfsd", action) {
  switch (action.type) {
    case "START_RACE_SUCCESS":
      return action.race.text
    default:
      return state
  }
}

function typed (state = [], action) {
  switch (action.type) {
    case "ADD_CHAR":
      return [...state, action.c]
    default:
      return state
  }
}

function addChar (c) {
  return {
    type: "ADD_CHAR",
    c
  }
}

const charmap = {
  186: [";",":"],
  222: ["'","\""],
  188: [",","<"],
  190: [".",">"],
  191: ["/","?"],
  189: ["-","_"],
  187: ["=","+"],
  48: ["0", ")"],

  49: ["1", "!"],
  50: ["2", "@"],
  51: ["3", "#"],
  52: ["4", "$"],
  53: ["5", "%"],
  54: ["6", "^"],
  55: ["7", "&"],
  56: ["8", "*"],
  57: ["9", "("],

  32: [" ", " "]
}

function zip (xs, ys) {
  var r = [];
  var c = Math.min(xs.length, ys.length);
  for (var i = 0; i < c; i++) {
    r.push([xs[i], ys[i]]);
  }
  return r;
}

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

function maybeAddChar (e) {
  let keycode = e.keyCode
  let isShifted = e.shiftKey
  let c = ""
  tevs.push(e.keyCode)
  return (dispatch) => {
    let keycode = e.keyCode
    if (keycode >= 65 && keycode <= 90) {
      if (!isShifted) { keycode += 32 }
      c = String.fromCharCode(keycode)
    } else if (charmap[keycode]) {
      let idx = 0
      if (isShifted) {idx = 1}
      c = charmap[keycode][idx]
    } else {
      return
    }

    dispatch(broadcastKeypress(c))
    dispatch(addChar(c))
  }
}

function parse({data}) {
  return JSON.parse(data);
}

function getTextSuccess(text) {
  return {
    type: "GET_TEXT_SUCCESS",
    text
  }
}

function getText(id) {
  return (dispatch) => {
    return request({
      method: "GET",
      url: `/api/text/${id}`
    })
    .then(x => x.data)
    .then(x => dispatch(getTextSuccess(x)))
    .catch(console.error)

  }
}

function setRace(id) {
  return {
    type: "CREATE_RACE_SUCCESS",
    id
  }
}

function createRaceSuccess(id) {
  return (dispatch) => {
    dispatch(setRace(id))
    dispatch(joinRace(id))
  }
}

function broadcastKeypress(c) {
  return (dispatch, getState) => {
    const {isConnected, startTime, typed, gameid} = getState()
    if (!isConnected) return

    let i = typed.length
    let t = Date.now() - startTime
    cast(gameid, `${i}|${t}|${c}`)
  }
}

function createRace() {
	return (dispatch) => {
    return request({
      method: 'POST',
      url: '/api/race'
    })
    .then(x => dispatch(createRaceSuccess(x)))
    .catch(console.error)
  }
}

function startRace() {
  return (dispatch, getState) => {
    const {gameid} = getState()
    return request({
      method: 'POST',
      url: `/api/race/${gameid}`
    })
  }
}

function setInput (input) {
  return {
    type: "SET_INPUT",
    input
  }
}

const rootReducer = combineReducers({
  typed,
  text,
  gameid,
  startTime,
  isConnected,
  players
})


class _app extends Component {
  render () {

    const {
      stats,
      prevText,
      nextText,
      gameid,
      racers,
      startTime,
      lastInput,
      currentChar,
      maybeAddChar,
      createRace,
      startRace,
    } = this.props

    console.log(stats)

    let tevs = zip(lastInput, prevText).map(([a,b]) => {
      if (a === b) {
        return (<div className="flex char correct">{b}</div>)
      } else {
        return (<div className="flex char incorrect">{a}</div>)
      }
    })

    return (
      <div>
        <div className = "flex container justify-center">
          {tevs}
          <div className="flex char highlight">{currentChar}</div>
          {nextText.map(x => <div className="flex char">{x}</div>)}
        </div>

        <input type="text" onKeyDown={maybeAddChar}/>
        <input type="button" onClick={createRace} value="create a typerace"/>
        <input type="button" onClick={startRace} value="start typerace"/>
        <div>{`${location.origin}/?game=${gameid}`} </div>
        <div style = {{
          backgroundColor: "whitesmoke",
          padding: "20px",
          fontSize: "2em"
        }}>
          <div>{`${stats.apm} apm`}</div>
          <div>{`${100 * stats.accuracy}% correct`}</div>
        </div>

        <div style = {{
          backgroundColor: "lightskyblue",
          padding: "20px",
          fontSize: "2em"
        }}>
        {racers.map(({pid, apm, accuracy}) => <div key={pid}>{`${pid} ${60000*apm}apm ${100*accuracy}%`}</div>)}
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    maybeAddChar: e => dispatch(maybeAddChar(e)),
    setInput: input => dispatch(setInput(input)),
    createRace: e => dispatch(createRace()),
    startRace: () => dispatch(startRace()),
  }
}

const rawTyped = state => state.typed
const rawGameid = state => state.gameid
const rawText = state => [].slice.call(state.text)
const rawStartTime = state => state.startTime
const rawConnected = state => state.isConnected
const rawPlayers = state => state.players

const pad = ["","","","","","","","","","","","","","","","","","","",""]

const lastInput = createSelector(
  rawTyped,
  (typed) => {
    let xs = typed.slice(-20)
    return [...pad, ...xs].slice(-20)
  }
)

const prevText = createSelector(
  rawTyped,
  rawText,
  (typed, text) => {
    let p = typed.length
    let min = Math.max(p - 20, 0)
    return [...pad, ...text.slice(min, p)].slice(-20)
  }
)

const nextText = createSelector(
  rawTyped,
  rawText,
  (typed, text) => {
    let p = typed.length
    return [...text.slice(p + 1, p + 21), ...pad].slice(0, 20)
  }
)

const currentChar = createSelector(
  rawTyped,
  rawText,
  (typed, text) => {
    let p = typed.length
    return text[p] || ""
  }
)

function makeStats (typed, dt, text) {
  let apm = typed.length/dt
  let max = Math.min(typed.length, text.length)
  let ok = 0
  for (var i = 0; i < max; i++) {
    if (text[i] === typed[i]) ok++
  }
  let accuracy = ok/max

  return {
    apm,
    accuracy
  }
}

const stats = createSelector(
  rawTyped,
  rawStartTime,
  rawText,
  (typed, start, text) => {
    let dt = (Date.now() - start)/60000
    return makeStats(typed, dt, text)
  }
)

function aggregateStats(player) {
  let typed = player.map(({ch}) => ch)
  let last = player.slice(-1)[0]
  let dt = last ? last.t : 1
  let pid = last.pid
  return {typed, dt, pid}
}

const racers = createSelector(
  rawPlayers,
  rawStartTime,
  rawText,
  (players, start, text) => {
    let ps = Object.keys(players).map(x => players[x]).map(aggregateStats)
    return ps.map(({dt, typed, pid}) => {
      return Object.assign({}, makeStats(typed, dt, text), {pid})
    })
  }
)

let store = createStore(
  rootReducer,
  applyMiddleware(thunk)
)

let unsubscribe = store.subscribe(() =>
  console.log(store.getState())
)

let qs = mapQueryString(location.search.slice(1))
let ws = new WebSocket("ws://" + location.host + "/ws")

ws.onmessage = websocket
ws.onopen = () => {
  store.dispatch({
    type: "SUCCESSFUL_CONNECT"
  })
  store.dispatch(createRaceSuccess(qs["game"] || ""))
}

function joinRace() {
  return (dispatch, getState) => {
    const {gameid} = getState()
    if (gameid) subr(gameid)
  }
}

function cast(topic, text) {
  ws.send(JSON.stringify({type:"cast",topic,text}))
}

function subr(topic) {
  console.log("sub", topic);
  ws.send(JSON.stringify({type:"subscribe",topic}))
}

function startRaceSuccess (race) {
  return {
    type: "START_RACE_SUCCESS",
    race
  }
}

function addKeypress (n) {
  return {
    type: "ADD_KEYPRESS",
    n
  }
}

function websocket ({data}) {
  let c = data.split("|")
  switch (c[0]) {
  case "start":
    store.dispatch(startRaceSuccess({
      time: Date.now(),
      text: c[1],
    }))
  break
  case "keypress":
    let [e, pid, i, t, ch] = c
    store.dispatch(addKeypress({
      pid, i, t, ch
    }))

  break
  default:
    console.log(c)

  }
}

const selector = createSelector(
  currentChar,
  prevText,
  nextText,
  lastInput,
  rawGameid,
  rawStartTime,
  stats,
  rawConnected,
  racers,
  (currentChar, prevText, nextText, lastInput, gameid, startTime, stats, isConnected, racers) => {
    return {
      currentChar,
      prevText,
      nextText,
      lastInput,
      gameid,
      startTime,
      stats,
      isConnected,
      racers
    }
  }
)

let App = connect(selector, mapDispatchToProps)(_app)

render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('root')
)
