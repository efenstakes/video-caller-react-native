
// include external libraries
import mongoose, { Schema } from 'mongoose'



const accountschema = new mongoose.Schema({

    name: {
        type: String,
        unique: true,
        required: true,
    },
    
    email: {
        type: String,
        unique: true,
        required: true,
    },
    
    password: {
        type: String,
        required: true,
    },
    
    joinedOn: {
        type: Date,
        default: Date.now()
    },
        
}, {
    collation: { locale: 'en_US', strength: 2 }
})


const AccountsModel = mongoose.model('Accounts', accountschema)
export default AccountsModel