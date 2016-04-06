import React, { Component, PropTypes } from 'react'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import {createSelector} from 'reselect'
import { Provider, connect } from 'react-redux'
import thunk from 'redux-thunk'
import { render } from 'react-dom'
import request from './request'

//let ws = new WebSocket("ws://" + location.host + "/ws")
//ws.onmessage = e => console.log(e.data)

//const cast = x => ws.send(JSON.stringify({type:"cast",topic:"steve",text:"HEY"}))
//const subr = x => ws.send(JSON.stringify({type:"subscribe",topic:"steve"}))

function text (state = "", action) {
  return [].slice.call("let's type some text and do something with it cause fuck you")
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

function maybeAddChar (e) {
  let keycode = e.keyCode
  let isShifted = e.shiftKey
  let c = ""
  console.log(keycode)
  tevs.push(e.keyCode)
  return dispatch => {
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

    console.log(c)
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

function setInput (input) {
  return {
    type: "SET_INPUT",
    input
  }
}

const rootReducer = combineReducers({
  typed,
  text
})


class _app extends Component {
  render () {

    const { prevText, nextText, lastInput, currentChar, maybeAddChar } = this.props

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
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    maybeAddChar: e => dispatch(maybeAddChar(e)),
    setInput: input => dispatch(setInput(input))
  }
}

const rawTyped = state => state.typed
const rawText = state => state.text
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
    console.log(typed, text)
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


let store = createStore(
  rootReducer,
  applyMiddleware(thunk)
)

let unsubscribe = store.subscribe(() =>
  console.log(store.getState())
)

const selector = createSelector(
  currentChar,
  prevText,
  nextText,
  lastInput,
  (currentChar, prevText, nextText, lastInput) => {
    return {currentChar, prevText, nextText, lastInput}
  }
)

let App = connect(selector, mapDispatchToProps)(_app)

render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('root')
)
