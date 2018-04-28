module.exports = mongoose => {
 const SlotSchema = new mongoose.Schema({
  slot_id: {
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
   created_at: {
     type: String,
     required: true,
   }
 },
 {
   timestamps: true
 })

 return mongoose.model('Slot', SlotSchema)

}
