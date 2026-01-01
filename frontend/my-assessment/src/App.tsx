import './App.css'
import VoiceRecorder from './components/VoiceRecorder'

function App() {

  return (
    <div>
      <div>
        <h1>Voice Translation App</h1>
        <p>Translate your voice to text and get the translation in real-time</p>
        {/* Voice Recorder Component */}
        <VoiceRecorder />


      </div>

    </div>
  )
}

export default App
