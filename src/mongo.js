const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://fullstack:${password}@cluster0.ge5aq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const phonebookSchema = new mongoose.Schema({
    name: String, 
    number: String
})

const phoneBook = mongoose.model('phoneBook', phonebookSchema)

if (process.argv.length === 3) {
    console.log('phonebook:')
    phoneBook.find({}).then(entries => {
        entries.forEach(entry => console.log(`${entry.name} ${entry.number}`))
        mongoose.connection.close()
    })
} else {
    const newEntry = new phoneBook({ name, number })

    newEntry.save().then(() => {
        console.log(`Added ${name} number ${number} to phonebook`)
        mongoose.connection.close()
    })
}
