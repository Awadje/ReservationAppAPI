module.exports = mongoose => {
 const TableSchema = new mongoose.Schema({
   id: {
     type: String,
     required: true
   },
   name: {
     type: String,
     required: true
   },
   location: {
     type: String,
     required: true,
   },
   properties: {
    type: Number,
    required: true,
  },
  size: {
    type: Number,
    required: true
  },
  available: {
    type: Boolean,
    required: true,
  },
  flex: {
    type: Number,
    required: true,
  }
 },
 {
   timestamps: true
 })

 return mongoose.model('Table', TableSchema)

}
