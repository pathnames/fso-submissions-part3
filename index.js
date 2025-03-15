const express = require('express')
var morgan = require('morgan')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.static('dist'))

let data = [
    { 
      "id": 1, 
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

// Custom token to log request body
morgan.token('body', (req) => JSON.stringify(req.body))

// Custom Morgan format to match your desired output
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.use(express.json())

app.get('/', (request, response) => {
  return response.send('Hello Render!')
})
app.get('/api/persons', (request, response) => {
  return response.json(data)
})

app.get('/info', (request, response) => {
  return response.send(`<div><br/><p>Phonebook has info for ${data.length} people</p><p>${new Date().toString()}</p></div>`)
})

app.get('/api/persons/:id', (request, response) => {
  const id = parseInt(request.params.id)
  const person = data.find(person => person.id === id)
  if (!person) {
    return response.status(404).send('Person not found')
  }
  return response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = parseInt(request.params.id)
  const index = data.findIndex(person => person.id === id)
  if (index === -1) {
    return response.status(404).send('Person not found')
  }
  data.splice(index, 1)
  return response.status(200).send(`Person with id ${id} deleted`)
})

app.post('/api/persons', (request, response) => {
  const { name, number } = request.body

  if (!name || !number) {
    return response.status(400).json({ error: 'Name and number are required' })
  }

  const personExists = data.some(person => person.name === name)
  if (personExists) {
    return response.status(409).json({ error: 'Name must be unique' })
  }

  const id = Math.floor(Math.random() * 1000000) + 1
  const newPerson = { "id": id, "name": name, "number": number }
  data.push(newPerson)
  return response.status(201).json(newPerson)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
