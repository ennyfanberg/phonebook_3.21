const express = require('express')
const app = express()
const morgan = require('morgan')
require('dotenv').config()
const cors = require('cors')
require('./models/person')
const Person = require('./models/person')

const PORT = process.env.PORT || 3001

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())



morgan.token('request-body', (req) => {
    if (req.method === 'POST' ){
    return JSON.stringify(req.body)
}
return ''
    })

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :request-body'))

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(persons => {
    if (persons){
        response.json(persons)
    } else {
        response.status(404).end()
    }
     }).catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person){
        response.json(person)
    } else {
        response.status(404).end()
    }
  }).catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  // if (body.name.length < 3 || body.number.length < 8) {
  //   return response.status(400).json({ error: 'name must be at least 3 characters and number must be at least 8 characters' })
  // }

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'name or number missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
     }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const {id} = request.params
  const { number} = request.body

  Person.findByIdAndUpdate(id, { number }, { new: true}).then(updatedPerson => {
    if (updatedPerson){
        response.json(updatedPerson)
    } else {
        response.status(404).end()
    }
  }).catch(error => next(error))
})   

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
      } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } 

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})