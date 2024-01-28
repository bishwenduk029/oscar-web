"use client"

import { Fragment, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import * as PhosphorIcons from "@phosphor-icons/react"
import React from "@vercel/analytics/react"
import { useCompletion } from "ai/react"
import { useSession } from "next-auth/react"
import TextareaAutosize from "react-textarea-autosize"
import useSWR from "swr"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

// ts-ignore
const VoicePromptPanel = dynamic(() => import("@/components/voice"), {
  ssr: false, // This will disable server-side rendering for this import
})

export interface IEditOption {
  key: string
  title: string
  icon: (color: any) => JSX.Element
  category: string
  categoryTitle: string
  isTemplateEditable?: boolean
}

export interface IPrompt {
  id: string
  title: string
  category: string
  icon: string
  prompt?: string
  categoryTitle: string
  isTemplateEditable?: boolean
}

interface ColorCombo {
  [key: string]: string
}

export interface OnTextCallbackResult {
  // response content
  text: string
  // cancel for fetch
  cancel: () => void
}

const colorCombo: ColorCombo = {
  oscar_tone: "#c5f7f4",
  oscar_edit: "#fff8ad",
  oscar_voice: "#c5f7f4",
}

export interface CategorizedPrompts {
  prompts: IEditOption[]
  title: string
}

function categorizePrompts(
  prompts: IEditOption[]
): Record<string, CategorizedPrompts> {
  return prompts.reduce((acc, prompt) => {
    if (!acc[prompt.category]) {
      acc[prompt.category] = { prompts: [], title: prompt.categoryTitle }
    }
    acc[prompt.category].prompts.push(prompt)
    return acc
  }, {} as Record<string, CategorizedPrompts>)
}

const promptsFetcher = (url: string) => {
  return fetch(url, {
    credentials: "include",
  })
    .then((r) => {
      if (!r.ok) {
        throw new Error("Network response was not ok")
      }
      return r.json()
    })
    .then((data) => {
      return data.prompts as IPrompt[]
    })
}

const promptFetcher = (url: string) =>
  fetch(url, {
    credentials: "include",
  })
    .then((r) => {
      if (!r.ok) {
        throw new Error("Network response was not ok")
      }
      return r.json()
    })
    .then((data) => data?.prompt as IPrompt)

export default function IndexPage() {
  const { data: session } = useSession()
  const [showOptions, setShowOptions] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [showClearOption, setShowClearOption] = useState(false)
  const [screensStack, setScreensStack] = useState(["default"])
  const commandInputRef = useRef<HTMLInputElement>(null)
  const [inputPrompt, setInputPrompt] = useState<IEditOption | null>(null)
  const { data: prompts, error } = useSWR<IPrompt[]>(
    `/api/prompts`,
    promptsFetcher
  )
  const { completion, complete, isLoading, setCompletion } = useCompletion({
    api: `/api/generate`,
    credentials: "include",
  })

  // Function to navigate forward
  const navigateForward = (componentName) => {
    setScreensStack((stack) => [...stack, componentName])
  }

  // Function to navigate backward
  const navigateBackward = () => {
    if (screensStack.length > 1) {
      setScreensStack((stack) => stack.slice(0, -1))
    }
    if (screensStack[screensStack.length - 1] === "default") {
      setInputPrompt(null)
    }
  }

  useEffect(() => {
    if (commandInputRef.current) {
      commandInputRef.current.value = inputPrompt?.title || ""
    }
  }, [inputPrompt])

  useEffect(() => {
    if (commandInputRef.current) {
      commandInputRef.current.value = inputPrompt?.title || ""
    }
  }, [])

  const editOptions: IEditOption[] =
    prompts?.map<IEditOption>((prompt) => ({
      key: prompt.id,
      title: prompt.title,
      icon: convertIconToFunction(prompt.icon, colorCombo[prompt.category]),
      category: prompt.category,
      categoryTitle: prompt.categoryTitle,
      isTemplateEditable: prompt.isTemplateEditable,
    })) || []

  const oscarAIMenu = categorizePrompts(editOptions)

  const handlePrompt = () => {
    setShowOptions(false)
    if (commandInputRef.current) {
      commandInputRef.current.blur()
    }
    if (
      inputPrompt?.isTemplateEditable ||
      inputPrompt?.category === "oscar_voice"
    ) {
      return
    }
    const content = inputRef.current?.value || ""
    return complete(content, {
      body: {
        promptID: inputPrompt?.key || null,
      },
      headers: {
        "Content-Type": "application/json",
      },
    })
  }

  // Render the current component
  const renderCurrentComponent = () => {
    const currentComponent = screensStack[screensStack.length - 1] || "default"
    switch (currentComponent) {
      case "editPromptForm":
        return (
          <EditPromptForm
            showOptions={setShowOptions}
            inputPrompt={inputPrompt}
            handlePromptSubmit={(editedPrompt: string) => {
              setShowOptions(false)
              if (commandInputRef.current) {
                commandInputRef.current.blur()
              }

              const content =
                editedPrompt + "\n" + (inputRef.current?.value || "")
              return complete(content, {
                body: {
                  promptID: null,
                },
                headers: {
                  "Content-Type": "application/json",
                },
              })
            }}
          />
        )
      case "voicePromptPanel":
        return (
          <VoicePromptPanel
            showOptions={setShowOptions}
            handlePromptSubmit={(transcribedText: string) => {
              setShowOptions(false)
              if (commandInputRef.current) {
                commandInputRef.current.blur()
              }

              if (!inputPrompt) {
                return
              }

              if (
                inputPrompt.key === "audio_notes" ||
                inputPrompt.key === "audio_summary"
              ) {
                const content = transcribedText || ""
                return complete(content, {
                  body: {
                    promptID: inputPrompt?.key,
                  },
                })
              }

              const content =
                transcribedText + "\n" + (inputRef.current?.value || "")
              return complete(content, {
                body: {
                  promptID: null,
                },
                headers: {
                  "Content-Type": "application/json",
                },
              })
            }}
          />
        )

      default:
        return (
          <CommandList className="sm:p-4 h-full scrollbar-hide">
            <CommandEmpty
              onSelect={() => {
                setShowOptions(false)
                if (commandInputRef.current) {
                  commandInputRef.current.blur()
                }
                const userInstructions = commandInputRef.current?.value || ""

                let content = userInstructions

                if (inputRef.current?.value.length !== 0) {
                  content += "\nContent is: " + inputRef.current?.value || ""
                }
                return complete(content, {
                  body: {
                    promptID: inputPrompt?.key || null,
                  },
                  headers: {
                    "Content-Type": "application/json",
                  },
                })
              }}
            >
              Custom Instructions
            </CommandEmpty>
            {Object.entries(oscarAIMenu).map(
              ([categoryKey, categorizedPrompt]) => (
                <Fragment key={categoryKey}>
                  <CommandGroup
                    key={categoryKey}
                    heading={categorizedPrompt.title}
                  >
                    {categorizedPrompt.prompts.map((editItem) => {
                      return (
                        <PromptCommandItem
                          key={editItem.key}
                          onSelect={handlePromptSelection(categorizedPrompt)}
                          icon={editItem.icon}
                          title={editItem.title}
                          disabled={false}
                        />
                      )
                    })}
                  </CommandGroup>
                  <CommandSeparator color="white" />
                </Fragment>
              )
            )}
          </CommandList>
        )
    }
  }

  return (
    <div className="sm:container sm:mx-auto w-full h-full mt-5 rounded-full">
      <div className="grid w-full gap-1.5 h-full">
        <div className="grid mb-2 text-lg gap-1.5 w-11/12 sm:w-3/4 mx-auto">
          <Label htmlFor="message" className="text-lg font-bold">
            Your Content:
          </Label>
          <Textarea
            ref={inputRef}
            className=" border-2 h-40 text-lg"
            placeholder="Type or Paste your content here."
            onChange={() => setShowClearOption(true)}
            id="message"
          />
        </div>
        {completion.length !== 0 && (
          <TextareaAutosize
            contentEditable={false}
            className="-mb-3 pb-6 w-full mx-auto text-lg h-[400px] bg-slate-800 sm:w-11/12 p-4 text-white rounded-xl"
            minRows={0}
            maxRows={20}
            value={completion}
          />
        )}
        <Command className="rounded-xl text-white border shadow-upward bg-slate-900 m-3 sm:m-0">
          <CommandInput
            ref={commandInputRef}
            isSourceScreen={screensStack[screensStack.length - 1] === "default"}
            placeholder="Ask OscarAI to..."
            handleback={() => navigateBackward()}
            handleEdit={(e) => {
              e.preventDefault()
              if (inputRef.current) {
                inputRef.current.value = ""
              }
              commandInputRef.current?.blur()
              setShowOptions(false)
              setShowClearOption(false)
              setCompletion("")
            }}
            showCopyOption={completion.length !== 0}
            handleCopy={(e) => {
              e.preventDefault()
              navigator.clipboard.writeText(completion)
              return toast({
                title: "Copied Successfully",
                description: "Now you can paste anywhere",
              })
            }}
            isLoading={isLoading}
            showClearOption={
              showClearOption || inputRef.current?.value.length !== 0
            }
            onFocus={() => {
              setShowOptions(true)
            }}
          />
          {showOptions && renderCurrentComponent()}
        </Command>
      </div>
    </div>
  )

  function handlePromptSelection(
    categorizedPrompt: CategorizedPrompts
  ): (newValue: string) => void {
    return (newValue) => {
      const promptObject = categorizedPrompt.prompts.find(
        (editOption) =>
          editOption.title.toLowerCase() === newValue.toLowerCase()
      )
      if (!promptObject) {
        return
      }

      setInputPrompt(promptObject)
      if (commandInputRef.current) {
        commandInputRef.current.value = promptObject?.title || ""
      }

      if (promptObject?.isTemplateEditable) {
        navigateForward("editPromptForm")
        return
      }

      if (promptObject?.category === "oscar_voice") {
        navigateForward("voicePromptPanel")
        return
      }

      return handlePrompt()
    }
  }
}

interface PromptCommandItemProps {
  disabled: boolean
  key: string
  onSelect: (newValue: string) => void
  icon: (color: string) => React.ReactNode
  title: string
}

const PromptCommandItem: React.FC<PromptCommandItemProps> = ({
  disabled,
  onSelect,
  icon,
  title,
}) => {
  return (
    <CommandItem
      className=" my-1 text-white hover:bg-slate-500"
      disabled={disabled}
      onSelect={onSelect}
    >
      {icon(colorCombo[title])}
      <PromptCommand>{title}</PromptCommand>
    </CommandItem>
  )
}

const PromptCommand = ({ children }: { children: string }) => {
  return (
    <span className="tracking-tight text-lg ml-3 text-inherit w-full">
      {children}
    </span>
  )
}

const convertIconToFunction = (
  iconName: string,
  iconColor: string
): ((color: string) => JSX.Element) => {
  const IconComponent = (PhosphorIcons as any)[iconName]
  if (!IconComponent) {
    // Handle the case where the icon name does not match any Phosphor icon
    // eslint-disable-next-line react/display-name
    return () => <div>Unknown Icon</div>
  }
  // eslint-disable-next-line react/display-name
  return (color) => (
    <IconComponent size={20} color={iconColor} weight="duotone" />
  )
}

const EditPromptForm = ({ inputPrompt, handlePromptSubmit, showOptions }) => {
  const [value, setValue] = useState("")
  const { data, error, isLoading } = useSWR<IPrompt>(
    inputPrompt ? `/api/prompts/${inputPrompt.key}` : null,
    promptFetcher
  )

  useEffect(() => {
    showOptions(true)
  }, [])

  return (
    <div className="flex flex-col p-4 border-green-200 w-full h-full">
      <div className="font-extrabold text-lg">Edit Below Prompt: </div>
      {data?.prompt && (
        <>
          <textarea
            className="dark scrollbar-hide prose md:prose-lg lg:prose-xl w-full h-full p-1 resize-none bg-slate-900 my-4 text-white"
            value={value || data?.prompt}
            onChange={(e) => {
              setValue(e.currentTarget.value)
            }}
          />
          <Button
            className="bg-green-300 text-black text-lg hover:bg-green-200"
            onClick={() => handlePromptSubmit(value)}
          >
            Submit
          </Button>
        </>
      )}
    </div>
  )
}
