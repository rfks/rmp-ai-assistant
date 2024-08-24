'use client'

import { Grid, Box, Button, Stack, TextField } from '@mui/material'
import { useState,useRef,useEffect } from 'react'

import Image from "next/image";

export default function Home() {

  const [prof,setProf] = useState(
    {
      "professor": "",
      "review": "",
      "subject": "",
      "stars": ""
    })
  const updateProf = async () => {
    setProf({
      "professor": "",
      "review": "",
      "subject": "",
      "stars": ""
    })
    if (!prof) {
      return
    }
    const response = fetch('api/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{content: prof}])
    })
    console.log(response)
  }

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm the Rate My Professor support assistant. How can I help you today?`,
    },
  ])
  const [message, setMessage] = useState('')

  const sendMessage = async () => {
    setMessage('')
    setMessages((messages) => [
      ...messages,
      {role: 'user', content: message},
      {role: 'assistant', content: ''},
    ])

    const response = fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, {role: 'user', content: message}]),
    }).then(async (res) => {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let result = ''

      return reader.read().then(function processText({done, value}) {
        if (done) {
          return result
        }
        const text = decoder.decode(value || new Uint8Array(), {stream: true})
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            {...lastMessage, content: lastMessage.content + text},
          ]
        })
        return reader.read().then(processText)
      })
    })
  }

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
      scrollToBottom()
  }, [messages])

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        padding={2}
      >
        <TextField
          fullWidth
          placeholder="Professor Name"
          value={prof.professor}
          name="professor"
          onChange={(e) => setProf({...prof,[e.target.name]:e.target.value})}
        />
        <TextField
          fullWidth
          placeholder="Review"
          value={prof.review}
          name="review"
          onChange={(e) => setProf({...prof,[e.target.name]:e.target.value})}
        />
        <TextField
          fullWidth
          placeholder="Subject"
          value={prof.subject}
          name="subject"
          onChange={(e) => setProf({...prof,[e.target.name]:e.target.value})}
        />
        <TextField
          fullWidth
          placeholder="Stars 1-5"
          value={prof.stars}
          name="stars"
          onChange={(e) => setProf({...prof,[e.target.name]:e.target.value})}
        />
        <Button
          variant="contained"
          onClick={updateProf}
        >
          Update
        </Button>
      </Box>
      </Grid>
      <Grid item xs={12} md={6}>
      <Stack
        direction={'column'}
        width="500px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'primary.main'
                    : 'secondary.main'
                }
                color="white"
                borderRadius={16}
                p={3}
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>
      </Grid>
      </Grid>
    </Box>
  )  
}
