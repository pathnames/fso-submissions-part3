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
app.get('/api/persons', (req, res, next) => {
  Phonebook.find({})
    .then(phonebook => res.json(phonebook))
    .catch(error => next(error))
})

// Info page
app.get('/info', (req, res, next) => {
  Phonebook.countDocuments()
    .then(count => res.send(`<div><p>Phonebook has info for ${count} people</p><p>${new Date()}</p></div>`))
    .catch(error => next(error))
})

// Get person by ID
app.get('/api/persons/:id', (req, res, next) => {
  Phonebook.findById(req.params.id)
    .then(person => {
      if (!person) return res.status(404).json({ error: 'Person not found' })
      res.json(person)
    })
    .catch(error => next(error))
})

// Delete person
app.delete('/api/persons/:id', (req, res, next) => {
  Phonebook.findByIdAndDelete(req.params.id)
    .then(result => {
      if (!result) return res.status(404).json({ error: 'Person not found' })
      res.status(200).json({ message: `Person with id ${req.params.id} deleted` })
    })
    .catch(error => next(error))
})

// Add new person
app.post('/api/persons', (req, res, next) => {
  const { name, number } = req.body
  if (!name || !number) return res.status(400).json({ error: 'Name and number are required' })

  Phonebook.findOne({ name })
    .then(existingPerson => {
      if (existingPerson) {
        return res.status(409).json({ error: 'Name must be unique' })
      }

      const newPerson = new Phonebook({ name, number })
      return newPerson.save()
    })
    .then(savedPerson => res.status(201).json(savedPerson))
    .catch(error => next(error))
})

// Update existing person
app.put('/api/persons/:id', (req, res, next) => {
  const { number } = req.body

  if (!number) {
    return res.status(400).json({ error: 'Number is required' })
  }

  Phonebook.findByIdAndUpdate(
    req.params.id,
    { number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      if (!updatedPerson) {
        return res.status(404).json({ error: 'Person not found' })
      }
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})

// Error handling middleware
const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') return res.status(400).json({ error: 'Malformatted ID' })
  if (error.name === 'ValidationError') return res.status(400).json({ error: error.message })
  if (error.name === 'MongoServerError' && error.code === 11000) return res.status(409).json({ error: 'Duplicate key error: Name must be unique' })
  if (error.name === 'TypeError') return res.status(400).json({ error: 'Invalid data type' })

  res.status(500).json({ error: 'Internal Server Error' })
}
app.use(errorHandler)

const PORT = 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
