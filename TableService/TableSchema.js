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
  active: {
    type: Boolean,
    required: false,
  },
  slots: [
    {
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
       phone: {
         type: Number,
         required: false
       },
       created_at: {
         type: String,
         required: true,
       }
     }
   ],
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
