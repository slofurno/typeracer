import {createSelector} from 'reselect'

const rawTyped = state => state.typed
const rawGameid = state => state.gameid
const rawText = state => [].slice.call(state.text)
const rawStartTime = state => state.startTime
const rawConnected = state => state.isConnected
const rawPlayers = state => state.players
const rawSocket = state => state.socket

const pad = [].slice.call(".................................................................").map(x => "")
console.log("pad:", pad.length)
//const pad = ["","","","","","","","","","","","","","","","","","","",""]
const NCHARS = 20

const lastInput = createSelector(
  rawTyped,
  (typed) => {
    let xs = typed.slice(-NCHARS)
    return [...pad, ...xs].slice(-NCHARS)
  }
)

const prevText = createSelector(
  rawTyped,
  rawText,
  (typed, text) => {
    let p = typed.length
    let min = Math.max(p - NCHARS, 0)
    return [...pad, ...text.slice(min, p)].slice(-NCHARS)
  }
)

const nextText = createSelector(
  rawTyped,
  rawText,
  (typed, text) => {
    let p = typed.length + 1
    return [...text.slice(p, p + NCHARS), ...pad].slice(0, NCHARS)
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
      return Object.assign({}, makeStats(typed, dt, text), {pid, percent: typed.length/text.length})
    })
  }
)

const selector = createSelector(
  currentChar, prevText, nextText, lastInput, rawGameid,
  rawStartTime, stats, rawConnected, racers, rawSocket,
  rawText, rawTyped,
  (currentChar, prevText, nextText, lastInput, gameid,
   startTime, stats, isConnected, racers, socket, text, typed) => {
    return {
      currentChar,
      prevText,
      nextText,
      lastInput,
      gameid,
      startTime,
      stats,
      isConnected,
      racers,
      text,
      typed
    }
  }
)

export default selector
