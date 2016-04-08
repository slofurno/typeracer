import request from './request'

function setSocket (socket) {
  return {
    type: "SET_SOCKET",
    socket
  }
}

export function setupWebsocket (socket) {
  return function(dispatch, getState) {
    socket.onmessage = ({data}) => dispatch(handleWebsocket(data))
    socket.onopen = () => {
      dispatch(setSocket(socket))
      const { gameid } = getState()
      //TODO: doesn't really matter, but this means we reset gameid
      if (gameid) dispatch(joinRace(gameid))
    }
  }
}

export function joinRace(race) {
  return (dispatch, getState) => {
    dispatch(setRace(race))
    const { socket } = getState()
    if (!socket) return

    socket.send(JSON.stringify({type:"subscribe", topic: race}))
  }
}

function cast(topic, text) {
  return (dispatch, getState) => {
    const { socket } = getState()
    socket.send(JSON.stringify({type:"cast",topic,text}))
  }
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

function handleWebsocket (data) {
  return (dispatch) => {
    let c = data.split("|")
    switch (c[0]) {
    case "start":
      dispatch(startRaceSuccess({time: Date.now(), text: c[1]}))
    break
    case "keypress":
      let [e, pid, i, t, ch] = c
      dispatch(addKeypress({pid, i, t, ch}))
    break
    default:
      console.log(c)
    }
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

function addChar (c) {
  return {
    type: "ADD_CHAR",
    c
  }
}


export function maybeAddChar (e) {
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
    type: "SET_RACE_ID",
    id
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

export function createRace() {
	return (dispatch) => {
    return request({
      method: 'POST',
      url: '/api/race'
    })
    .then(x => dispatch(joinRace(x)))
    .catch(console.error)
  }
}

export function requestStartRace() {
  return (dispatch, getState) => {
    const {gameid} = getState()
    return request({
      method: 'POST',
      url: `/api/race/${gameid}`
    })
  }
}

export function setInput (input) {
  return {
    type: "SET_INPUT",
    input
  }
}

