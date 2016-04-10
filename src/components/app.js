import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import selector from '../selectors'
import { zip } from '../utils'
import {
  maybeAddChar,
  setInput,
  createRace,
  requestStartRace
} from '../actions'

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
      text,
      typed
    } = this.props

    let tevs = zip(lastInput, prevText).map(([a,b]) => {
      if (a === b) {
        return (<div className="flex char correct">{b}</div>)
      } else {
        return (<div className="flex char incorrect">{a}</div>)
      }
    })
  /*
    let tevs = dzip(typed, text).map(([a,b], i) => {
      if (i === j) {
        return <div className="flex char highlight">{b}</div>
      } else if (a === b) {
        return (<div className="flex char correct">{b}</div>)
      } else {
        return (<div className="flex char incorrect">{a}</div>)
      }
    })
    */


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
        <div style = {{
          backgroundColor: "lightskyblue",
          padding: "10px",
          fontSize: "1.4em" 
        }}>{`${location.origin}/?game=${gameid}`} </div>
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
        { racers.map(({pid, apm, accuracy, percent}) =>
            <div key={pid}>
              <div>{`${60000*apm|0} apm    ${(100*accuracy)|0}% accuracy`}</div>
              <div style = {{ width: `${(100*percent)|0}%`, backgroundColor: "red", height: "10px"}}></div>
            </div>
            )}
        </div>
      </div>
    )
  }
}


export default connect(selector, mapDispatchToProps)(app)
