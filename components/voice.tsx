"use client"

import * as PhosphorIcons from "@phosphor-icons/react"
import { useKeyPress } from "ahooks"
import { useEffect, useRef, useState } from "react"
import { useReactMediaRecorder } from "react-media-recorder"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Command, CommandInput } from "@/components/ui/command"
import { useToast } from "@/components/ui/use-toast"
import { createOnSpeechEnd } from "@/lib/speech-manager"

import PromptPanel from "."
import type { IEditOption, IPrompt } from ".."

const promptFetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) {
        throw new Error("Network response was not ok")
      }
      return r.json()
    })
    .then((data) => data?.prompt as IPrompt)

interface PromptEditPanelProps {
  inputPrompt: IEditOption
  content: string
  sessionToken: string
}

const VoicePromptPanel: React.FC<PromptEditPanelProps> = ({
  inputPrompt,
  content,
  sessionToken
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const promptInputRef = useRef<HTMLTextAreaElement>(null)
  const [isRecoding, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [value, setValue] = useState(null)
  const { toast } = useToast()
  const [isTextBoxInFocus, setIsTextBoxInFocus] = useState(false)
  const onSpeechEnd = createOnSpeechEnd(sessionToken, setValue, setIsLoading)
  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    error,
    clearBlobUrl
  } = useReactMediaRecorder({
    audio: true,
    onStop: async (url, audio) => {
      await onSpeechEnd(audio)
    }
  })

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

  if (error) {
    toast({
      title: "OscarAI is unable to listen to your voice.",
      description:
        "Something went wrong. Please feel free to drop a mail to us at oscarai.copilot@gmail.com"
    })
    console.error("Oh no", error)
    return
  }

  useEffect(() => {
    if (value) {
      goTo(PromptPanel, {
        sessionToken,
        inputPrompt,
        content: value
      })
      return
    }
    return () => {
      clearBlobUrl()
    }
  }, [value])

  useKeyPress("enter", () => {
    handleSpeechEnd(isRecoding, setIsRecording, stopRecording, startRecording)
    return
  })

  useKeyPress("backspace", async () => {
    if (isTextBoxInFocus) {
      return
    }
    goBack()
  })

  return (
    <div
      className=" font-Fraunces outline-none dark rounded-lg flex flex-col justify-content w-[750px] h-[600px] bg-opacity-50"
      id="myDiv">
      <Command className="border-white shadow-inner">
        <CommandInput
          placeholder={inputPrompt ? `${inputPrompt.title}` : "Ask Oscar to..."}
          ref={inputRef}
          autoFocus
          onFocus={() => setIsTextBoxInFocus(false)}
          routeChange={true}
          className="text-lg mx-0.5 my-1"
          isLoading={false}
          disabled={true}
        />

        <div className="flex flex-col items-center justify-center border-green-200 w-full h-full">
          {isRecoding && (
            <div className="flex flex-col items-center justify-center p-4 border-green-200 w-full h-3/4 space-y-5">
              <div className="font-extrabold text-lg">
                OscarAI is listening...{" "}
              </div>
              <div className="relative inline-flex w-[100px] h-[100px] rounded-full bg-sky-400 opacity-75">
                <span className="animate-ping inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              </div>
            </div>
          )}
          <Button
            variant="outline"
            size="icon"
            disabled={isLoading}
            className="bg-green-200 rounded-full p20 h-20 w-20"
            onClick={() => {
              handleSpeechEnd(
                isRecoding,
                setIsRecording,
                stopRecording,
                startRecording
              )
            }}>
            {isRecoding ? (
              <PhosphorIcons.Square size={50} weight="fill" color="red" />
            ) : (
              <PhosphorIcons.Microphone
                size={50}
                color="#000"
                weight="duotone"
              />
            )}
          </Button>
          {isLoading && (
            <span className="animate-pulse m-2 text-lg">Transcribing....</span>
          )}
        </div>
      </Command>
      <div className="flex flex-row w-full justify-between bg-slate-900 items-center px-5 border-t-2 border-green-200">
        <Badge
          variant="secondary"
          className="px-2 m-3 flex flex-row align-middle">
          <PhosphorIcons.Brain
            size={24}
            className="simple-icon"
            weight="duotone"
          />
          <span className="mx-2">Oscar AI</span>
        </Badge>

        {!error && (
          <Badge variant="secondary" className="px-2">
            <PhosphorIcons.KeyReturn
              size={24}
              className="simple-icon mr-2"
              weight="duotone"
            />
            <span className="cursor-pointer">
              {isRecoding ? "Hit enter to stop" : "Hit enter to record"}
            </span>
          </Badge>
        )}
      </div>
    </div>
  )
}

export default VoicePromptPanel
