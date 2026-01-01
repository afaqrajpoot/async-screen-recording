# Async Screen Recording Project

A real-time voice recording and translation application that captures speech, transcribes it, and translates it to Spanish using Web Speech API and Socket.io.

## 🚀 Project Setup

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend/my-assessment
   ```

2. Install dependencies:
   ```bash
   npm i
   ```

3. Start the development server:
   ```bash
   npm start
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm i
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## ⚠️ Trade-offs & Known Issues

### 1. Speech Recognition Stop Behavior
**Issue**: Speech recognition continues to work even after hitting the stop button.

**Root Cause**: 
- The `stopRecording` function sets `recognitionRef.current = null` but doesn't properly call `stop()` on the recognition instance
- The `onend` handler automatically restarts recognition if `isRecording` is still true, creating a race condition

**Potential Solutions**:
- Properly call `recognition.stop()` before setting the ref to null
- Add a flag to prevent auto-restart when stopping manually
- Clear the recognition instance more thoroughly

### 2. Architecture Decisions

#### Socket.io vs Direct REST API
**Current**: Using Socket.io for real-time bidirectional communication

**Trade-offs**:
- ✅ **Pros**: Real-time updates, persistent connection, event-driven architecture
- ❌ **Cons**: More complex setup, requires WebSocket support, additional server resources

**Alternative**: Direct REST API calls
- ✅ **Pros**: Simpler implementation, stateless, easier to scale horizontally
- ❌ **Cons**: Polling required for real-time updates, more HTTP overhead

#### Socket.io vs Pub/Sub Service
**Current**: Using Socket.io server for message distribution

**Trade-offs**:
- ✅ **Pros**: Built-in connection management, automatic reconnection, low latency
- ❌ **Cons**: Single server bottleneck, harder to scale across multiple instances

**Alternative**: Pub/Sub Service (Redis Pub/Sub, Google Cloud Pub/Sub, etc.)
- ✅ **Pros**: Better horizontal scaling, decoupled architecture, message persistence
- ❌ **Cons**: Additional infrastructure, more complex setup, potential latency

### 3. Translation API Limitations
**Current**: Using MyMemory Translation API (free tier)

**Trade-offs**:
- ✅ **Pros**: Free, no API key required, simple integration
- ❌ **Cons**: Rate limits, lower translation quality, no SLA, potential downtime

**Alternative**: Professional translation APIs (Google Translate, DeepL, Azure Translator)
- ✅ **Pros**: Higher quality, better reliability, SLA guarantees
- ❌ **Cons**: Cost, API key management required

### 4. Security Concerns
- **CORS Configuration**: Currently set to `origin: "*"` which allows all origins
  - **Risk**: Security vulnerability, allows any website to make requests
  - **Solution**: Restrict to specific frontend origins in production

### 5. Error Handling & Resilience
- **No Retry Mechanism**: If socket disconnects during translation, pending translations are lost
- **No Cleanup**: Pending translations remain in state if connection is lost
- **Browser Compatibility**: Web Speech API not supported in all browsers (Safari, older browsers)

### 6. State Management
- **Local State Only**: No persistence of translations
- **No Offline Support**: Requires active connection to backend
- **Memory Leaks**: Potential issues with recognition instance cleanup

## 🔧 Future Improvements

1. Implement proper speech recognition cleanup
2. Add retry mechanism for failed translations
3. Restrict CORS to specific origins
4. Add translation history persistence
5. Implement error boundaries and better error handling
6. Add support for multiple target languages
7. Consider migrating to a more robust translation service
8. Add unit and integration tests
9. Implement proper logging and monitoring
