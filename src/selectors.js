import {createSelector} from 'reselect'

const rawTyped = state => state.typed
const rawGameid = state => state.gameid
const rawText = state => [].slice.call(state.text)
const rawStartTime = state => state.startTime
const rawConnected = state => state.isConnected
const rawPlayers = state => state.players
const rawSocket = state => state.socket

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

const selector = createSelector(
  currentChar, prevText, nextText, lastInput, rawGameid,
  rawStartTime, stats, rawConnected, racers, rawSocket,
  (currentChar, prevText, nextText, lastInput, gameid,
   startTime, stats, isConnected, racers, socket) => {
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

export default selector
