const Slot = require('./SlotSchema')

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
  },
  slots: {
    type: Object,
    ref: Slot,
    required: false
  },
  active: {
    type: Boolean,
    required: false,
  },
  flex: {
    type: Number,
    required: false,
  }
 },
 {
   timestamps: true
 })

 return mongoose.model('Table', TableSchema)

}
