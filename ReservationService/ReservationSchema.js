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
   },
   phone: {
    type: Number,
    required: true,
  },
  reservation: {
    type: String,
    required: false
  },
  table_id: {
    type: String,
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
