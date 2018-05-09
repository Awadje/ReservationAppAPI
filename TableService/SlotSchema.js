module.exports = mongoose => {
 const SlotSchema = new mongoose.Schema({
  slot_start: {
    type: Number,
    required: false
  },
  slot_end: {
    type: Number,
    required: false
  },
   slot_date: {
     type: String,
     required: false
   }
 },
 {
   timestamps: true
 })

 return mongoose.model('Slot', SlotSchema)

}
