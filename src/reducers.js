import {combineReducers} from 'redux'

function socket (state = null, action) {
  switch (action.type) {
  case "SET_SOCKET":
    return action.socket
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
  case "SET_SOCKET":
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
  case "SET_RACE_ID":
    return action.id
  default:
    return state
  }
}


const rootReducer = combineReducers({
  typed,
  text,
  gameid,
  startTime,
  isConnected,
  players,
  socket
})

export default rootReducer
