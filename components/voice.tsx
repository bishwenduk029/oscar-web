import { useReactMediaRecorder } from "react-media-recorder-2"

import { createOnSpeechEnd } from "@/lib/speech-manager"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Microphone, Square } from "@phosphor-icons/react"

const VoicePromptPanel = ({ handlePromptSubmit, showOptions }) => {
  const [isRecoding, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [value, setValue] = useState(null)
  const onSpeechEnd = createOnSpeechEnd(setValue, setIsLoading)
  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    error,
    clearBlobUrl,
  } = useReactMediaRecorder({
    audio: true,
    onStop: async (url, audio) => {
      await onSpeechEnd(audio)
    },
  })

  useEffect(() => {
    showOptions(true)
  }, [])

  useEffect(() => {
    if (value) {
      handlePromptSubmit(value)
      return
    }
    return () => {
      clearBlobUrl()
    }
  }, [value])

  const handleSpeechEnd = (
    isRecoding: boolean,
    setIsRecording,
    stopRecording: () => void,
    startRecording: () => void
  ) => {
    if (isRecoding) {
      setIsRecording(false)
      stopRecording()
      setIsLoading(true)
      return
    }
    startRecording()
    setIsRecording(true)
  }

  return (
    <div className="flex flex-col items-center justify-center border-green-200 w-full h-full min-h-[450px]">
      {isRecoding && (
        <div className="flex flex-col items-center justify-center p-4 border-green-200 w-full h-3/4 space-y-5">
          <div className="font-extrabold text-lg">OscarAI is listening... </div>
          <div className="relative inline-flex w-[100px] h-[100px] rounded-full bg-sky-400 opacity-75">
            <span className="animate-ping inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
          </div>
        </div>
      )}
      <Button
        variant="outline"
        disabled={isLoading}
        className="bg-green-200 hover:bg-green-300 rounded-full p20 h-20 w-20"
        onClick={() => {
          handleSpeechEnd(
            isRecoding,
            setIsRecording,
            stopRecording,
            startRecording
          )
        }}
      >
        {isRecoding ? (
          <Square size={50} weight="fill" color="red" />
        ) : (
          <Microphone size={50} color="#000" weight="duotone" />
        )}
      </Button>
      {isLoading && (
        <span className="animate-pulse m-2 text-lg">Transcribing....</span>
      )}
    </div>
  )
}

export default VoicePromptPanel;
