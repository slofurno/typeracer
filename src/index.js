import React, { Component, PropTypes } from 'react'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import {createSelector} from 'reselect'
import { Provider, connect } from 'react-redux'
import thunk from 'redux-thunk'
import { render } from 'react-dom'


function text (state = "", action) {
  return [].slice.call("let's type some text and do something with it cause fuck you")
}

function typed (state = [], action) {
  switch (action.type) {
    case "ADD_CHAR":
      return [...state, action.char]
    default:
      return state
  }
}

function addChar (x) {
  return {
    type: "ADD_CHAR",
    char: x
  }
}

function maybeAddChar (e) {
  return dispatch => {
    let keycode = e.keyCode
    if (keycode < 32 || keycode > 122) {
      return
    }

    if (!e.shiftKey) {
      keycode += 32
    }
    dispatch(addChar(String.fromCharCode(keycode)))
  }
}

const rootReducer = combineReducers({
  typed,
  text
})

class _app extends Component {
  render () {

    const { visibleText, maybeAddChar } = this.props
    return (
      <div>
        <h2>{visibleText.join("")}</h2>
        <input type="text" onKeyDown={maybeAddChar}/>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    maybeAddChar: e => dispatch(maybeAddChar(e))
  }
}

const rawTyped = state => state.typed
const rawText = state => state.text
const ten = ["","","","","","","","","",""]

const prevText = createSelector(
  rawTyped,
  rawText,
  (typed, text) => {
    console.log(typed, text)
    let p = typed.length
    let min = Math.max(p - 10, 0)
    return [...ten, ...text.slice(min, p)].slice(-10)
  }
)

const nextText = createSelector(
  rawTyped,
  rawText,
  (typed, text) => {

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
  visibleText,
  (visibleText) => {
    return {visibleText}
  }
)

let App = connect(selector, mapDispatchToProps)(_app)

render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('root')
)
