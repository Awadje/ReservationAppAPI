module.exports = mongoose => {
 const UserSchema = new mongoose.Schema({
   firstname: {
     type: String,
     required: false
   },
   lastname: {
     type: String,
     required: false
   },
   email: {
     type: String,
     required: true,
     unique: true
   },
   mobile: {
    type: Number,
    required: true,
    unique: true
  },
   password: {
     type: String,
     required: false
   },
   role: {
    type: String,
    required: false
  }
 },
 {
   timestamps: true
 })

 return mongoose.model('User', UserSchema)

}
