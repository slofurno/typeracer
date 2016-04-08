import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import selector from '../selectors'
import {
  maybeAddChar,
  setInput,
  createRace,
  requestStartRace
} from '../actions'

function zip (xs, ys) {
  var r = [];
  var c = Math.min(xs.length, ys.length);
  for (var i = 0; i < c; i++) {
    r.push([xs[i], ys[i]]);
  }
  return r;
}


const mapDispatchToProps = dispatch => {
  return {
    maybeAddChar: e => dispatch(maybeAddChar(e)),
    setInput: input => dispatch(setInput(input)),
    createRace: e => dispatch(createRace()),
    startRace: () => dispatch(requestStartRace()),
  }
}

class app extends Component {
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


export default connect(selector, mapDispatchToProps)(app)
