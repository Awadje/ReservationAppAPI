module.exports = mongoose => {
 const TableSchema = new mongoose.Schema({
   id: {
     type: String,
     required: false
   },
   name: {
     type: String,
     required: false
   },
   location: {
     type: String,
     required: false,
   },
   properties: {
    type: Number,
    required: false,
  },
  size: {
    type: Number,
    required: false
  },
  available: {
    type: Boolean,
    required: false,
  }
 },
 {
   timestamps: true
 })

 return mongoose.model('Table', TableSchema)

}