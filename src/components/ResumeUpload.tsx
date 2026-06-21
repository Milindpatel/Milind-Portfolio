import { useState, useRef } from 'react'

type Status = 'idle' | 'uploading' | 'done' | 'error'

export default function ResumeUpload() {
  const [open, setOpen]       = useState(false)
  const [dragging, setDragging] = useState(false)
  const [status, setStatus]   = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function upload(file: File) {
    if (!/\.(pdf|docx)$/i.test(file.name)) {
      setStatus('error'); setMessage('Only PDF or DOCX files are supported.')
      return
    }
    setStatus('uploading'); setMessage('Parsing resume…')
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1]
        const res = await fetch('/_upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, data: base64 }),
        })
        if (res.ok) {
          setStatus('done'); setMessage('Portfolio updated! Refresh to see changes.')
        } else {
          const { error } = await res.json() as { error: string }
          setStatus('error'); setMessage(error ?? 'Upload failed.')
        }
      } catch {
        setStatus('error'); setMessage('Network error.')
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => { setOpen(o => !o); setStatus('idle'); setMessage('') }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-3 rounded-full shadow-2xl shadow-blue-900/50 transition-all hover:-translate-y-0.5"
        aria-label="Upload resume to update portfolio"
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"/>
        </svg>
        Upload Resume
      </button>

      {/* Upload panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 glass rounded-2xl shadow-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Update Portfolio</h3>
              <p className="text-gray-400 text-xs mt-0.5">Drop your latest resume to regenerate content</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close upload panel"
              className="text-gray-500 hover:text-gray-300 transition-colors p-1"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
              </svg>
            </button>
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-label="Drop zone for resume file"
            onDragOver={e  => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => {
              e.preventDefault(); setDragging(false)
              const f = e.dataTransfer.files[0]
              if (f) upload(f)
            }}
            onClick={() => inputRef.current?.click()}
            onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragging
                ? 'border-blue-400 bg-blue-500/10'
                : 'border-gray-700 hover:border-gray-500 hover:bg-white/5'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx"
              className="sr-only"
              onChange={e => { const f = e.target.files?.[0]; if (f) upload(f) }}
            />
            {status === 'idle' && (
              <>
                <svg className="mx-auto mb-3 text-gray-500" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"/>
                </svg>
                <p className="text-sm text-gray-300 font-medium">Drop PDF or DOCX here</p>
                <p className="text-xs text-gray-500 mt-1">or click to browse</p>
              </>
            )}
            {status === 'uploading' && (
              <div className="flex flex-col items-center gap-2">
                <svg className="animate-spin text-blue-400" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <p className="text-sm text-blue-300">{message}</p>
              </div>
            )}
            {status === 'done' && (
              <div className="flex flex-col items-center gap-2">
                <svg className="text-green-400" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p className="text-sm text-green-300">{message}</p>
              </div>
            )}
            {status === 'error' && (
              <div className="flex flex-col items-center gap-2">
                <svg className="text-red-400" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
                </svg>
                <p className="text-sm text-red-300">{message}</p>
              </div>
            )}
          </div>

          <p className="text-gray-600 text-xs mt-3 text-center">
            Dev mode only · not visible in production
          </p>
        </div>
      )}
    </>
  )
}
