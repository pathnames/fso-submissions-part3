const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const Phonebook = require('./models/phonebook')
const app = express()

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

// Custom Morgan token to log request body
morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// Get all persons
app.get('/api/persons', (request, response) => {
  Phonebook.find({})
    .then(phonebook => response.json(phonebook))
    .catch(error => {
      console.error(`Error fetching phonebook: ${error.message}`)
      response.status(500).json({ error: 'Internal server error' })
    })
})

// Info page
app.get('/info', (request, response) => {
  Phonebook.countDocuments()
    .then(count => {
      response.send(`<div><p>Phonebook has info for ${count} people</p><p>${new Date()}</p></div>`)
    })
    .catch(error => {
      console.error(`Error fetching count: ${error.message}`)
      response.status(500).json({ error: 'Internal server error' })
    })
})

// Get person by ID
app.get('/api/persons/:id', (request, response) => {
  Phonebook.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).json({ error: 'Person not found' })
      }
      response.json(person)
    })
    .catch(error => {
      console.error(`Error fetching person: ${error.message}`)
      response.status(400).json({ error: 'Invalid ID format' })
    })
})

// Delete person
app.delete('/api/persons/:id', (request, response) => {
  Phonebook.findByIdAndDelete(request.params.id)
    .then(result => {
      if (!result) {
        return response.status(404).json({ error: 'Person not found' })
      }
      response.status(200).json({ message: `Person with id ${request.params.id} deleted` })
    })
    .catch(error => {
      console.error(`Error deleting person: ${error.message}`)
      response.status(400).json({ error: 'Invalid ID format' })
    })
})

// Add new person
app.post('/api/persons', (request, response) => {
  const { name, number } = request.body

  if (!name || !number) {
    return response.status(400).json({ error: 'Name and number are required' })
  }

  Phonebook.findOne({ name })
    .then(existingPerson => {
      if (existingPerson) {
        return response.status(409).json({ error: 'Name must be unique' })
      }

      const newPerson = new Phonebook({ name, number })
      return newPerson.save()
    })
    .then(savedPerson => {
      response.status(201).json(savedPerson)
    })
    .catch(error => {
      console.error(`Error saving person: ${error.message}`)
      response.status(500).json({ error: 'Internal server error' })
    })
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
