const Slot = require('./SlotSchema')

module.exports = mongoose => {
 const ReservationSchema = new mongoose.Schema({
   id: {
     type: String,
     required: false
   },
   name: {
     type: String,
     required: false
   },
   email: {
     type: String,
     required: true,
     unique: true
   },
   phone: {
    type: Number,
    required: true,
    unique: true
  },
  reservation: {
    type: String,
    required: false
  },
   slots: {
     type: Object,
     ref: Slot,
     required: false
   },
   created_at: {
    type: Date,
    required: false
  }
 },
 {
   timestamps: true
 })

 return mongoose.model('Reservation', ReservationSchema)

}
