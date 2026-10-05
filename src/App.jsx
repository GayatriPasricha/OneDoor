import { useCallback, useEffect, useRef, useState } from 'react'
import Header from './components/Header'
import Intake from './screens/Intake'
import Analysis from './screens/Analysis'
import Recommendation from './screens/Recommendation'
import Consent from './screens/Consent'
import Confirmation from './screens/Confirmation'
import Crisis from './screens/Crisis'
import Requests from './screens/Requests'
import { analyse as runTriage } from './lib/analyse'
import { detectCrisis } from './lib/keywordTriage'
import { createRequest, loadRequests, saveRequests } from './lib/storage'

export default function App() {
  const [screen, setScreen] = useState('intake')
  const [text, setText] = useState('')
  const [hints, setHints] = useState([])
  const [result, setResult] = useState(null)
  const [crisis, setCrisis] = useState(false) // local safety gate — the only input to crisis routing
  const [serviceId, setServiceId] = useState(null)
  const [consent, setConsent] = useState(null)
  const [request, setRequest] = useState(null)
  const [requests, setRequests] = useState(loadRequests)
  const headingRef = useRef(null)
  const runId = useRef(0) // ignores triage results from an abandoned flow

  // Each screen change: back to top, focus the new heading for screen readers.
  useEffect(() => {
    window.scrollTo({ top: 0 })
    headingRef.current?.focus({ preventScroll: true })
  }, [screen])

  const reset = () => {
    runId.current++
    setText('')
    setHints([])
    setResult(null)
    setCrisis(false)
    setServiceId(null)
    setConsent(null)
    setRequest(null)
    setScreen('intake')
  }

  const analyse = async () => {
    const id = ++runId.current
    setResult(null)
    setCrisis(detectCrisis(text))
    setScreen('analysis')
    const r = await runTriage(text, hints)
    if (id !== runId.current) return
    setResult(r)
    setServiceId(r.recommendedService)
  }

  const finishAnalysis = useCallback(() => {
    setScreen((s) => (s === 'analysis' ? (crisis ? 'crisis' : 'recommendation') : s))
  }, [crisis])

  const submit = () => {
    const req = createRequest({ result, serviceId, consent, requests })
    const all = [...requests, req]
    setRequests(all)
    saveRequests(all)
    setRequest(req)
    setScreen('confirmation')
  }

  const props = { headingRef }

  return (
    <>
      <Header
        onHome={reset}
        onRequests={() => setScreen('requests')}
        count={requests.length}
      />
      <main className="main" key={screen}>
        {screen === 'intake' && (
          <Intake {...props} text={text} setText={setText} hints={hints} setHints={setHints} onSubmit={analyse} />
        )}
        {screen === 'analysis' && <Analysis {...props} crisis={crisis} ready={!!result} onDone={finishAnalysis} />}
        {screen === 'recommendation' && (
          <Recommendation {...props} result={result} serviceId={serviceId} setServiceId={setServiceId} onContinue={() => setScreen('consent')} />
        )}
        {screen === 'consent' && (
          <Consent {...props} result={result} serviceId={serviceId} consent={consent} setConsent={setConsent} onContinue={submit} />
        )}
        {screen === 'confirmation' && (
          <Confirmation {...props} request={request} onViewRequests={() => setScreen('requests')} />
        )}
        {screen === 'crisis' && <Crisis {...props} />}
        {screen === 'requests' && <Requests {...props} requests={requests} onStart={reset} />}
      </main>
    </>
  )
}
