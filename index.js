const express = require('express')
const app = express()

let data = [
    { 
      "id": "1", 
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
  return response.json(data)
})

app.get('/info', (request, response) => {
  return response.send(`<div><br/><p>Phonebook has info for ${data.length} people</p><p>${new Date().toString()}</p></div>`)
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = data.find(person => person.id === id)
  if (!person) {
    return response.status(404).send('Person not found')
  }
  return response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const index = data.findIndex(person => person.id === id)
  if (index === -1) {
    return response.status(404).send('Person not found')
  }
  data.splice(index, 1)
  return response.json(data)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
