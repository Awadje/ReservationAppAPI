const Table = require('./TableSchema')

module.exports = mongoose => {
 const SlotSchema = new mongoose.Schema({
  table_id: {
    type: String,
    required: false
  },
  slot_start: {
    type: Number,
    required: false
  },
  slot_end: {
    type: Number,
    required: false
  },
  slot_time: {
     type: String,
     required: false
   },
   slot_date: {
     type: String,
     required: false
   },
   tables: {
     type: Object,
     ref: Table,
     required: false
   },
   created_at: {
     type: String,
     required: false,
   }
 },
 {
   timestamps: true
 })

 return mongoose.model('Slot', SlotSchema)

}
